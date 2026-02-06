import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import { useEffect, useState } from "react";
import L from "leaflet";

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Map tile URLs
const MAP_TILES = {
  map: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: "&copy; OpenStreetMap",
  },
  satellite: {
    imageryUrl:
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    labelsUrl:
      "https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri",
  },
};

/* 🔹 Fly map to location */
const FlyToLocation = ({ position }) => {
  const map = useMap();

  useEffect(() => {
    if (position?.lat && position?.lng) {
      map.flyTo([position.lat, position.lng], 12, {
        duration: 1.2,
      });
    }
  }, [position, map]);

  return null;
};

const LocationPicker = ({ value, onChange }) => {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState("map"); // map | satellite
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const searchLocation = async () => {
    if (!query.trim()) return;

    try {
      setLoading(true);
      setError("");

      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}`
      );

      const data = await res.json();

      if (!data.length) {
        setError("Location not found");
        return;
      }

      const place = data[0];

      onChange({
        lat: parseFloat(place.lat),
        lng: parseFloat(place.lon),
        label: place.display_name,
      });
    } catch {
      setError("Search failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="location-picker">
      {/* 🔍 Search + Toggle */}
      <div className="location-top">
        <input
          type="text"
          placeholder="Search city / place"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && searchLocation()}
        />

        <button
          className={mode === "map" ? "active" : ""}
          onClick={() => setMode("map")}
        >
          Map
        </button>

        <button
          className={mode === "satellite" ? "active" : ""}
          onClick={() => setMode("satellite")}
        >
          Satellite
        </button>
      </div>

      {error && <p className="location-error">{error}</p>}

      {/* 🗺 MAP */}
      <MapContainer
        center={[22.0797, 82.1409]}
        zoom={7}
        scrollWheelZoom={false}
        style={{
          height: "220px",
          width: "100%",
          borderRadius: "8px",
          border: "1px solid #1e293b",
        }}
      >
        {mode === "map" ? (
          <TileLayer
            url={MAP_TILES.map.url}
            attribution={MAP_TILES.map.attribution}
          />
        ) : (
          <>
            {/* Satellite imagery */}
            <TileLayer
              url={MAP_TILES.satellite.imageryUrl}
              attribution={MAP_TILES.satellite.attribution}
            />
            {/* Labels on top */}
            <TileLayer
              url={MAP_TILES.satellite.labelsUrl}
              attribution=""
            />
          </>
        )}

        <FlyToLocation position={value} />

        {value?.lat && <Marker position={[value.lat, value.lng]} />}
      </MapContainer>

      {value?.label && <p className="location-label">📍 {value.label}</p>}
    </div>
  );
};

export default LocationPicker;
