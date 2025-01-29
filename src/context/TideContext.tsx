'use client';

import React, { createContext, useContext, useState } from 'react';
import { gql, useQuery } from '@apollo/client';

export interface TideExtreme {
    type: 'HIGH' | 'LOW';
    timestamp: number;
    localTime: string;
    height: number;
}

export interface TidePrediction {
    timestamp: number;
    localTime: string;
    height: number;
}

export interface TideData {
    timestamp: number;
    localTime: string;
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

const TIDE_QUERY = gql`
    query GetTides($stationId: ID!, $startDateTime: String!, $endDateTime: String!) {
        tides(stationId: $stationId, startDateTime: $startDateTime, endDateTime: $endDateTime) {
            localTime
            waterLevel
            nearestStation
            tideType
            timeZoneOffsetSeconds
            predictions {
                timestamp
                height
            }
            extremes {
                type
                timestamp
                height
            }
        }
    }
`;


interface TideContextType {
    tideData: TideData | null;
    loading: boolean;
    error: string | null;
    fetchTideData: (stationId: string, startDateTime: string, endDateTime: string) => void;
}

const TideContext = createContext<TideContextType | undefined>(undefined);

export const TideProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [tideData, setTideData] = useState<TideData | null>(null);
    const { loading, error, refetch } = useQuery(TIDE_QUERY, {
        skip: true,
        onCompleted: (data) => {
            setTideData(data.tides);
        }
    });

    const fetchTideData = (stationId: string, startDateTime: string, endDateTime: string) => {
        refetch({ stationId, startDateTime, endDateTime }).then(result => {
            setTideData(result.data.tides);
        }).catch(error => {
            console.error('Error fetching tide data:', error);
        });
    };

    return (
        <TideContext.Provider value={{
            tideData: tideData,
            loading,
            error: error?.message || null,
            fetchTideData
        }}>
            {children}
        </TideContext.Provider>
    );
};

export function useTideContext() {
    const context = useContext(TideContext);
    if (context === undefined) {
        throw new Error('useTideContext must be used within a TideProvider');
    }
    return context;
}
