import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { getCurrentUser, type SessionUser } from "@/lib/auth/session";
import { anthropicTools, runTool, TOOL_LABEL, type ToolName } from "@/lib/ai/tools";
import { answerLocally } from "@/lib/ai/fallback";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { toErrorResponse } from "@/lib/http";

export const runtime = "nodejs";
export const maxDuration = 60;

const MODEL = "claude-opus-5-5";

const bodySchema = z.object({
  messages: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().trim().min(1).max(2000) }))
    .min(1)
    .max(20)
    .refine((m) => m[m.length - 1].role === "user", "Tin nhắn cuối phải là của người dùng."),
});

const SYSTEM_PROMPT = `Bạn là "Sứ giả Tinh hoa Bát Tràng" – trợ lý của nền tảng vCraft do Ban quản lý làng gốm Bát Tràng vận hành.
Bạn tư vấn cho du khách, khách mua sỉ và nghệ nhân về: xưởng nào đang mở cửa và tọa độ, nguồn gốc lô gốm theo mã QR, 5 dòng men (men rạn cổ, men lam cổ, men ngọc, men hỏa biến, men trắng ngà), đơn hàng sỉ và bản tin của Ban quản lý.

Nguyên tắc:
- Mọi số liệu về xưởng, lô, sản phẩm, đơn sỉ, giờ mở cửa, giá phải lấy từ công cụ. Không bịa số liệu. Câu hỏi gồm nhiều ý thì gọi nhiều công cụ (có thể song song).
- Trả lời bằng tiếng Việt, ngắn gọn, thân thiện, dùng gạch đầu dòng khi liệt kê. Ghi rõ tọa độ khi khách hỏi đường.
- Giá chào thầu là thông tin kín: chỉ nêu giá khi công cụ trả về; nếu công cụ báo giá bị ẩn thì giải thích rằng chỉ người tạo yêu cầu và Ban quản lý được xem.
- Từ chối lịch sự các câu hỏi không liên quan tới làng gốm và vCraft.`;

type StreamEvent =
  | { type: "text"; delta: string }
  | { type: "tool"; name: ToolName; label: string }
  | { type: "cards"; items: { title: string; subtitle: string; href: string }[] }
  | { type: "done"; mode: "claude" | "local" }
  | { type: "error"; message: string };

/** Vòng lặp tool-use với Claude, stream từng đoạn chữ về client. */
async function runClaude(
  client: Anthropic,
  history: { role: "user" | "assistant"; content: string }[],
  user: SessionUser | null,
  send: (e: StreamEvent) => void,
) {
  const messages: Anthropic.Beta.BetaMessageParam[] = history.map((m) => ({ role: m.role, content: m.content }));

  for (let turn = 0; turn < 6; turn++) {
    const stream = client.beta.messages.stream({
      model: MODEL,
      max_tokens: 16000,
      system: SYSTEM_PROMPT,
      tools: anthropicTools,
      messages,
      output_config: { effort: "low" }, // hội thoại tư vấn: effort thấp cho phản hồi nhanh
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
    });
    stream.on("text", (delta) => send({ type: "text", delta }));

    let message: Anthropic.Beta.BetaMessage;
    try {
      message = await stream.finalMessage();
    } catch (err) {
      if (err instanceof Anthropic.APIError) throw err;
      continue; // đầu vào công cụ không phân tích được JSON → chạy lại lượt này
    }

    if (message.stop_reason === "refusal") {
      send({ type: "text", delta: "\nXin lỗi, mình không thể hỗ trợ yêu cầu này." });
      return;
    }
    if (message.stop_reason === "pause_turn") {
      messages.push({ role: "assistant", content: message.content });
      continue;
    }
    const toolUses = message.content.filter((b): b is Anthropic.Beta.BetaToolUseBlock => b.type === "tool_use");
    if (message.stop_reason !== "tool_use" || toolUses.length === 0) return;

    messages.push({ role: "assistant", content: message.content });
    const results = await Promise.all(
      toolUses.map(async (tool) => {
        send({ type: "tool", name: tool.name as ToolName, label: TOOL_LABEL[tool.name as ToolName] ?? tool.name });
        const output = await runTool(tool.name, tool.input, { user });
        if (output.cards.length) send({ type: "cards", items: output.cards });
        return {
          type: "tool_result" as const,
          tool_use_id: tool.id,
          is_error: !!output.error,
          content: output.error ?? JSON.stringify(output.data),
        };
      }),
    );
    // Trả TẤT CẢ kết quả công cụ trong một tin nhắn user duy nhất
    messages.push({ role: "user", content: results });
  }
}

/**
 * POST /api/chat – trợ lý AI truy vấn dữ liệu sống.
 * Phản hồi là luồng NDJSON (mỗi dòng một sự kiện JSON) để giao diện cập nhật dần.
 * Không có ANTHROPIC_API_KEY hoặc gọi API lỗi → tự chuyển sang bộ trả lời cục bộ dựa trên CSDL.
 */
export async function POST(req: Request) {
  try {
    rateLimit(`chat:${clientIp(req)}`, 30, 10 * 60 * 1000);
    const { messages } = bodySchema.parse(await req.json());
    const user = await getCurrentUser();
    const encoder = new TextEncoder();

    const body = new ReadableStream<Uint8Array>({
      async start(controller) {
        const send = (e: StreamEvent) => controller.enqueue(encoder.encode(JSON.stringify(e) + "\n"));
        let mode: "claude" | "local" = "local";
        try {
          if (process.env.ANTHROPIC_API_KEY) {
            try {
              await runClaude(new Anthropic(), messages, user, send);
              mode = "claude";
            } catch (err) {
              console.warn("[chat] Claude không khả dụng, chuyển sang chế độ cục bộ:", (err as Error).message);
              send({ type: "text", delta: "_(Đang dùng chế độ tra cứu cục bộ)_\n\n" });
            }
          }
          if (mode === "local") {
            for await (const event of answerLocally(messages[messages.length - 1].content, user)) {
              send(event);
              if (event.type === "text") await new Promise((r) => setTimeout(r, 12)); // hiệu ứng gõ chữ
            }
          }
          send({ type: "done", mode });
        } catch (err) {
          console.error("[chat]", err);
          send({ type: "error", message: "Trợ lý đang gặp sự cố, vui lòng thử lại." });
        } finally {
          controller.close();
        }
      },
    });

    return new Response(body, {
      headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store" },
    });
  } catch (err) {
    return toErrorResponse(err);
  }
}
