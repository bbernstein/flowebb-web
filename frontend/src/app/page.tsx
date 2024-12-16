"use client";

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { TideInfo } from '@/components/TideInfo';
import { environment } from '@/config/environment';

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
    {
        ssr: false,
        loading: () => (
            <div className="h-full w-full flex items-center justify-center bg-foreground/5">
                Loading map...
            </div>
        )
    }
);

export default function Home() {
    const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
    const [stations, setStations] = useState<Station[]>([]);
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState(false);

    const fetchStations = async (lat: number, lon: number) => {
        setLoading(true);
        try {
            const response = await fetch(
                `${ environment.apiBaseUrl }/api/stations?lat=${ lat }&lon=${ lon }`
            );

            if (!response.ok) {
                setError('Failed to fetch stations');
                console.error('Failed to fetch stations');
                return;
            }

            const headers = response.headers;
            console.log(`content-length: ${ headers.get('content-length') }`);
            console.log(`content-type: ${ headers.get('content-type') }`);

            const data = await response.json();
            const stations = data.stations || [];
            console.log(`Fetched ${ stations.length } stations`);

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
                fetchStations(position.coords.latitude, position.coords.longitude);
            },
            () => {
                setError('Unable to retrieve your location');
                setLoading(false);
            }
        );
    };

    const handleMapClick = (lat: number, lon: number) => {
        fetchStations(lat, lon);
    };

    return (
        <div className="min-h-screen p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col items-center gap-8 mb-12">
                    <div className="flex gap-4">
                        <button
                            onClick={ getLocationAndStations }
                            disabled={ loading }
                            className="rounded-full bg-foreground text-background px-6 py-3 hover:bg-[#383838] dark:hover:bg-[#ccc] transition-colors disabled:opacity-50"
                        >
                            { loading ? 'Loading...' : 'Use My Location' }
                        </button>
                        <p className="text-sm opacity-70 flex items-center">
                            or click anywhere on the map
                        </p>
                    </div>

                    { error && (
                        <p className="text-red-500">{ error }</p>
                    ) }
                </div>

                <div className="mb-8 h-96 rounded-lg overflow-hidden border border-foreground/10">
                    { location ? (
                        <Map
                            userLocation={ location }
                            stations={ stations }
                            onLocationSelect={ handleMapClick }
                        />
                    ) : (
                        <Map
                            userLocation={ { lat: 47.6062, lon: -122.3321 } } // Default to Seattle
                            stations={ [] }
                            onLocationSelect={ handleMapClick }
                        />
                    ) }
                </div>

                { stations.length > 0 && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-center mb-6">Nearest Tide Stations</h2>
                        <div className="grid gap-4">
                            { stations.map((station) => (
                                <div
                                    key={ station.id }
                                    className="p-6 rounded-lg border border-foreground/10 hover:border-foreground/20 transition-colors"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold">{ station.name }</h3>
                                        <span
                                            className="text-sm opacity-70">{ station.distance.toFixed(1) } km away</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-sm opacity-70">
                                        <p>ID: { station.id }</p>
                                        <p>Source: { station.source }</p>
                                        <p>Latitude: { station.latitude.toFixed(4) }</p>
                                        <p>Longitude: { station.longitude.toFixed(4) }</p>
                                        { station.state && <p>State: { station.state }</p> }
                                        { station.region && <p>Region: { station.region }</p> }
                                    </div>
                                    <div className="mt-4">
                                        <h4 className="text-sm font-medium mb-2">Capabilities:</h4>
                                        <div className="flex flex-wrap gap-2">
                                            { station.capabilities.map((capability) => (
                                                <span
                                                    key={ capability }
                                                    className="px-2 py-1 text-xs rounded-full bg-foreground/5"
                                                >
                                                    { capability.replace('_', ' ') }
                                                </span>
                                            )) }
                                        </div>
                                    </div>

                                    { station.capabilities.includes("WATER_LEVEL") && (
                                        <div className="mt-6">
                                            <TideInfo stationId={ station.id }/>
                                        </div>
                                    ) }
                                </div>
                            )) }
                        </div>
                    </div>
                ) }
            </div>
        </div>
    );
}
