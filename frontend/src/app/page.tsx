"use client";

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { TideInfo } from '@/components/TideInfo';
import { environment } from '@/config/environment';
import {
    Container,
    Box,
    Button,
    Typography,
    Stack,
    Alert,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import { locationStorage } from '@/utils/storage';

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

const Map = dynamic(
    () => import('@/components/Map'),
    { ssr: false }
);

const MapContainer = styled(Box)(({ theme }) => ({
    height: '400px',
    borderRadius: theme.shape.borderRadius,
    overflow: 'hidden',
    border: `1px solid ${theme.palette.divider}`,
    marginBottom: theme.spacing(4)
}));

export default function Home() {
    const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
    const [stations, setStations] = useState<Station[]>([]);
    const [selectedStationId, setSelectedStationId] = useState<string | null>(null);
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedLocation = locationStorage.get();

        if (storedLocation) {
            setLocation(storedLocation);
            fetchStations(storedLocation.lat, storedLocation.lon);
        } else if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const newLocation = {
                        lat: position.coords.latitude,
                        lon: position.coords.longitude
                    };
                    setLocation(newLocation);
                    locationStorage.set(newLocation);
                    fetchStations(newLocation.lat, newLocation.lon);
                },
                () => {
                    const defaultLocation = { lat: 47.6062, lon: -122.3321 };
                    setLocation(defaultLocation);
                    locationStorage.set(defaultLocation);
                    fetchStations(defaultLocation.lat, defaultLocation.lon);
                }
            );
        }
    }, []);

    const handleMapClick = (lat: number, lon: number) => {
        setSelectedStationId(null); // Clear selected station when location changes
        locationStorage.set({ lat, lon });
        fetchStations(lat, lon);
    };

    const fetchStations = async (lat: number, lon: number) => {
        setLoading(true);
        try {
            const response = await fetch(
                `${environment.apiBaseUrl}/api/stations?lat=${lat}&lon=${lon}&requireHarmonicConstants=true`
            );

            if (!response.ok) {
                // noinspection ExceptionCaughtLocallyJS
                throw new Error('Failed to fetch stations');
            }

            const data = await response.json();
            const stations = data.stations || [];

            setLocation({ lat, lon });
            setStations(stations);
            setError('');
        } catch (err) {
            setError('Failed to fetch nearby stations');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const getLocationAndStations = () => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const newLocation = {
                    lat: position.coords.latitude,
                    lon: position.coords.longitude
                };
                locationStorage.set(newLocation);
                fetchStations(newLocation.lat, newLocation.lon);
            },
            () => {
                setError('Unable to retrieve your location');
                setLoading(false);
            }
        );
    };

    const handleStationSelect = (stationId: string) => {
        setSelectedStationId(stationId);
    };

    const selectedStation = stations.find(station => station.id === selectedStationId);

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Stack spacing={3}>
                {error && <Alert severity="error">{error}</Alert>}

                <Box>
                    <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                        <Typography variant="h5" component="h1">
                            Tide Stations
                        </Typography>
                        <Button
                            startIcon={<MyLocationIcon />}
                            onClick={getLocationAndStations}
                            variant="outlined"
                            size="small"
                        >
                            Use My Location
                        </Button>
                    </Stack>

                    <MapContainer>
                        <Map
                            isLoading={loading}
                            userLocation={location}
                            stations={stations}
                            selectedStationId={selectedStationId}
                            onLocationSelect={handleMapClick}
                            onStationSelect={handleStationSelect}
                        />
                    </MapContainer>

                    {selectedStation && (
                        <Box>
                            <Typography variant="h6" gutterBottom>
                                {selectedStation.name}
                                {selectedStation.state && ` (${selectedStation.state})`}
                            </Typography>
                            <TideInfo stationId={selectedStation.id} />
                        </Box>
                    )}
                </Box>
            </Stack>
        </Container>
    );
}
