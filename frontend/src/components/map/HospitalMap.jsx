// ─── HospitalMap.jsx (fixed) ──────────────────────────────────────────────────
// Fixes:
//  1. Map mouse/interaction broken → removed stale closure traps, proper dep arrays
//  2. Double-init guard improved (key prop on wrapper forces remount cleanly)
//  3. Nearby load slow → Overpass query fires ONCE on open + debounced on moveend
//     (500ms debounce, skips if panned <2km)
//  4. Routing only starts when selectedHospital exists, cleans up on change

import { useEffect, useRef, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet's broken default icon path in bundlers (Vite/CRA)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:       "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:     "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";
const SEARCH_RADIUS = 15000; // 15 km

// Build Overpass query (hospitals + clinics within radius)
const buildQuery = (lat, lng) => `
[out:json][timeout:25];
(
  node["amenity"="hospital"](around:${SEARCH_RADIUS},${lat},${lng});
  way["amenity"="hospital"](around:${SEARCH_RADIUS},${lat},${lng});
  node["healthcare"="hospital"](around:${SEARCH_RADIUS},${lat},${lng});
  node["amenity"="clinic"](around:${SEARCH_RADIUS},${lat},${lng});
);
out center;
`;

export default function HospitalMap({ center, savedHospitals = [], selectedHospital, onAddHospital }) {
  const mapRef         = useRef(null);
  const mapInstance    = useRef(null);
  const nearbyLayer    = useRef(null);
  const savedLayer     = useRef(null);
  const userMarker     = useRef(null);
  const routeLine      = useRef(null);
  const watchId        = useRef(null);
  const lastFetchPos   = useRef(null); // track where we last fetched to skip tiny pans
  const fetchTimer     = useRef(null);

  // ── Helper: load nearby hospitals from Overpass ───────────────────────────
  const loadNearby = useCallback(async (lat, lng) => {
    // Skip if we fetched from within 2 km already
    if (lastFetchPos.current) {
      const d = Math.hypot(lat - lastFetchPos.current.lat, lng - lastFetchPos.current.lng);
      if (d < 0.018) return; // ~2km in degrees
    }
    lastFetchPos.current = { lat, lng };

    try {
      const res  = await fetch(OVERPASS_URL, { method: "POST", body: buildQuery(lat, lng) });
      const data = await res.json();
      if (!data.elements || !nearbyLayer.current) return;

      nearbyLayer.current.clearLayers();

      data.elements.forEach(h => {
        const hLat = h.lat ?? h.center?.lat;
        const hLng = h.lon ?? h.center?.lon;
        if (!hLat || !hLng) return;

        const marker = L.marker([hLat, hLng]).addTo(nearbyLayer.current);

        // Store id on marker so popup button can reference it
        marker._osmId = h.id;
        marker._osmData = {
          id:             h.id,
          name:           h.tags?.name || "Unnamed Hospital",
          lat:            hLat,
          lng:            hLng,
          address:        h.tags?.["addr:full"] || h.tags?.["addr:street"] || "OSM Data",
          contact_number: h.tags?.phone || "N/A",
        };

        marker.bindPopup(`
          <div style="font-family:sans-serif;min-width:160px">
            <strong style="font-size:13px">${marker._osmData.name}</strong><br/>
            <span style="font-size:11px;color:#888">${marker._osmData.address}</span><br/>
            <button data-osm="${h.id}"
              style="margin-top:8px;padding:5px 12px;background:#1a233a;color:white;border:none;border-radius:6px;cursor:pointer;font-size:12px;width:100%">
              ＋ Add to Database
            </button>
          </div>
        `);

        // Use event delegation so the button always works even after re-render
        marker.on("popupopen", () => {
          const btn = document.querySelector(`[data-osm="${h.id}"]`);
          if (btn) btn.onclick = () => onAddHospital(marker._osmData);
        });
      });
    } catch (err) {
      console.warn("Overpass fetch failed:", err);
    }
  }, [onAddHospital]);

  // ── Init map (runs once) ──────────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = L.map(mapRef.current, {
      // These options ensure mouse events work correctly
      tap: false,               // fixes touch issues on some browsers
      zoomControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
      maxZoom: 18,
    }).addTo(map);

    nearbyLayer.current = L.layerGroup().addTo(map);
    savedLayer.current  = L.layerGroup().addTo(map);

    map.setView([center.lat, center.lng], 12);
    mapInstance.current = map;

    // Initial nearby load
    loadNearby(center.lat, center.lng);

    // Debounced reload on pan/zoom (500ms, avoids hammering Overpass)
    map.on("moveend", () => {
      clearTimeout(fetchTimer.current);
      fetchTimer.current = setTimeout(() => {
        const c = map.getCenter();
        loadNearby(c.lat, c.lng);
      }, 500);
    });

    return () => {
      clearTimeout(fetchTimer.current);
      if (watchId.current) navigator.geolocation.clearWatch(watchId.current);
      map.remove();
      mapInstance.current = null;
    };
  }, []); // intentionally empty — init once only

  // ── Pan to center when prop changes ──────────────────────────────────────
  useEffect(() => {
    if (!mapInstance.current) return;
    mapInstance.current.setView([center.lat, center.lng], 13, { animate: true });
  }, [center.lat, center.lng]);

  // ── Render saved hospitals layer ──────────────────────────────────────────
  useEffect(() => {
    if (!savedLayer.current) return;
    savedLayer.current.clearLayers();
    savedHospitals.forEach(h => {
      if (!h.lat || !h.lng) return;
      L.marker([h.lat, h.lng], {
        icon: L.icon({
          iconUrl:    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
          shadowUrl:  "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
          iconSize:   [25, 41],
          iconAnchor: [12, 41],
          className:  "saved-marker", // blue tint via CSS if desired
        }),
      })
        .addTo(savedLayer.current)
        .bindPopup(`<strong>${h.name}</strong><br/><small>Saved Hospital</small>`);
    });
  }, [savedHospitals]);

  // ── Live routing to selectedHospital ──────────────────────────────────────
  useEffect(() => {
    // Clear previous watch + route
    if (watchId.current) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
    if (routeLine.current) {
      routeLine.current.remove();
      routeLine.current = null;
    }

    if (!selectedHospital || !mapInstance.current) return;

    const map = mapInstance.current;

    watchId.current = navigator.geolocation.watchPosition(
      async pos => {
        const userLatLng = L.latLng(pos.coords.latitude, pos.coords.longitude);

        // Update or create user dot
        if (!userMarker.current) {
          userMarker.current = L.circleMarker(userLatLng, {
            radius: 9, color: "#1a233a", fillColor: "#5c577e", fillOpacity: 1, weight: 2,
          }).addTo(map).bindPopup("📍 Your Location");
        } else {
          userMarker.current.setLatLng(userLatLng);
        }

        // Fetch route from OSRM (free, no key needed)
        try {
          const res = await fetch(
            `https://router.project-osrm.org/route/v1/driving/` +
            `${userLatLng.lng},${userLatLng.lat};${selectedHospital.lng},${selectedHospital.lat}` +
            `?overview=full&geometries=geojson`
          );
          const data = await res.json();
          if (!data.routes?.length) return;

          const coords = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);

          if (routeLine.current) {
            routeLine.current.setLatLngs(coords);
          } else {
            routeLine.current = L.polyline(coords, {
              color: "#1a233a", weight: 5, opacity: 0.8,
            }).addTo(map);
          }

          // Fit both points in view
          map.fitBounds(
            L.latLngBounds([userLatLng, [selectedHospital.lat, selectedHospital.lng]]),
            { padding: [60, 60], animate: true }
          );
        } catch (err) {
          console.warn("Routing failed:", err);
        }
      },
      err => console.warn("Geolocation error:", err),
      { enableHighAccuracy: true }
    );

    return () => {
      if (watchId.current) {
        navigator.geolocation.clearWatch(watchId.current);
        watchId.current = null;
      }
    };
  }, [selectedHospital]);

  return <div ref={mapRef} style={{ height: "100%", width: "100%" }} />;
}