"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface Spot {
  name: string;
  lat: number;
  lng: number;
  type: string;
  desc: string;
}

const lodgeIcon = new L.DivIcon({
  html: `<div style="
    width:32px;height:32px;border-radius:50%;
    background:#1d1d1d;border:3px solid #c6c5b3;
    display:flex;align-items:center;justify-content:center;
    box-shadow:0 2px 8px rgba(0,0,0,0.3);
  "><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c6c5b3" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg></div>`,
  className: "",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const spotIcon = new L.DivIcon({
  html: `<div style="
    width:24px;height:24px;border-radius:50%;
    background:#5a7a6a;border:2px solid white;
    box-shadow:0 2px 6px rgba(0,0,0,0.3);
  "></div>`,
  className: "",
  iconSize: [24, 24],
  iconAnchor: [12, 24],
  popupAnchor: [0, -24],
});

export default function FishingMap({ spots }: { spots: Spot[] }) {
  return (
    <MapContainer
      center={[44.9, -116.1]}
      zoom={9}
      style={{ height: "100%", width: "100%" }}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        className="grayscale-tiles"
      />

      <Marker position={[45.244861, -116.330996]} icon={lodgeIcon}>
        <Popup>
          <div style={{ fontFamily: "var(--font-sans)", minWidth: 180 }}>
            <strong style={{ fontSize: 14 }}>The Last Resort Lodge</strong>
            <br />
            <span style={{ fontSize: 12, color: "#666" }}>5538 Hwy 95, New Meadows</span>
            <br />
            <a href="tel:2083011576" style={{ fontSize: 12 }}>(208) 301-1576</a>
          </div>
        </Popup>
      </Marker>

      {spots.map((spot) => (
        <Marker
          key={spot.name}
          position={[spot.lat, spot.lng]}
          icon={spotIcon}
        >
          <Popup>
            <div style={{ fontFamily: "var(--font-sans)", minWidth: 200, maxWidth: 280 }}>
              <strong style={{ fontSize: 14 }}>{spot.name}</strong>
              <br />
              <span style={{ fontSize: 11, color: "#8a8770", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {spot.type}
              </span>
              <br />
              <span style={{ fontSize: 12, color: "#555", lineHeight: 1.4, display: "block", marginTop: 4 }}>
                {spot.desc}
              </span>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
