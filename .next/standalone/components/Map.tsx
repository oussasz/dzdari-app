"use client";

import React, { useEffect, useMemo, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import algeriaBounds from "@/data/algeria-bounds.json";

interface MapProps {
  center?: number[];
}

const ALGERIA_BOUNDS = algeriaBounds as unknown as L.LatLngBoundsExpression;
const ALGERIA_CENTER: L.LatLngExpression = [28.0, 2.8];
const DEFAULT_ZOOM = 5;
const FOCUS_ZOOM = 10;

/**
 * Create a stable icon instance.
 * We use explicit URLs instead of modifying L.Icon.Default.prototype
 * to avoid issues with React Strict Mode double-mounting.
 */
const createMarkerIcon = () =>
  new L.Icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl:
      "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

/** Fly to new center when it changes */
function ChangeView({
  center,
  zoom,
}: {
  center: L.LatLngExpression;
  zoom: number;
}) {
  const map = useMap();
  const prevCenterRef = useRef<string>("");

  useEffect(() => {
    if (!map) return;

    const centerKey = JSON.stringify(center);
    // Only fly if center actually changed
    if (prevCenterRef.current !== centerKey) {
      prevCenterRef.current = centerKey;
      map.flyTo(center, zoom, { duration: 0.5 });
    }
  }, [map, center, zoom]);

  return null;
}

const Map: React.FC<MapProps> = ({ center }) => {
  const mapCenter: L.LatLngExpression =
    (center as L.LatLngExpression) || ALGERIA_CENTER;
  const zoom = center ? FOCUS_ZOOM : DEFAULT_ZOOM;

  // Create icon once and memoize it
  const markerIcon = useMemo(() => createMarkerIcon(), []);

  // Create a stable key for the map to prevent remounting when center is undefined vs defined
  // But change key when we need to reset the map (never in this case)
  const mapKey = "algeria-map";

  return (
    <MapContainer
      key={mapKey}
      center={ALGERIA_CENTER}
      zoom={DEFAULT_ZOOM}
      scrollWheelZoom={false}
      maxBounds={ALGERIA_BOUNDS}
      maxBoundsViscosity={1.0}
      minZoom={DEFAULT_ZOOM}
      className="h-full rounded-lg"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ChangeView center={mapCenter} zoom={zoom} />
      {center && (
        <Marker position={center as L.LatLngExpression} icon={markerIcon} />
      )}
    </MapContainer>
  );
};

export default Map;
