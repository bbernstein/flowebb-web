import React, { createContext, useContext, useState } from 'react';
import { gql, useQuery } from '@apollo/client';
import { Station } from '@/types';

const STATIONS_QUERY = gql`
    query GetStations($lat: Float!, $lon: Float!, $limit: Int) {
        stations(lat: $lat, lon: $lon, limit: $limit) {
            id
            name
            state
            region
            distance
            latitude
            longitude
            source
            capabilities
            timeZoneOffset
        }
    }
`;

interface StationContextType {
    stations: Station[];
    loading: boolean;
    error: string | null;
    fetchStations: (lat: number, lon: number, limit?: number) => Promise<Station[]>;
}

const StationContext = createContext<StationContextType | undefined>(undefined);

export const StationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [stations, setStations] = useState<Station[]>([]);
    const { loading, error, refetch } = useQuery(STATIONS_QUERY, {
        skip: true,
        onError: (error) => console.error('GraphQL error:', error),
        onCompleted: (data) => {
            setStations(data.stations);
        }
    });

    const fetchStations = async (lat: number, lon: number, limit?: number): Promise<Station[]> => {
        try {
            const result = await refetch({ lat, lon, limit });
            const newStations: Station[] = result.data.stations;
            setStations(newStations);
            return newStations;
        } catch (err) {
            console.error('Error fetching stations:', err);
            return [];
        }
    };

    return (
        <StationContext.Provider value={{
            stations: stations,  // Use the state variable instead of data?.stations
            loading,
            error: error?.message || null,
            fetchStations
        }}>
            {children}
        </StationContext.Provider>
    );
};

export function useStationContext() {
    const context = useContext(StationContext);
    if (context === undefined) {
        throw new Error('useStationContext must be used within a StationProvider');
    }
    return context;
}
