"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import Link from "next/link";
import { useEffect, useMemo, useRef } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap, ZoomControl } from "react-leaflet";
import { GLAZES } from "@/lib/constants";
import { formatVnd } from "@/lib/format";
import { TILE_ATTRIBUTION, TILE_URL } from "@/lib/map-tiles";
import type { MapHeritage, MapWorkshop } from "./types";

export const VILLAGE_CENTER: [number, number] = [20.9762, 105.9135];

/**
 * Ghim SVG hình chiếc bình gốm (L.divIcon) – không dùng ảnh marker mặc định của Leaflet nên
 * không bị lỗi mất file khi đóng gói. Xưởng đang mở cửa có vòng sóng men ngọc lan tỏa.
 */
function vaseIcon(open: boolean, active: boolean) {
  const fill = open ? "#3B6E5C" : "#8b8478";
  const ring = open
    ? `<span style="position:absolute;left:50%;top:62%;width:26px;height:26px;margin:-13px 0 0 -13px;border-radius:9999px;background:#3B6E5C;opacity:.5" class="animate-pulse-ring"></span>`
    : "";
  return L.divIcon({
    className: "",
    iconSize: [34, 44],
    iconAnchor: [17, 42],
    popupAnchor: [0, -38],
    html: `<div style="position:relative;width:34px;height:44px;transform:scale(${active ? 1.25 : 1});transition:transform .2s">${ring}
      <svg viewBox="0 0 34 44" width="34" height="44" style="position:relative;filter:drop-shadow(0 3px 4px rgba(24,22,21,.35))">
        <path d="M12 2h10v4c0 1.5 1 2.5 2.4 3.6C28 12.4 31 16.6 31 22c0 8.5-6.2 15-14 15S3 30.5 3 22c0-5.4 3-9.6 6.6-12.4C11 8.5 12 7.5 12 6z" fill="${fill}" stroke="#F9F6F0" stroke-width="2"/>
        <path d="M8 22c3 2.6 6 2.6 9 0s6-2.6 9 0" fill="none" stroke="#F9F6F0" stroke-width="1.6" stroke-linecap="round" opacity=".9"/>
        <path d="M17 37v6" stroke="${fill}" stroke-width="2"/>
      </svg></div>`,
  });
}

function heritageIcon(active: boolean) {
  return L.divIcon({
    className: "",
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -14],
    html: `<div style="width:30px;height:30px;transform:scale(${active ? 1.25 : 1});border-radius:6px;background:#B84A39;border:2px solid #F9F6F0;box-shadow:0 3px 6px rgba(24,22,21,.35);display:grid;place-items:center;color:#F9F6F0;font:600 13px var(--font-cormorant),serif">◆</div>`,
  });
}

/** Bay tới điểm đang được chọn và mở popup. */
function FlyTo({ focus, markers }: { focus: string | null; markers: React.RefObject<Map<string, L.Marker>> }) {
  const map = useMap();
  useEffect(() => {
    if (!focus) return;
    const marker = markers.current?.get(focus);
    if (marker) {
      map.flyTo(marker.getLatLng(), 17, { duration: 0.8 });
      setTimeout(() => marker.openPopup(), 850);
    }
  }, [focus, map, markers]);
  return null;
}

export default function VillageLeafletMap({
  workshops,
  heritage,
  focus,
  onSelect,
  onAskAi,
  myLocation,
}: {
  workshops: MapWorkshop[];
  heritage: MapHeritage[];
  focus: string | null;
  onSelect: (slug: string) => void;
  onAskAi: (question: string) => void;
  myLocation: [number, number] | null;
}) {
  const markers = useRef(new Map<string, L.Marker>());
  const meIcon = useMemo(
    () => L.divIcon({ className: "", iconSize: [18, 18], html: `<div style="width:18px;height:18px;border-radius:9999px;background:#1D3557;border:3px solid #fff;box-shadow:0 0 0 6px rgba(29,53,87,.2)"></div>` }),
    [],
  );

  return (
    <MapContainer center={VILLAGE_CENTER} zoom={15} zoomControl={false} scrollWheelZoom className="h-full w-full" aria-label="Bản đồ làng gốm Bát Tràng">
      <TileLayer attribution={TILE_ATTRIBUTION} url={TILE_URL} maxZoom={19} />
      <ZoomControl position="topright" />
      <FlyTo focus={focus} markers={markers} />

      {workshops.map((w) => (
        <Marker
          key={w.slug}
          position={[w.latitude, w.longitude]}
          icon={vaseIcon(w.openState.isOpenNow, focus === w.slug)}
          eventHandlers={{ click: () => onSelect(w.slug) }}
          ref={(m) => {
            if (m) markers.current.set(w.slug, m);
          }}
          title={w.workshopName}
          alt={w.workshopName}
        >
          <Popup>
            <div className="overflow-hidden">
              {w.coverImage && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={w.coverImage.src} alt="" className="h-28 w-full object-cover" />
              )}
              <div className="space-y-1.5 border-t-4 border-dashed border-kaolin bg-kaolin p-3.5">
                <p className="font-mono text-[10px] uppercase tracking-widest text-terracotta">Vé tham quan · {w.artisanTitle}</p>
                <p className="font-display text-xl leading-tight text-ink">{w.workshopName}</p>
                <p className="text-xs text-ash">{w.artisanName}</p>
                <p className={`text-xs font-medium ${w.openState.isOpenNow ? "text-celadon" : "text-ash"}`}>● {w.openState.label}</p>
                <p className="text-xs text-ink/80">
                  {w.specialties.map((s) => GLAZES[s].label).join(" · ")}
                  {w.experienceOffered && <><br />Trải nghiệm chuốt gốm: <strong>{formatVnd(w.experiencePriceVnd)}</strong></>}
                </p>
                <div className="grid grid-cols-2 gap-1.5 pt-1.5">
                  <Link href={`/artisans/${w.slug}`} className="rounded bg-terracotta px-2 py-1.5 text-center text-xs !text-kaolin">Xem xưởng</Link>
                  <a href={`https://www.google.com/maps/dir/?api=1&destination=${w.latitude},${w.longitude}`} target="_blank" rel="noreferrer" className="rounded border border-ink/20 px-2 py-1.5 text-center text-xs !text-ink">Chỉ đường</a>
                  <button onClick={() => onAskAi(`Xưởng ${w.workshopName} có đang mở cửa không, làm dòng men gì và nên đến lúc nào?`)} className="rounded border border-cobalt/30 px-2 py-1.5 text-xs text-cobalt">Hỏi AI về xưởng</button>
                  {w.acceptsWholesale ? (
                    <Link href="/b2b-quotes/new" className="rounded bg-cobalt px-2 py-1.5 text-center text-xs !text-kaolin">Gửi yêu cầu sỉ</Link>
                  ) : <span />}
                </div>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}

      {heritage.map((h) => (
        <Marker
          key={h.slug}
          position={[h.latitude, h.longitude]}
          icon={heritageIcon(focus === h.slug)}
          eventHandlers={{ click: () => onSelect(h.slug) }}
          ref={(m) => {
            if (m) markers.current.set(h.slug, m);
          }}
          title={h.name}
        >
          <Popup>
            <div>
              {h.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={h.image.src} alt="" className="h-28 w-full object-cover" />
              )}
              <div className="space-y-1.5 bg-kaolin p-3.5">
                <p className="font-mono text-[10px] uppercase tracking-widest text-terracotta">Điểm di sản</p>
                <p className="font-display text-xl leading-tight text-ink">{h.name}</p>
                <p className="text-xs text-ink/80">{h.description}</p>
                {h.openingHours && <p className="text-xs text-ash">Giờ mở cửa: {h.openingHours}</p>}
                {h.ticketInfo && <p className="text-xs text-ash">{h.ticketInfo}</p>}
                <a href={`https://www.google.com/maps/dir/?api=1&destination=${h.latitude},${h.longitude}`} target="_blank" rel="noreferrer" className="mt-1 block rounded border border-ink/20 px-2 py-1.5 text-center text-xs !text-ink">Chỉ đường</a>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}

      {myLocation && <Marker position={myLocation} icon={meIcon} title="Vị trí của bạn" />}
    </MapContainer>
  );
}
