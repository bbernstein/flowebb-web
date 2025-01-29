// frontend/src/types/index.ts

export type StationType =
    | "WATER_LEVEL"
    | "TIDAL_CURRENTS"
    | "WATER_TEMPERATURE"
    | "AIR_TEMPERATURE"
    | "WIND";

export type StationSource = "NOAA" | "UKHO" | "CHS";

export interface Station {
    id: string;
    name: string;
    state: string | null;
    region: string | null;
    distance: number;
    latitude: number;
    longitude: number;
    source: StationSource;
    capabilities: StationType[];
    timeZoneOffset: number;
    level?: string;
    stationType?: string;
}
