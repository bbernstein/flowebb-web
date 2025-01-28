import React, { useEffect, useMemo } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Box, CircularProgress, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { formatDistance } from '@/utils/distance';

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
    isLoading?: boolean;
    userLocation: { lat: number; lon: number } | null;
    stations: Station[];
    selectedStationId: string | null;
    onLocationSelect: (lat: number, lon: number) => void;
    onStationSelect: (stationId: string) => void;
};

const MapBox = styled(Box)({
    height: '100%',
    width: '100%',
    position: 'relative',
    '& .leaflet-container': {
        height: '100%',
        width: '100%',
    },
    '& .leaflet-container.leaflet-crosshair': {
        cursor: 'crosshair',
    },
    '& .leaflet-marker-icon.leaflet-interactive': {
        cursor: 'pointer !important',
    }
});

const LoadingOverlay = styled(Box)({
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    zIndex: 1000,
});

const PopupContent = styled(Box)(({ theme }) => ({
    '& .MuiTypography-root': {
        margin: theme.spacing(0.5, 0),
    },
}));

const MapController = ({ center, stations }: { center: { lat: number; lon: number }; stations: Station[] }) => {
    const map = useMap();
    const prevStationsRef = React.useRef<Station[]>([]);
    const isFirstRender = React.useRef(true);

    useEffect(() => {
        if (!map || !center) return;

        const hasNewStations = stations?.some(station =>
            !prevStationsRef.current?.find(prev => prev.id === station.id)
        );

        if (isFirstRender.current || hasNewStations) {
            const points = [
                [center.lat, center.lon],
                ...(stations || []).map(station => [station.latitude, station.longitude])
            ] as [number, number][];

            if (!points.length) return;

            try {
                if (points.length === 1) {
                    map.setView(points[0], 10);
                } else {
                    const bounds = L.latLngBounds(points[0], points[0]);
                    points.slice(1).forEach(point => bounds.extend(point));
                    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
                }
                isFirstRender.current = false;
            } catch (e) {
                console.error('Error setting map view:', e);
                map.setView([center.lat, center.lon], 10);
            }
        }

        prevStationsRef.current = stations || [];
    }, [map, center, stations]); // Added center to dependencies

    return null;
}

function MapClickHandler({ onLocationSelect }: { onLocationSelect: (lat: number, lon: number) => void }) {
    useMapEvents({
        click: (e) => {
            onLocationSelect(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
}

function Map({
                 isLoading = false,
                 userLocation,
                 stations,
                 selectedStationId,
                 onLocationSelect,
                 onStationSelect
             }: MapProps) {
    // Move all hooks to the top, before any conditional returns
    const icons = useMemo(() => ({
        user: new L.DivIcon({
            html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="24" height="36">
                <path d="M12 0C5.4 0 0 5.4 0 12c0 7.2 12 24 12 24s12-16.8 12-24c0-6.6-5.4-12-12-12z" fill="#FF4444"/>
                <circle cx="12" cy="12" r="6" fill="white"/>
            </svg>`,
            className: 'custom-pin leaflet-interactive',
            iconSize: [24, 36],
            iconAnchor: [12, 36],
            popupAnchor: [0, -36],
        }),
        station: new L.DivIcon({
            html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="24" height="36">
                <path d="M12 0C5.4 0 0 5.4 0 12c0 7.2 12 24 12 24s12-16.8 12-24c0-6.6-5.4-12-12-12z" fill="#4A90E2"/>
                <circle cx="12" cy="12" r="6" fill="white"/>
            </svg>`,
            className: 'custom-pin leaflet-interactive',
            iconSize: [24, 36],
            iconAnchor: [12, 36],
            popupAnchor: [0, -36],
        }),
        selectedStation: new L.DivIcon({
            html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="24" height="36">
                <path d="M12 0C5.4 0 0 5.4 0 12c0 7.2 12 24 12 24s12-16.8 12-24c0-6.6-5.4-12-12-12z" fill="#00C853"/>
                <circle cx="12" cy="12" r="6" fill="white"/>
            </svg>`,
            className: 'custom-pin leaflet-interactive',
            iconSize: [24, 36],
            iconAnchor: [12, 36],
            popupAnchor: [0, -36],
        }),
    }), []);
    
    const mapId = useMemo(() => `map-${ Math.random() }`, []);

    // Early return after hooks
    if (!userLocation) {
        return (
            <MapBox>
                <LoadingOverlay>
                    <CircularProgress/>
                </LoadingOverlay>
            </MapBox>
        );
    }

    return (
        <MapBox id={ mapId }>
            { isLoading && (
                <LoadingOverlay>
                    <CircularProgress/>
                </LoadingOverlay>
            ) }
            <MapContainer
                center={ [userLocation.lat, userLocation.lon] }
                zoom={ 10 }
                className="leaflet-crosshair"
            >
                <MapController center={ userLocation } stations={ stations || [] }/>
                <MapClickHandler onLocationSelect={ onLocationSelect }/>

                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />


                <Marker position={ [userLocation.lat, userLocation.lon] } icon={ icons.user }>
                    <Popup>
                        <PopupContent>
                            <Typography variant="subtitle2">Selected Location</Typography>
                            <Typography variant="body2">Lat: { userLocation.lat.toFixed(4) }</Typography>
                            <Typography variant="body2">Lon: { userLocation.lon.toFixed(4) }</Typography>
                        </PopupContent>
                    </Popup>
                </Marker>

                { stations?.map((station) => (
                    <Marker
                        key={ station.id }
                        position={ [station.latitude, station.longitude] }
                        icon={ station.id === selectedStationId ? icons.selectedStation : icons.station }
                        eventHandlers={ {
                            click: () => onStationSelect(station.id)
                        } }
                    >
                        <Popup>
                            <PopupContent>
                                <Typography variant="subtitle2">
                                    { station.name }
                                    { station.state && ` (${ station.state })` }
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    { formatDistance(station.distance) } away
                                </Typography>
                            </PopupContent>
                        </Popup>
                    </Marker>
                )) }
            </MapContainer>
        </MapBox>
    );
}

export default Map;
