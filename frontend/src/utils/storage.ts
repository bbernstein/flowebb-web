export interface StoredLocation {
    lat: number;
    lon: number;
}

export interface StoredStation {
    id: string;
    name: string;
    timeZoneOffset: number;
}

const LOCATION_KEY = 'lastLocation';
const STATION_KEY = 'lastStation';

export const locationStorage = {
    get: (): StoredLocation | null => {
        if (typeof window === 'undefined') return null;

        const stored = localStorage.getItem(LOCATION_KEY);
        if (!stored) return null;

        try {
            return JSON.parse(stored);
        } catch {
            return null;
        }
    },

    set: (location: StoredLocation) => {
        if (typeof window === 'undefined') return;
        localStorage.setItem(LOCATION_KEY, JSON.stringify(location));
    }
};

export const stationStorage = {
    get: (): StoredStation | null => {
        if (typeof window === 'undefined') return null;

        const stored = localStorage.getItem(STATION_KEY);
        if (!stored) return null;

        try {
            return JSON.parse(stored);
        } catch {
            return null;
        }
    },

    set: (station: StoredStation) => {
        if (typeof window === 'undefined') return;
        localStorage.setItem(STATION_KEY, JSON.stringify(station));
    }
};
