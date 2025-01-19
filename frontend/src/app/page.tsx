"use client";

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { TideInfo } from '@/components/TideInfo';
import { environment } from '@/config/environment';
import { Alert, Box, CircularProgress, Container, Stack, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { locationStorage, stationStorage } from '@/utils/storage';
import { TideProvider } from '@/context/TideContext';
import LocationButton from '@/components/LocationButton';
import { Station } from "@/types";

const TideInfoContainer = styled(Box)(({}) => ({
    height: '500px',
    transition: 'all 0.3s ease',
    opacity: 1,
    transform: 'translateY(0)',
    '&.hidden': {
        opacity: 0,
        height: 0,
        transform: 'translateY(-20px)',
        overflow: 'hidden'
    }
}));

const PageContent = styled(Box)({
    position: 'relative',
});

const MapContainer = styled(Box)(({ theme }) => ({
    height: '400px',
    borderRadius: theme.shape.borderRadius,
    overflow: 'hidden',
    border: `1px solid ${ theme.palette.divider }`,
    marginBottom: theme.spacing(4),
    transition: 'transform 0.3s ease',
}));

const Map = dynamic(
    () => import('@/components/Map'),
    { ssr: false }
);

// Add this styled component for the logo
const LogoContainer = styled(Box)(({ theme }) => ({
    width: '90px', // Adjusted to maintain aspect ratio with 30px height (300:100 = 90:30)
    margin: '0 auto',
    padding: theme.spacing(1), // Reduced padding
    marginTop: theme.spacing(2), // This plus the Container's py will give us roughly 50px total
    '@media (max-width: 600px)': {
        width: '75px', // Proportionally smaller for mobile
    },
}));

export default function Home() {
    const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
    const [stations, setStations] = useState<Station[]>([]);
    const [selectedStationId, setSelectedStationId] = useState<string | null>(null);
    const [displayStationId, setDisplayStationId] = useState<string | null>(null);
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [locationLoading, setLocationLoading] = useState(false);

    useEffect(() => {
        const storedStation = stationStorage.get();
        const storedLocation = locationStorage.get();

        if (storedLocation) {
            setLocation(storedLocation);
            fetchStations(storedLocation.lat, storedLocation.lon).then(() => {
                if (storedStation) {
                    setSelectedStationId(storedStation.id);
                    setDisplayStationId(storedStation.id);
                }
            });
        } else if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const newLocation = {
                        lat: position.coords.latitude,
                        lon: position.coords.longitude
                    };
                    setLocation(newLocation);
                    locationStorage.set(newLocation);
                    fetchStations(newLocation.lat, newLocation.lon).then();
                },
                () => {
                    const defaultLocation = { lat: 47.6062, lon: -122.3321 };
                    setLocation(defaultLocation);
                    locationStorage.set(defaultLocation);
                    fetchStations(defaultLocation.lat, defaultLocation.lon).then();
                }
            );
        }
    }, []);

    const handleMapClick = (lat: number, lon: number) => {
        setSelectedStationId(null);
        setDisplayStationId(null);
        locationStorage.set({ lat, lon });
        fetchStations(lat, lon).then();
    };

    const fetchStations = async (lat: number, lon: number) => {
        setLoading(true);
        try {
            const response = await fetch(
                `${ environment.apiBaseUrl }/api/stations?lat=${ lat }&lon=${ lon }`
            );

            if (!response.ok) {
                setError('Failed to fetch stations');
                return;
            }

            const data = await response.json();
            const stations = data.stations || [];

            setLocation({ lat, lon });
            setStations(stations);
            setError('');

            // Automatically select the nearest station
            if (stations.length > 0) {
                const nearestStation = stations[0];
                setSelectedStationId(nearestStation.id);
                setDisplayStationId(nearestStation.id);
                stationStorage.set({
                    id: nearestStation.id,
                    name: nearestStation.name,
                    timeZoneOffset: nearestStation.timeZoneOffset
                });
            }
        } catch (err) {
            setError('Failed to fetch nearby stations');
            console.error(err);
        } finally {
            setLoading(false);
            setLocationLoading(false);
        }
    };

    const getLocationAndStations = () => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser');
            return;
        }

        setLocationLoading(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const newLocation = {
                    lat: position.coords.latitude,
                    lon: position.coords.longitude
                };
                setSelectedStationId(null);
                setDisplayStationId(null);
                locationStorage.set(newLocation);
                fetchStations(newLocation.lat, newLocation.lon).then();
            },
            () => {
                setError('Unable to retrieve your location');
                setLocationLoading(false);
            },
            {
                timeout: 10000, // 10 second timeout
                maximumAge: 0, // Don't use cached position
                enableHighAccuracy: true
            }
        );
    };

    const handleStationSelect = (stationId: string) => {
        setSelectedStationId(stationId);
        setDisplayStationId(stationId);
        if (displayStationId === null) {
            setDisplayStationId(stationId);
        }
        const selectedStation = stations.find(station => station.id === stationId);
        if (selectedStation) {
            stationStorage.set({
                id: selectedStation.id,
                name: selectedStation.name,
                timeZoneOffset: selectedStation.timeZoneOffset
            });
        }
    };

    const displayStation = stations.find(station => station.id === displayStationId);

    useEffect(() => {
        if (selectedStationId && !loading) {
            setDisplayStationId(selectedStationId);
        }
    }, [selectedStationId, loading]);

    return (
        <Container maxWidth="lg" sx={ { py: 4 } }>
            <Stack spacing={ 1 }>
                <LogoContainer>
                    <Image
                        src="/logo-animated.svg"
                        alt="Flow Ebb Logo"
                        width={ 200 }
                        height={ 50 }
                        priority
                    />
                </LogoContainer>

                { error && <Alert severity="error">{ error }</Alert> }

                {/* Add loading check here */ }
                { loading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" height="400px">
                        <CircularProgress/>
                    </Box>
                ) : (
                    <PageContent>
                        <Stack spacing={ 5 }>
                            {/* TideInfo with transition */ }
                            <TideInfoContainer className={ !displayStation ? 'hidden' : '' }>
                                { displayStation && (
                                    <Box>
                                        <Typography variant="h6" gutterBottom>
                                            { displayStation.name }
                                            { displayStation.state && ` (${ displayStation.state })` }
                                        </Typography>
                                        <TideProvider>
                                            <TideInfo
                                                stationId={ displayStation.id }
                                                timeZoneOffsetSeconds={ displayStation.timeZoneOffset }
                                            />
                                        </TideProvider>
                                    </Box>
                                ) }
                            </TideInfoContainer>

                            <Stack direction={ "column" } spacing={ 2 }>
                                {/* Title and location button */ }
                                <Stack direction="row" spacing={ 2 } alignItems="center">
                                    <Typography variant="h5" component="h1">
                                        Tide Stations
                                    </Typography>
                                    <LocationButton
                                        onClick={ getLocationAndStations }
                                        loading={ locationLoading }
                                    />
                                </Stack>

                                { !loading && location && (
                                    <MapContainer>
                                        <Map
                                            isLoading={ loading }
                                            userLocation={ location }
                                            stations={ stations || [] } // Provide empty array fallback
                                            selectedStationId={ selectedStationId }
                                            onLocationSelect={ handleMapClick }
                                            onStationSelect={ handleStationSelect }
                                        />
                                    </MapContainer>
                                ) }
                            </Stack>
                        </Stack>
                    </PageContent>
                ) }
            </Stack>
        </Container>
    );
}
