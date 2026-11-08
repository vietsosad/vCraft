"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import { TILE_ATTRIBUTION, TILE_URL } from "@/lib/map-tiles";

const pin = L.divIcon({
  className: "",
  iconSize: [30, 40],
  iconAnchor: [15, 38],
  html: `<svg viewBox="0 0 30 40" width="30" height="40" style="filter:drop-shadow(0 3px 4px rgba(0,0,0,.35))"><path d="M15 1C7.3 1 1 7 1 14.6 1 25 15 39 15 39s14-14 14-24.4C29 7 22.7 1 15 1z" fill="#B84A39" stroke="#F9F6F0" stroke-width="2"/><circle cx="15" cy="14.5" r="5" fill="#F9F6F0"/></svg>`,
});

function ClickToMove({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({ click: (e) => onPick(e.latlng.lat, e.latlng.lng) });
  return null;
}

/** Bản đồ chọn vị trí xưởng: bấm vào bản đồ hoặc kéo ghim. */
export default function LocationPickerMap({ lat, lng, onPick }: { lat: number; lng: number; onPick: (lat: number, lng: number) => void }) {
  return (
    <MapContainer center={[lat, lng]} zoom={16} className="h-full w-full" scrollWheelZoom={false}>
      <TileLayer attribution={TILE_ATTRIBUTION} url={TILE_URL} />
      <ClickToMove onPick={onPick} />
      <Marker
        position={[lat, lng]}
        icon={pin}
        draggable
        eventHandlers={{ dragend: (e) => { const p = (e.target as L.Marker).getLatLng(); onPick(p.lat, p.lng); } }}
      />
    </MapContainer>
  );
}
