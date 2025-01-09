import { formatDistance, kmToMiles } from '../distance';

describe('distance utilities', () => {
    describe('kmToMiles', () => {
        it('converts 0 km to 0 miles', () => {
            expect(kmToMiles(0)).toBe(0);
        });

        it('converts 1 km to approximately 0.621371 miles', () => {
            expect(kmToMiles(1)).toBeCloseTo(0.621371);
        });

        it('converts 10 km to approximately 6.21371 miles', () => {
            expect(kmToMiles(10)).toBeCloseTo(6.21371);
        });

        it('handles negative distances', () => {
            expect(kmToMiles(-5)).toBeCloseTo(-3.106855);
        });
    });

    describe('formatDistance', () => {
        it('formats 0 km as "0.0 mi"', () => {
            expect(formatDistance(0)).toBe('0.0 mi');
        });

        it('formats 1 km with default decimal places', () => {
            expect(formatDistance(1)).toBe('0.6 mi');
        });

        it('formats distance with custom decimal places', () => {
            expect(formatDistance(10, 2)).toBe('6.21 mi');
        });

        it('handles negative distances', () => {
            expect(formatDistance(-5)).toBe('-3.1 mi');
        });

        it('formats large distances', () => {
            expect(formatDistance(100)).toBe('62.1 mi');
        });
    });
});
