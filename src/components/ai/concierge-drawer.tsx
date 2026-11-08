"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Sparkles, X, Send, Database, MapPin } from "lucide-react";
import { cn } from "@/lib/cn";

type Card = { title: string; subtitle: string; href: string };
type Msg = { role: "user" | "assistant"; content: string; tools?: string[]; cards?: Card[]; mode?: "claude" | "local" };

const SUGGESTIONS = [
  "Đơn 5.000 cốc của ĐH Công nghệ đang ở trạng thái nào, xưởng nào đang chào giá?",
  "Hôm nay xưởng men rạn nào đang mở cửa, tọa độ ở đâu?",
  "Kiểm tra nguồn gốc lô BT-2026-RAN-001",
  "Men lam và men ngọc khác nhau thế nào?",
  "Có thông báo cúp điện nào không?",
];

/** Hiển thị markdown tối giản an toàn: **đậm**, _nghiêng_, gạch đầu dòng. React tự escape nội dung. */
function renderRich(text: string): ReactNode[] {
  return text.split("\n").map((line, i) => {
    const bullet = line.startsWith("- ");
    const body = bullet ? line.slice(2) : line;
    const parts = body.split(/(\*\*[^*]+\*\*|_[^_]+_)/g).map((p, j) =>
      p.startsWith("**") ? <strong key={j}>{p.slice(2, -2)}</strong> : p.startsWith("_") && p.endsWith("_") && p.length > 2 ? <em key={j} className="text-ash">{p.slice(1, -1)}</em> : p,
    );
    if (bullet) return <li key={i} className="ml-4 list-disc">{parts}</li>;
    return line ? <p key={i}>{parts}</p> : <div key={i} className="h-2" />;
  });
}

/**
 * Ngăn kéo trợ lý AI "Sứ giả Tinh hoa Bát Tràng".
 * Đọc luồng NDJSON từ /api/chat bằng fetch + ReadableStream và cập nhật DOM theo từng đoạn chữ.
 */
export function ConciergeDrawer() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const onOpen = (e: Event) => {
      setOpen(true);
      const q = (e as CustomEvent<string>).detail;
      if (q) void ask(q);
    };
    window.addEventListener("vcraft:ask-ai", onOpen);
    return () => window.removeEventListener("vcraft:ask-ai", onOpen);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, busy]);

  async function ask(question: string) {
    const text = question.trim();
    if (!text || busy) return;
    const history = [...messages, { role: "user" as const, content: text }];
    setMessages([...history, { role: "assistant", content: "", tools: [], cards: [] }]);
    setInput("");
    setBusy(true);

    const update = (fn: (m: Msg) => Msg) =>
      setMessages((prev) => {
        const next = [...prev];
        next[next.length - 1] = fn(next[next.length - 1]);
        return next;
      });

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history.slice(-12).map(({ role, content }) => ({ role, content })) }),
      });
      if (!res.ok || !res.body) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.error?.message ?? "Không kết nối được trợ lý.");
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.trim()) continue;
          const e = JSON.parse(line);
          if (e.type === "text") update((m) => ({ ...m, content: m.content + e.delta }));
          else if (e.type === "tool") update((m) => ({ ...m, tools: [...(m.tools ?? []), e.label] }));
          else if (e.type === "cards") update((m) => ({ ...m, cards: [...(m.cards ?? []), ...e.items] }));
          else if (e.type === "done") update((m) => ({ ...m, mode: e.mode }));
          else if (e.type === "error") update((m) => ({ ...m, content: m.content + `\n${e.message}` }));
        }
      }
    } catch (err) {
      update((m) => ({ ...m, content: (err as Error).message }));
    } finally {
      setBusy(false);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void ask(input);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={cn(
          "no-print group fixed bottom-5 right-5 z-[600] flex size-14 items-center justify-center gap-2 rounded-full bg-cobalt text-kaolin shadow-lift transition-all hover:w-auto hover:bg-cobalt-soft hover:px-5",
          open && "pointer-events-none opacity-0",
        )}
        aria-label="Mở trợ lý AI vCraft"
      >
        <Sparkles className="size-5 text-ember" />
        <span className="hidden text-sm font-medium group-hover:inline">Hỏi Sứ giả AI</span>
      </button>

      <div
        className={cn("fixed inset-0 z-[700] bg-ink/30 transition-opacity", open ? "opacity-100" : "pointer-events-none opacity-0")}
        onClick={() => setOpen(false)}
        aria-hidden
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Trợ lý AI vCraft"
        className={cn(
          "fixed inset-y-0 right-0 z-[710] flex w-full max-w-md flex-col bg-kaolin shadow-lift transition-transform duration-300",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex items-center justify-between border-b border-line bg-cobalt px-5 py-4 text-kaolin">
          <div>
            <p className="font-display text-xl">Sứ giả Tinh hoa Bát Tràng</p>
            <p className="font-mono text-[10px] uppercase tracking-widest text-kaolin/70">AI tra cứu dữ liệu sống của làng</p>
          </div>
          <button onClick={() => setOpen(false)} aria-label="Đóng trợ lý" className="rounded-full p-1.5 hover:bg-white/10">
            <X className="size-5" />
          </button>
        </div>

        <div ref={listRef} className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
          {messages.length === 0 && (
            <div>
              <p className="text-sm text-ash">Hỏi bất cứ điều gì về xưởng, dòng men, nguồn gốc lô hay đơn sỉ. Thử một câu:</p>
              <div className="mt-3 flex flex-col gap-2">
                {SUGGESTIONS.map((s) => (
                  <button key={s} onClick={() => ask(s)} className="rounded-lg border border-line bg-white/70 px-3 py-2.5 text-left text-sm hover:border-terracotta/50">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((m, i) =>
            m.role === "user" ? (
              <div key={i} className="ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-terracotta px-4 py-2.5 text-sm text-kaolin">
                {m.content}
              </div>
            ) : (
              <div key={i} className="max-w-[95%] space-y-2">
                {!!m.tools?.length && (
                  <div className="flex flex-wrap gap-1.5">
                    {m.tools.map((t, j) => (
                      <span key={j} className="inline-flex items-center gap-1 rounded-full bg-cobalt/10 px-2 py-0.5 font-mono text-[10.5px] text-cobalt">
                        <Database className="size-3" /> {t}
                      </span>
                    ))}
                  </div>
                )}
                <div className="space-y-1 rounded-2xl rounded-bl-sm border border-line bg-white px-4 py-3 text-sm leading-relaxed">
                  {m.content ? renderRich(m.content) : <span className="inline-flex gap-1 text-ash">Đang tra cứu<span className="animate-pulse">…</span></span>}
                </div>
                {!!m.cards?.length && (
                  <div className="grid gap-1.5">
                    {m.cards.map((c, j) => (
                      <Link key={j} href={c.href} onClick={() => setOpen(false)} className="flex items-center gap-2.5 rounded-lg border border-line bg-bisque/60 px-3 py-2 hover:border-terracotta/50">
                        <MapPin className="size-4 shrink-0 text-terracotta" />
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium">{c.title}</span>
                          <span className="block truncate text-xs text-ash">{c.subtitle}</span>
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
                {m.mode && (
                  <p className="font-mono text-[10px] text-ash/70">
                    {m.mode === "claude" ? "Trả lời bởi Claude, số liệu từ CSDL vCraft" : "Chế độ tra cứu cục bộ – số liệu trực tiếp từ CSDL vCraft"}
                  </p>
                )}
              </div>
            ),
          )}
        </div>

        <form onSubmit={onSubmit} className="flex gap-2 border-t border-line bg-white/60 p-3">
          <label htmlFor="ai-input" className="sr-only">Câu hỏi cho trợ lý</label>
          <input
            id="ai-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            maxLength={2000}
            placeholder="Ví dụ: xưởng nào đang mở cửa?"
            className="flex-1 rounded-full border border-line bg-white px-4 py-2.5 text-sm focus:border-terracotta focus:outline-none"
          />
          <button type="submit" disabled={busy || !input.trim()} className="grid size-11 place-items-center rounded-full bg-terracotta text-kaolin disabled:opacity-40" aria-label="Gửi câu hỏi">
            <Send className="size-4" />
          </button>
        </form>
      </aside>
    </>
  );
}

/** Mở trợ lý từ bất kỳ đâu (ví dụ nút "Hỏi AI về xưởng này" trên bản đồ). */
export function askConcierge(question: string) {
  window.dispatchEvent(new CustomEvent("vcraft:ask-ai", { detail: question }));
}
