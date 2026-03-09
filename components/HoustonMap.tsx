'use client';

import { useEffect, useRef } from 'react';
import type { Restaurant }   from '@/data/restaurants';

interface Props {
  locations:    Restaurant[];
  selected:     string | null;
  onSelect:     (id: string) => void;
  isDark?:      boolean;
  isWantToTry?: boolean;
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

  // Michelin — icon inline via unicode approximations for the popup context
  if (d.michelin === 'star') {
    parts.push(`<span style="display:inline-flex;align-items:center;gap:3px;background:#fde8ec;border:1px solid #fbb8c6;border-radius:999px;padding:1px 7px;">` +
      `<span style="color:#E8003D;font-size:12px;line-height:1;">✦</span>` +
      `<span style="color:#C8002D;font-size:10px;font-weight:700;">Michelin Star</span></span>`);
  }
  if (d.michelin === 'bibgourmand') {
    parts.push(`<span style="display:inline-flex;align-items:center;gap:3px;background:#fde8ec;border:1px solid #fbb8c6;border-radius:999px;padding:1px 7px;">` +
      `<span style="color:#E8003D;font-size:12px;line-height:1;">☺</span>` +
      `<span style="color:#C8002D;font-size:10px;font-weight:700;">Bib Gourmand</span></span>`);
  }
  if (d.michelin === 'recommended') {
    parts.push(`<span style="display:inline-flex;align-items:center;background:#fff3f4;border:1px solid #f9d0d6;border-radius:999px;padding:1px 7px;">` +
      `<span style="color:#B8002A;font-size:10px;font-weight:600;">In Michelin Guide</span></span>`);
  }
  if (d.jamesBeard) {
    d.jamesBeard.forEach((jb) => {
      const yr    = Array.isArray(jb.year) ? `'${String(jb.year[jb.year.length-1]).slice(-2)}` : `'${String(jb.year).slice(-2)}`;
      const level = jb.type === 'winner' ? 'Winner' : jb.type === 'finalist' ? 'Finalist' : jb.type === 'semifinalist' ? 'Semifinalist' : 'Nominated';
      const label = jb.chefAward ? `Chef: JB ${level} ${yr}` : `JB ${level} ${yr}`;
      const amberBg = jb.chefAward ? '#fffbeb' : '#fef3c7';
      const amberBd = jb.chefAward ? '#fde68a' : '#f59e0b';
      const amberTx = jb.chefAward ? '#92400e' : '#78350f';
      parts.push(`<span style="display:inline-flex;align-items:center;background:${amberBg};border:1px solid ${amberBd};border-radius:999px;padding:1px 7px;">` +
        `<span style="color:${amberTx};font-size:10px;font-weight:700;">${label}</span></span>`);
    });
  }
  if (d.texasMonthlyBBQ) {
    parts.push(`<span style="display:inline-flex;align-items:center;background:#fff7ed;border:1px solid #fed7aa;border-radius:999px;padding:1px 7px;">` +
      `<span style="color:#c2410c;font-size:10px;font-weight:700;">Texas Monthly Top 50</span></span>`);
  }

  if (!parts.length) return '';
  return `<div style="margin-top:6px;display:flex;flex-direction:row;flex-wrap:wrap;gap:4px;">${parts.join('')}</div>`;
}

function buildPopupHtml(loc: Restaurant): string {
  const distinctions = renderDistinctions(loc.distinctions);
  const websiteLink = loc.website
    ? `<a href="${loc.website}" target="_blank" rel="noopener noreferrer" style="display:inline-block;margin-top:6px;font-size:11px;color:#2E5E8E;font-weight:600;text-decoration:none;">Visit Website ↗</a>`
    : '';
  return `
    <div style="font-family:system-ui,sans-serif;min-width:200px;padding:4px 2px;">
      <p style="margin:0 0 2px;font-size:14px;font-weight:700;color:#2C1810;">${loc.name}</p>
      <p style="margin:0 0 2px;font-size:11px;color:#2E5E8E;font-weight:600;text-transform:uppercase;letter-spacing:.06em;">${loc.cuisine}</p>
      <p style="margin:0 0 6px;font-size:11px;color:#9A8A78;">${loc.neighborhood} · ${loc.price}</p>
      <p style="margin:0 0 4px;font-size:11px;color:#9A8A78;">${loc.address}</p>
      ${websiteLink}
      ${distinctions}
    </div>`;
}

export default function HoustonMap({ locations, selected, onSelect, isDark = false, isWantToTry = false }: Props) {
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

      const pinColor = isWantToTry ? '#6B8FAB' : '#2E5E8E'; // lighter lapis for want-to-try
      locations.forEach((loc) => {
        const iconHtml = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36">
          <path d="M14 0C6.268 0 0 6.268 0 14c0 9.94 14 22 14 22S28 23.94 28 14C28 6.268 21.732 0 14 0z" fill="${pinColor}" stroke="#fff" stroke-width="1.5"/>
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
