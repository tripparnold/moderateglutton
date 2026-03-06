'use client';

import { useEffect, useRef } from 'react';

export interface Location {
  id:       string;
  name:     string;
  address:  string;
  category: string;
  note:     string;
  lat:      number;
  lng:      number;
}

interface Props {
  locations: Location[];
  selected:  string | null;
  onSelect:  (id: string) => void;
  isDark?:   boolean;
}

declare global {
  interface Window { L: any }
}

// CartoDB tile URLs — clean, minimal, no API key required
const TILES = {
  light: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
  dark:  'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
};
const TILE_ATTRIBUTION =
  '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> © <a href="https://carto.com/">CARTO</a>';

export default function HoustonMap({ locations, selected, onSelect, isDark = false }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef       = useRef<any>(null);
  const markersRef   = useRef<Record<string, any>>({});
  const tileRef      = useRef<any>(null);

  // ── Init map once ────────────────────────────────────────────
  useEffect(() => {
    if (mapRef.current) return;

    function initMap() {
      const L = window.L;
      if (!L || !containerRef.current) return;

      const map = L.map(containerRef.current, {
        center:      [29.7480, -95.3850],
        zoom:        13,
        zoomControl: false,
        attributionControl: true,
      });
      mapRef.current = map;

      // Zoom control — clean position
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Tile layer — CartoDB light (minimal, clean)
      tileRef.current = L.tileLayer(isDark ? TILES.dark : TILES.light, {
        attribution: TILE_ATTRIBUTION,
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map);

      // Add markers
      addMarkers(L, map);
    }

    if (window.L) { initMap(); return; }

    // Load Leaflet CSS
    if (!document.getElementById('leaflet-css')) {
      const link   = document.createElement('link');
      link.id      = 'leaflet-css';
      link.rel     = 'stylesheet';
      link.href    = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    // Load Leaflet JS
    const script  = document.createElement('script');
    script.src    = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = initMap;
    document.head.appendChild(script);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Swap tiles when dark mode changes ───────────────────────
  useEffect(() => {
    if (!mapRef.current || !tileRef.current) return;
    const L = window.L;
    if (!L) return;
    tileRef.current.setUrl(isDark ? TILES.dark : TILES.light);
  }, [isDark]);

  // ── Marker creation ──────────────────────────────────────────
  function addMarkers(L: any, map: any) {
    locations.forEach((loc) => {
      // Custom SVG pin marker
      const iconHtml = `
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36">
          <path d="M14 0C6.268 0 0 6.268 0 14c0 9.94 14 22 14 22S28 23.94 28 14C28 6.268 21.732 0 14 0z"
                fill="#A8502A" stroke="#fff" stroke-width="1.5"/>
          <circle cx="14" cy="14" r="5" fill="#fff"/>
        </svg>`;

      const icon = L.divIcon({
        html:        iconHtml,
        className:   '',
        iconSize:    [28, 36],
        iconAnchor:  [14, 36],
        popupAnchor: [0, -36],
      });

      const marker = L.marker([loc.lat, loc.lng], { icon });

      marker.bindPopup(
        `<div style="
          font-family: system-ui, sans-serif;
          min-width: 180px;
          padding: 4px 2px;
        ">
          <p style="margin:0 0 3px; font-size:13px; font-weight:600; color:#2C1810;">${loc.name}</p>
          <p style="margin:0 0 2px; font-size:11px; color:#2E5E8E; font-weight:500; text-transform:uppercase; letter-spacing:.06em;">${loc.category}</p>
          <p style="margin:0 0 6px; font-size:11px; color:#9A8A78;">${loc.address}</p>
          ${loc.note ? `<p style="margin:0; font-size:11px; color:#7A6248; font-style:italic; border-left:2px solid #E2D8CC; padding-left:6px;">"${loc.note}"</p>` : ''}
        </div>`,
        { maxWidth: 260, className: 'mg-popup' }
      );

      marker.on('click', () => onSelect(loc.id));
      marker.addTo(map);
      markersRef.current[loc.id] = marker;
    });
  }

  // ── Pan + open popup on selection ───────────────────────────
  useEffect(() => {
    if (!mapRef.current || !selected) return;
    const marker = markersRef.current[selected];
    if (!marker) return;
    const loc = locations.find((l) => l.id === selected);
    if (loc) {
      mapRef.current.flyTo([loc.lat, loc.lng], 15, { duration: 0.9 });
    }
    setTimeout(() => marker.openPopup(), 500);
  }, [selected, locations]);

  return (
    <>
      {/* Leaflet popup overrides — clean minimal style */}
      <style>{`
        .mg-popup .leaflet-popup-content-wrapper {
          border-radius: 10px;
          box-shadow: 0 4px 24px rgba(44,24,16,0.14);
          padding: 0;
          border: 1px solid #E2D8CC;
        }
        .mg-popup .leaflet-popup-content {
          margin: 12px 14px;
        }
        .mg-popup .leaflet-popup-tip {
          background: #fff;
        }
        .leaflet-control-zoom a {
          color: #2C1810 !important;
          border-color: #E2D8CC !important;
          background: #EDE8DF !important;
        }
        .leaflet-control-zoom a:hover {
          background: #E5DED3 !important;
        }
      `}</style>
      <div
        ref={containerRef}
        className="w-full h-full"
        aria-label="Houston locations map"
        style={{ minHeight: 400 }}
      />
    </>
  );
}
