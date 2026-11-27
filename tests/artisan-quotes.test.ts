import { describe, expect, it } from "vitest";
import { classifyArtisanQuote, normalizeQuoteTab } from "@/lib/artisan-quotes";

describe("classifyArtisanQuote", () => {
  it("classifies open request without bid or with withdrawn bid as pending", () => {
    expect(classifyArtisanQuote("SENT_TO_ARTISANS", null)).toBe("pending");
    expect(classifyArtisanQuote("ARTISANS_BIDDING", undefined)).toBe("pending");
    expect(classifyArtisanQuote("ARTISANS_BIDDING", { status: "WITHDRAWN" })).toBe("pending");
  });

  it("classifies accepted bid in BUYER_ACCEPTED or IN_PRODUCTION as active", () => {
    expect(classifyArtisanQuote("BUYER_ACCEPTED", { status: "ACCEPTED" })).toBe("active");
    expect(classifyArtisanQuote("IN_PRODUCTION", { status: "ACCEPTED" })).toBe("active");
  });

  it("classifies submitted pending bid, delivered, cancelled, expired, or rejected bids as history", () => {
    expect(classifyArtisanQuote("ARTISANS_BIDDING", { status: "PENDING" })).toBe("history");
    expect(classifyArtisanQuote("DELIVERED", { status: "ACCEPTED" })).toBe("history");
    expect(classifyArtisanQuote("IN_PRODUCTION", { status: "REJECTED" })).toBe("history");
    expect(classifyArtisanQuote("CANCELLED", null)).toBe("history");
  });
});

describe("normalizeQuoteTab", () => {
  it("normalizes valid tabs and defaults unknown values to all", () => {
    expect(normalizeQuoteTab("pending")).toBe("pending");
    expect(normalizeQuoteTab("active")).toBe("active");
    expect(normalizeQuoteTab("history")).toBe("history");
    expect(normalizeQuoteTab("unknown")).toBe("all");
    expect(normalizeQuoteTab(undefined)).toBe("all");
  });
});
