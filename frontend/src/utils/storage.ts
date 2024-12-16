export interface StoredLocation {
    lat: number;
    lon: number;
}

const LOCATION_KEY = 'lastLocation';

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
