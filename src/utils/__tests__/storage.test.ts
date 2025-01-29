import { locationStorage, stationStorage } from '../storage';

describe('storage utilities', () => {
    // Mock localStorage
    const mockLocalStorage = (() => {
        let store: { [key: string]: string } = {};
        return {
            getItem: (key: string) => store[key] || null,
            setItem: (key: string, value: string) => {
                store[key] = value.toString();
            },
            clear: () => {
                store = {};
            }
        };
    })();

    beforeAll(() => {
        Object.defineProperty(window, 'localStorage', {
            value: mockLocalStorage,
        });
    });

    beforeEach(() => {
        mockLocalStorage.clear();
    });

    describe('locationStorage', () => {
        const testLocation = { lat: 47.6062, lon: -122.3321 };

        it('stores and retrieves location', () => {
            locationStorage.set(testLocation);
            const retrieved = locationStorage.get();
            expect(retrieved).toEqual(testLocation);
        });

        it('returns null when no location stored', () => {
            const retrieved = locationStorage.get();
            expect(retrieved).toBeNull();
        });

        it('handles invalid stored data', () => {
            localStorage.setItem('lastLocation', 'invalid json');
            const retrieved = locationStorage.get();
            expect(retrieved).toBeNull();
        });
    });

    describe('stationStorage', () => {
        const testStation = {
            id: 'TEST001',
            name: 'Test Station',
            timeZoneOffset: -28800
        };

        it('stores and retrieves station', () => {
            stationStorage.set(testStation);
            const retrieved = stationStorage.get();
            expect(retrieved).toEqual(testStation);
        });

        it('returns null when no station stored', () => {
            const retrieved = stationStorage.get();
            expect(retrieved).toBeNull();
        });

        it('handles invalid stored data', () => {
            localStorage.setItem('lastStation', 'invalid json');
            const retrieved = stationStorage.get();
            expect(retrieved).toBeNull();
        });
    });
});
