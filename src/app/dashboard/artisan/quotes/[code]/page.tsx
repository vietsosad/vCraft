import { notFound } from "next/navigation";
import { pageRequireRole } from "@/lib/auth/guards";
import { getQuoteForUser } from "@/lib/services/quotation-service";
import { AppError } from "@/lib/errors";
import { QuoteRoom } from "@/components/quotes/quote-room";
import type { QuoteView } from "@/components/quotes/types";

export default async function ArtisanQuotePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const user = await pageRequireRole(`/dashboard/artisan/quotes/${code}`, "ARTISAN");
  try {
    const quote = await getQuoteForUser(user, code);
    return <QuoteRoom initial={JSON.parse(JSON.stringify(quote)) as QuoteView} />;
  } catch (err) {
    if (err instanceof AppError && (err.status === 403 || err.status === 404)) notFound();
    throw err;
  }
}
