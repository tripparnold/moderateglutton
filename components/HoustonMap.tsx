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
}

declare global {
  interface Window {
    L: any; // Leaflet global
  }
}

export default function HoustonMap({ locations, selected, onSelect }: Props) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef          = useRef<any>(null);
  const markersRef      = useRef<Record<string, any>>({});

  // Load Leaflet CSS + JS from CDN, then init map
  useEffect(() => {
    if (mapRef.current) return; // already initialized

    function initMap() {
      const L = window.L;
      if (!L || !mapContainerRef.current) return;

      const map = L.map(mapContainerRef.current, {
        center:    [29.7604, -95.3698],
        zoom:      12,
        zoomControl: false,
      });
      mapRef.current = map;

      // Zoom control — top right
      L.control.zoom({ position: 'topright' }).addTo(map);

      // OpenStreetMap tiles — no API key
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      // Markers
      locations.forEach((loc) => {
        const marker = L.circleMarker([loc.lat, loc.lng], {
          radius:      9,
          fillColor:   '#A8502A',
          color:       '#fff',
          weight:      2,
          opacity:     1,
          fillOpacity: 0.9,
        });

        marker.bindPopup(`
          <div style="font-family: system-ui, sans-serif; min-width: 160px;">
            <strong style="font-size: 14px; color: #2C1810;">${loc.name}</strong>
            <p style="margin: 4px 0 2px; font-size: 12px; color: #7A6248;">${loc.category}</p>
            <p style="margin: 0; font-size: 12px; color: #9A8A78;">${loc.address}</p>
            ${loc.note ? `<p style="margin: 6px 0 0; font-size: 12px; color: #2C1810; font-style: italic;">"${loc.note}"</p>` : ''}
          </div>
        `, { maxWidth: 240 });

        marker.on('click', () => onSelect(loc.id));
        marker.addTo(map);
        markersRef.current[loc.id] = marker;
      });
    }

    // Check if Leaflet already loaded
    if (window.L) {
      initMap();
      return;
    }

    // Load CSS
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id   = 'leaflet-css';
      link.rel  = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    // Load JS
    const script    = document.createElement('script');
    script.src      = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload   = initMap;
    document.head.appendChild(script);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Pan to selected location and open popup
  useEffect(() => {
    if (!mapRef.current || !selected) return;
    const marker = markersRef.current[selected];
    if (!marker) return;
    const loc = locations.find((l) => l.id === selected);
    if (loc) mapRef.current.flyTo([loc.lat, loc.lng], 15, { duration: 0.8 });
    marker.openPopup();
  }, [selected, locations]);

  return (
    <div
      ref={mapContainerRef}
      className="w-full h-full rounded-xl overflow-hidden"
      aria-label="Houston locations map"
      style={{ minHeight: 400 }}
    />
  );
}
