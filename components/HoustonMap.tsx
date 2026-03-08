'use client';

import { useEffect, useRef } from 'react';
import type { Restaurant }   from '@/data/restaurants';

interface Props {
  locations: Restaurant[];
  selected:  string | null;
  onSelect:  (id: string) => void;
  isDark?:   boolean;
}

declare global { interface Window { L: any } }

const TILES = {
  light: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
  dark:  'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
};
const ATTRIBUTION =
  '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> © <a href="https://carto.com/">CARTO</a>';

function renderDistinctions(d: Restaurant['distinctions']): string {
  if (!d) return '';
  const parts: string[] = [];

  if (d.michelin === 'star') {
    parts.push(`<span style="display:inline-flex;align-items:center;gap:3px;"><span style="color:#E8003D;font-size:13px;">✦</span><span style="color:#2E5E8E;font-size:11px;font-weight:600;">Michelin Star</span></span>`);
  }
  if (d.michelin === 'bibgourmand') {
    parts.push(`<span style="display:inline-flex;align-items:center;gap:3px;"><span style="color:#E8003D;font-size:13px;">Ⓑ</span><span style="color:#2E5E8E;font-size:11px;font-weight:600;">Bib Gourmand</span></span>`);
  }
  if (d.michelin === 'recommended') {
    parts.push(`<span style="color:#2E5E8E;font-size:11px;font-weight:600;">Michelin Recommended</span>`);
  }
  if (d.jamesBeard) {
    d.jamesBeard.forEach((jb) => {
      const yrs   = Array.isArray(jb.year) ? jb.year.join(', ') : String(jb.year);
      const label = jb.type === 'winner'    ? `James Beard Winner — ${jb.category} (${yrs})`
                  : jb.type === 'finalist'  ? `James Beard Finalist — ${jb.category} (${yrs})`
                  : jb.type === 'semifinalist' ? `James Beard Semifinalist — ${jb.category} (${yrs})`
                  :                           `James Beard Nominated — ${jb.category} (${yrs})`;
      parts.push(`<span style="color:#2E5E8E;font-size:11px;font-weight:600;">${label}</span>`);
    });
  }
  if (d.texasMonthlyBBQ) {
    parts.push(`<span style="color:#2E5E8E;font-size:11px;font-weight:600;">Texas Monthly Top 50 BBQ</span>`);
  }

  if (!parts.length) return '';
  return `<div style="margin-top:6px;display:flex;flex-direction:column;gap:3px;">${parts.join('')}</div>`;
}

function buildPopupHtml(loc: Restaurant): string {
  const distinctions = renderDistinctions(loc.distinctions);
  return `
    <div style="font-family:system-ui,sans-serif;min-width:200px;padding:4px 2px;">
      <p style="margin:0 0 2px;font-size:14px;font-weight:700;color:#2C1810;">${loc.name}</p>
      <p style="margin:0 0 2px;font-size:11px;color:#A8502A;font-weight:600;text-transform:uppercase;letter-spacing:.06em;">${loc.cuisine}</p>
      <p style="margin:0 0 6px;font-size:11px;color:#9A8A78;">${loc.neighborhood} · ${loc.price}</p>
      <p style="margin:0 0 8px;font-size:11px;color:#9A8A78;">${loc.address}</p>
      ${distinctions}
      ${loc.note ? `<p style="margin:${distinctions ? '8' : '0'}px 0 0;font-size:11px;color:#7A6248;font-style:italic;border-left:2px solid #E2D8CC;padding-left:6px;">"${loc.note}"</p>` : ''}
    </div>`;
}

export default function HoustonMap({ locations, selected, onSelect, isDark = false }: Props) {
  const containerRef   = useRef<HTMLDivElement>(null);
  const mapRef         = useRef<any>(null);
  const tileRef        = useRef<any>(null);
  const markersRef     = useRef<Record<string, any>>({});
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    function initMap() {
      const L = window.L;
      if (!L || !containerRef.current) return;
      if (mapRef.current) return;

      const map = L.map(containerRef.current, {
        center: [29.7480, -95.3850], zoom: 12, zoomControl: false,
      });
      mapRef.current = map;
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      tileRef.current = L.tileLayer(isDark ? TILES.dark : TILES.light, {
        attribution: ATTRIBUTION, maxZoom: 19, subdomains: 'abcd',
      }).addTo(map);

      locations.forEach((loc) => {
        const iconHtml = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36">
          <path d="M14 0C6.268 0 0 6.268 0 14c0 9.94 14 22 14 22S28 23.94 28 14C28 6.268 21.732 0 14 0z" fill="#A8502A" stroke="#fff" stroke-width="1.5"/>
          <circle cx="14" cy="14" r="5" fill="#fff"/>
        </svg>`;
        const icon   = L.divIcon({ html: iconHtml, className: '', iconSize: [28,36], iconAnchor: [14,36], popupAnchor: [0,-38] });
        const marker = L.marker([loc.lat, loc.lng], { icon });
        marker.bindPopup(buildPopupHtml(loc), { maxWidth: 300, className: 'mg-popup' });
        marker.on('click', () => onSelect(loc.id));
        marker.addTo(map);
        markersRef.current[loc.id] = marker;
      });
    }

    if (window.L) { initMap(); return; }

    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css'; link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = initMap;
    document.head.appendChild(script);

    return () => {
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
      markersRef.current = {};
      initializedRef.current = false;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!tileRef.current) return;
    tileRef.current.setUrl(isDark ? TILES.dark : TILES.light);
  }, [isDark]);

  useEffect(() => {
    if (!mapRef.current || !selected) return;
    const marker = markersRef.current[selected];
    if (!marker) return;
    const loc = locations.find((l) => l.id === selected);
    if (loc) mapRef.current.flyTo([loc.lat, loc.lng], 15, { duration: 0.9 });
    setTimeout(() => marker.openPopup(), 600);
  }, [selected, locations]);

  return (
    <>
      <style>{`
        .mg-popup .leaflet-popup-content-wrapper { border-radius:12px; box-shadow:0 4px 28px rgba(44,24,16,.16); padding:0; border:1px solid #E2D8CC; }
        .mg-popup .leaflet-popup-content { margin:14px 16px; }
        .mg-popup .leaflet-popup-tip { background:#fff; }
        .leaflet-control-zoom a { color:#2C1810 !important; border-color:#E2D8CC !important; background:rgba(237,232,223,0.95) !important; backdrop-filter:blur(4px); }
        .leaflet-control-zoom a:hover { background:#E5DED3 !important; }
      `}</style>
      <div ref={containerRef} className="w-full h-full" aria-label="Houston locations map" style={{ minHeight: 400 }} />
    </>
  );
}
