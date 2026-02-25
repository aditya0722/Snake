import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export default function HospitalMap({
  center,
  savedHospitals = [],
  selectedHospital,
  onAddHospital
}) {

  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  const nearbyLayer = useRef(null);
  const savedLayer = useRef(null);

  const userMarker = useRef(null);
  const routeLine = useRef(null);
  const watchId = useRef(null);

  // ------------------ INIT MAP ------------------
  useEffect(() => {

    if (!mapRef.current || mapInstance.current) return;

    const map = L.map(mapRef.current);

    L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      { attribution: "&copy; OpenStreetMap contributors" }
    ).addTo(map);

    nearbyLayer.current = L.layerGroup().addTo(map);
    savedLayer.current = L.layerGroup().addTo(map);

    map.setView([center.lat, center.lng], 10);

    mapInstance.current = map;

    return () => {
      if (watchId.current) navigator.geolocation.clearWatch(watchId.current);
      map.remove();
      mapInstance.current = null;
    };

  }, []);

  // ------------------ UPDATE CENTER ------------------
  useEffect(() => {
    if (!mapInstance.current) return;
    mapInstance.current.setView([center.lat, center.lng], 13);
  }, [center]);

  // ------------------ LOAD NEARBY FROM OSM ------------------
  useEffect(() => {

    if (!mapInstance.current) return;

    const map = mapInstance.current;

    const loadNearby = async () => {

      const center = map.getCenter();
      const radius = 15000; // 15km

      const query = `
      [out:json][timeout:25];
      (
        node["amenity"="hospital"](around:${radius},${center.lat},${center.lng});
        way["amenity"="hospital"](around:${radius},${center.lat},${center.lng});
        relation["amenity"="hospital"](around:${radius},${center.lat},${center.lng});

        node["healthcare"="hospital"](around:${radius},${center.lat},${center.lng});
        way["healthcare"="hospital"](around:${radius},${center.lat},${center.lng});
        relation["healthcare"="hospital"](around:${radius},${center.lat},${center.lng});

        node["amenity"="clinic"](around:${radius},${center.lat},${center.lng});
      );
      out center;
      `;

      const res = await fetch(
        "https://overpass-api.de/api/interpreter",
        { method: "POST", body: query }
      );

      const data = await res.json();
      if (!data.elements) return;

      nearbyLayer.current.clearLayers();

      data.elements.forEach(h => {
        

        const lat = h.lat || h.center?.lat;
        const lng = h.lon || h.center?.lon;
        if (!lat || !lng) return;

        const marker = L.marker([lat, lng])
          .addTo(nearbyLayer.current)
          .bindPopup(`
            <strong>${h.tags?.name || "Hospital"}</strong><br/>
            <button id="add-${h.id}"
              style="margin-top:6px;padding:4px 8px;background:#1a1f36;color:white;border:none;border-radius:4px;cursor:pointer;">
              Add to Database
            </button>
          `);

        marker.on("popupopen", () => {
          const btn = document.getElementById(`add-${h.id}`);
          if (btn) {
            btn.onclick = () =>
              onAddHospital({
                id: h.id,
                name: h.tags?.name || "Hospital",
                lat,
                lng,
                address: "OSM Data",
                contact_number: "N/A"
              });
          }
        });

      });

    };

    loadNearby();
    map.on("moveend", loadNearby);

    return () => map.off("moveend", loadNearby);

  }, []);

  // ------------------ RENDER SAVED HOSPITALS ------------------
  useEffect(() => {

    if (!savedLayer.current) return;

    savedLayer.current.clearLayers();

    savedHospitals.forEach(h => {
      if (!h.lat || !h.lng) return;

      L.marker([h.lat, h.lng], {
        icon: L.icon({
          iconUrl: "https://maps.gstatic.com/mapfiles/ms2/micons/blue-dot.png",
          iconSize: [32, 32]
        })
      })
        .addTo(savedLayer.current)
        .bindPopup(`<strong>${h.name}</strong><br/>Saved Hospital`);
    });

  }, [savedHospitals]);

  // ------------------ ROUTING + LIVE TRACKING ------------------
  useEffect(() => {

    if (!selectedHospital || !mapInstance.current) return;

    watchId.current = navigator.geolocation.watchPosition(
      async pos => {

        const userLatLng = L.latLng(
          pos.coords.latitude,
          pos.coords.longitude
        );

        if (!userMarker.current) {
          userMarker.current = L.circleMarker(userLatLng, {
            radius: 8,
            color: "#1a1f36",
            fillColor: "#1a1f36",
            fillOpacity: 1
          }).addTo(mapInstance.current);
        } else {
          userMarker.current.setLatLng(userLatLng);
        }

        const res = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${userLatLng.lng},${userLatLng.lat};${selectedHospital.lng},${selectedHospital.lat}?overview=full&geometries=geojson`
        );

        const data = await res.json();
        if (!data.routes?.length) return;

        const coords = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);

        if (routeLine.current) {
          routeLine.current.setLatLngs(coords);
        } else {
          routeLine.current = L.polyline(coords, {
            color: "#1a1f36",
            weight: 5
          }).addTo(mapInstance.current);
        }

      },
      console.error,
      { enableHighAccuracy: true }
    );

    return () => {
      if (watchId.current) navigator.geolocation.clearWatch(watchId.current);
    };

  }, [selectedHospital]);

  return <div ref={mapRef} style={{ height: "100%", width: "100%" }} />;
}