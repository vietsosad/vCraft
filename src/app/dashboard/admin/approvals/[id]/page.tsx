import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPin, IdCard, Phone, Mail, CalendarDays } from "lucide-react";
import { getApplication } from "@/lib/services/admin-service";
import { asImages } from "@/lib/types";
import { GLAZES } from "@/lib/constants";
import { formatDate, formatCoord } from "@/lib/format";
import { NotFoundError } from "@/lib/errors";
import { Card, Badge } from "@/components/ui/primitives";
import { ApprovalActions } from "@/components/admin/approval-actions";

export default async function ApplicationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const app = await getApplication(id).catch((e) => {
    if (e instanceof NotFoundError) notFound();
    throw e;
  });
  const docs = asImages(app.proofDocuments);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
      <div className="space-y-6">
        <div>
          <Link href="/dashboard/admin/approvals" className="text-sm text-ash hover:text-ink">← Hàng đợi duyệt</Link>
          <h2 className="mt-2 text-3xl">{app.workshopName}</h2>
          <p className="text-ash">Dòng họ {app.clanName} · thành lập {app.establishedYear}</p>
        </div>
        <Card className="grid gap-4 p-6 text-sm sm:grid-cols-2">
          <p className="flex gap-2"><Mail className="size-4 text-ash" /> {app.user.name} · {app.user.email}</p>
          <p className="flex gap-2"><Phone className="size-4 text-ash" /> {app.user.phone ?? "—"}</p>
          <p className="flex gap-2"><IdCard className="size-4 text-ash" /> CCCD: <span className="font-mono">{app.nationalIdMasked ?? "—"}</span> <span className="text-xs text-ash">(đã giải mã AES-256-GCM, chỉ hiện một phần)</span></p>
          <p className="flex gap-2"><CalendarDays className="size-4 text-ash" /> Gửi lúc {formatDate(app.createdAt, true)}</p>
          <p className="flex gap-2 sm:col-span-2"><MapPin className="size-4 text-ash" /> {app.address} · <span className="font-mono">{formatCoord(app.latitude, app.longitude)}</span></p>
          <div className="flex flex-wrap gap-1.5 sm:col-span-2">{app.specialties.map((s) => <Badge key={s}>{GLAZES[s].label}</Badge>)}</div>
        </Card>
        <section>
          <h3 className="mb-3 text-2xl">Minh chứng ({docs.length})</h3>
          <p className="mb-3 text-xs text-ash">Ảnh được phục vụ qua endpoint riêng tư, chỉ tài khoản Ban quản lý xem được.</p>
          <div className="grid grid-cols-2 gap-3">
            {docs.map((d, i) => (
              <figure key={d.src + i}>
                {/* Ảnh riêng tư cần cookie phiên nên dùng thẻ img thường thay vì tối ưu ảnh của Next */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={d.src} alt={d.alt} className="aspect-[4/3] w-full rounded-[var(--radius-tile)] border border-line object-cover" />
                <figcaption className="mt-1 text-xs text-ash">{d.alt}</figcaption>
              </figure>
            ))}
          </div>
        </section>
        <section>
          <h3 className="mb-2 text-2xl">Giới thiệu của hộ</h3>
          <p className="whitespace-pre-line text-sm leading-relaxed text-ink/80">{app.familyHistory}</p>
        </section>
      </div>
      <aside className="lg:sticky lg:top-28 lg:self-start">
        <ApprovalActions id={app.id} status={app.verificationStatus} note={app.verificationNote} />
      </aside>
    </div>
  );
}
