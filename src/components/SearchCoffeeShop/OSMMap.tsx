import React, { useEffect, useRef, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import * as L from "leaflet";
import { NearbyCoffeeShopType } from "@/store/slicers/searchMapSlicer";

// Fix for default Leaflet marker icons in Next.js/Webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Custom orange coffee marker
const coffeeIcon = L.divIcon({
    html: `<div style="background:#FF8C00;width:28px;height:28px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.35)"></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -30],
    className: "",
});

// Blue dot for plain map clicks
const selectedIcon = L.divIcon({
    html: `<div style="background:#1890ff;width:24px;height:24px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(24,144,255,0.5)"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    className: "",
});

interface OSMMapProps {
    selectedLocation: { lat: number; lng: number } | undefined;
    selectedShopName: string | undefined;
    nearbyCoffeeShops: NearbyCoffeeShopType[];
    onMapClick: (lat: number, lng: number) => void;
}

// Handles plain map clicks
const LocationMarker = ({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) => {
    useMapEvents({
        click(e) {
            onMapClick(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
};

// Smoothly flies to new location only when it changes
const RecenterAutomatically = ({ lat, lng }: { lat: number; lng: number }) => {
    const map = useMap();
    const prevRef = useRef<{ lat: number; lng: number } | null>(null);

    useEffect(() => {
        const prev = prevRef.current;
        if (prev && (prev.lat !== lat || prev.lng !== lng)) {
            map.flyTo([lat, lng], 17, { duration: 1.2 });
        }
        prevRef.current = { lat, lng };
    }, [lat, lng, map]);

    return null;
};

export default function OSMMap({
    selectedLocation,
    selectedShopName,
    nearbyCoffeeShops,
    onMapClick,
}: OSMMapProps) {
    const defaultCenter: [number, number] = [10.7769942, 106.6953021];
    const center: [number, number] = selectedLocation
        ? [selectedLocation.lat, selectedLocation.lng]
        : defaultCenter;

    // Store a ref for each shop marker keyed by shop name
    const markerRefs = useRef<Record<string, L.Marker | null>>({});

    // Once nearbyCoffeeShops loads AND there's a selectedShopName, open the popup.
    // The delay gives Leaflet time to position the markers after they render.
    useEffect(() => {
        if (!selectedShopName || nearbyCoffeeShops.length === 0) return;

        // Small timeout to let React finish rendering all the markers
        const timer = setTimeout(() => {
            const marker = markerRefs.current[selectedShopName];
            if (marker) {
                marker.openPopup();
            }
        }, 800); // 800ms covers the flyTo (1.2s) and marker render lag

        return () => clearTimeout(timer);
    }, [selectedShopName, nearbyCoffeeShops]);

    return (
        <div style={{ height: "100%", width: "100%", position: "relative" }}>
            <MapContainer
                center={center}
                zoom={16}
                scrollWheelZoom={true}
                style={{ height: "100%", width: "100%", zIndex: 0 }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <LocationMarker onMapClick={onMapClick} />
                <RecenterAutomatically lat={center[0]} lng={center[1]} />

                {/* Blue dot when user clicked the map (not a search result) */}
                {selectedLocation && !selectedShopName && (
                    <Marker position={center} icon={selectedIcon}>
                        <Popup>📍 Your selected location</Popup>
                    </Marker>
                )}

                {/* Coffee shop markers */}
                {nearbyCoffeeShops.map((shop, i) => (
                    <Marker
                        key={shop.name + i}
                        position={[shop.location.lat, shop.location.lng]}
                        icon={coffeeIcon}
                        ref={(ref) => {
                            markerRefs.current[shop.name] = ref;
                        }}
                    >
                        <Popup>
                            <div style={{ padding: "6px 2px", minWidth: "160px" }}>
                                <strong style={{ fontSize: "15px", color: "brown" }}>☕ {shop.name}</strong>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}
