import React, { createContext, useContext, useState, useCallback } from 'react';
import { environment } from '@/config/environment';

export interface TideExtreme {
    type: 'HIGH' | 'LOW';
    timestamp: number;
    height: number;
}

export interface TidePrediction {
    timestamp: number;
    height: number;
}

export interface TideData {
    timestamp: number;
    waterLevel: number;
    predictedLevel: number;
    nearestStation: string;
    location: string | null;
    stationDistance: number;
    tideType: 'RISING' | 'FALLING' | 'HIGH' | 'LOW';
    calculationMethod: string;
    predictions: TidePrediction[];
    extremes: TideExtreme[];
    timeZoneOffsetSeconds: number;
}

interface TideContextType {
    tideData: TideData | null;
    loading: boolean;
    error: string | null;
    fetchTideData: (stationId: string, startDateTime: string, endDateTime: string) => Promise<void>;
}

const TideContext = createContext<TideContextType | undefined>(undefined);

export function TideProvider({ children }: { children: React.ReactNode }) {
    const [tideData, setTideData] = useState<TideData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchTideData = useCallback(async (stationId: string, startDateTime: string, endDateTime: string) => {
        setLoading(true);
        try {
            const response = await fetch(
                `${environment.apiBaseUrl}/api/tides?stationId=${stationId}&startDateTime=${startDateTime}&endDateTime=${endDateTime}`
            );

            if (!response.ok) {
                setError('Failed to fetch tide data');
                console.error('Failed to fetch tide data');
                return;
            }

            const data = await response.json();
            setTideData(data);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch tide data');
            console.error('Error fetching tide data:', err);
        } finally {
            setLoading(false);
        }
    }, []); // Empty dependency array since it doesn't depend on any props or state

    return (
        <TideContext.Provider value={{ tideData, loading, error, fetchTideData }}>
            {children}
        </TideContext.Provider>
    );
}

export function useTideContext() {
    const context = useContext(TideContext);
    if (context === undefined) {
        throw new Error('useTideContext must be used within a TideProvider');
    }
    return context;
}
