import { describe, expect, it } from "vitest";
import type { QuoteStatus } from "@prisma/client";
import { canTransition, nextStatus, QUOTE_TRANSITIONS, type QuoteEvent } from "@/lib/services/quote-machine";

const STATUSES = Object.keys(QUOTE_TRANSITIONS) as QuoteStatus[];
const EVENTS: QuoteEvent[] = ["send", "receiveBid", "accept", "startProduction", "deliver", "cancel"];

describe("Máy trạng thái báo giá", () => {
  it("đi đúng luồng chính 6 trạng thái", () => {
    let s: QuoteStatus = "DRAFT_REQUEST";
    for (const [event, expected] of [
      ["send", "SENT_TO_ARTISANS"],
      ["receiveBid", "ARTISANS_BIDDING"],
      ["accept", "BUYER_ACCEPTED"],
      ["startProduction", "IN_PRODUCTION"],
      ["deliver", "DELIVERED"],
    ] as const) {
      const next = nextStatus(s, event);
      expect(next).toBe(expected);
      s = next!;
    }
  });

  it("chỉ cho hủy trước khi chốt", () => {
    expect(canTransition("DRAFT_REQUEST", "cancel")).toBe(true);
    expect(canTransition("SENT_TO_ARTISANS", "cancel")).toBe(true);
    expect(canTransition("ARTISANS_BIDDING", "cancel")).toBe(true);
    expect(canTransition("BUYER_ACCEPTED", "cancel")).toBe(false);
    expect(canTransition("IN_PRODUCTION", "cancel")).toBe(false);
  });

  it("không cho nhảy cóc trạng thái", () => {
    expect(nextStatus("DRAFT_REQUEST", "accept")).toBeNull();
    expect(nextStatus("SENT_TO_ARTISANS", "accept")).toBeNull();
    expect(nextStatus("BUYER_ACCEPTED", "deliver")).toBeNull();
  });

  it("trạng thái kết thúc không có lối ra", () => {
    for (const event of EVENTS) {
      expect(nextStatus("DELIVERED", event)).toBeNull();
      expect(nextStatus("CANCELLED", event)).toBeNull();
    }
  });

  it("mọi cặp (trạng thái, sự kiện) đều có kết quả xác định", () => {
    let valid = 0;
    for (const s of STATUSES) for (const e of EVENTS) if (canTransition(s, e)) valid++;
    expect(valid).toBe(8); // 5 bước chính + 3 lối hủy
  });
});
