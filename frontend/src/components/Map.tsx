import { useState, useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import type { Icon, LatLng, LatLngBounds } from 'leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

type Station = {
    id: string;
    name: string;
    state: string | null;
    region: string | null;
    distance: number;
    latitude: number;
    longitude: number;
    source: "NOAA" | "UKHO" | "CHS";
    capabilities: Array<"WATER_LEVEL" | "TIDAL_CURRENTS" | "WATER_TEMPERATURE" | "AIR_TEMPERATURE" | "WIND">;
};

type MapProps = {
    userLocation: {lat: number; lon: number};
    stations: Station[];
    onLocationSelect: (lat: number, lon: number) => void;
};

// Component to handle map centering and bounds
function MapController({
                           center,
                           stations
                       }: {
    center: {lat: number; lon: number};
    stations: Station[];
}) {
    const map = useMap();

    useEffect(() => {
        // If there are no stations, just center on the user location
        if (stations.length === 0) {
            map.flyTo([center.lat, center.lon], 10);
            return;
        }

        // Create bounds that include all points
        const bounds = L.latLngBounds([center.lat, center.lon]);
        stations.forEach(station => {
            bounds.extend([station.latitude, station.longitude]);
        });

        // Add padding to the bounds
        map.fitBounds(bounds, {
            padding: [50, 50],
            maxZoom: 12 // Prevent zooming in too far
        });
    }, [map, center.lat, center.lon, stations]);

    return null;
}

// Component to handle map clicks
function MapClickHandler({ onLocationSelect }: { onLocationSelect: (lat: number, lon: number) => void }) {
    useMapEvents({
        click: (e) => {
            onLocationSelect(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
}

function Map({ userLocation, stations, onLocationSelect }: MapProps) {
    // Create icons only once
    const icons = useMemo(() => ({
        user: new L.DivIcon({
            html: `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="24" height="36">
                    <path d="M12 0C5.4 0 0 5.4 0 12c0 7.2 12 24 12 24s12-16.8 12-24c0-6.6-5.4-12-12-12z" fill="#FF4444"/>
                    <circle cx="12" cy="12" r="6" fill="white"/>
                </svg>
            `,
            className: 'custom-pin',
            iconSize: [24, 36],
            iconAnchor: [12, 36],
            popupAnchor: [0, -36],
        }),
        station: new L.DivIcon({
            html: `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="24" height="36">
                    <path d="M12 0C5.4 0 0 5.4 0 12c0 7.2 12 24 12 24s12-16.8 12-24c0-6.6-5.4-12-12-12z" fill="#4A90E2"/>
                    <circle cx="12" cy="12" r="6" fill="white"/>
                </svg>
            `,
            className: 'custom-pin',
            iconSize: [24, 36],
            iconAnchor: [12, 36],
            popupAnchor: [0, -36],
        })
    }), []);

    // Generate a unique ID for this instance of the map
    const mapId = useMemo(() => `map-${Math.random()}`, []);

    return (
        <div className="h-full w-full" id={mapId}>
            <MapContainer
                center={[userLocation.lat, userLocation.lon]}
                zoom={10}
                style={{ height: '100%', width: '100%' }}
                key={mapId}
            >
                <MapController center={userLocation} stations={stations} />
                <MapClickHandler onLocationSelect={onLocationSelect} />

                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <Marker
                    position={[userLocation.lat, userLocation.lon]}
                    icon={icons.user}
                >
                    <Popup>
                        <div className="text-sm">
                            <p className="font-bold">Selected Location</p>
                            <p>Lat: {userLocation.lat.toFixed(4)}</p>
                            <p>Lon: {userLocation.lon.toFixed(4)}</p>
                        </div>
                    </Popup>
                </Marker>

                {stations.map((station) => (
                    <Marker
                        key={station.id}
                        position={[station.latitude, station.longitude]}
                        icon={icons.station}
                    >
                        <Popup>
                            <div className="text-sm">
                                <p className="font-bold">{station.name}</p>
                                <p>Distance: {station.distance.toFixed(1)} km</p>
                                <p>Lat: {station.latitude.toFixed(4)}</p>
                                <p>Lon: {station.longitude.toFixed(4)}</p>
                                <p>Source: {station.source}</p>
                                <div className="mt-2">
                                    <p className="font-semibold">Capabilities:</p>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {station.capabilities.map((capability) => (
                                            <span
                                                key={capability}
                                                className="px-1.5 py-0.5 text-xs rounded-full bg-foreground/5"
                                            >
                                                {capability.replace('_', ' ')}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}

export default Map;
