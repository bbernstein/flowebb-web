import {
    formatDisplayDateTime,
    formatDisplayTime,
    formatStationDateTime,
    formatStationTime,
    formatTime,
    getStationDayBounds
} from '../dateTime';

describe('datetime utilities', () => {
    // Helper function to create a fixed timestamp
    const createTimestamp = (date: string): number => new Date(date).getTime();

    describe('formatTime', () => {
        it('formats time with timezone offset', () => {
            const timestamp = createTimestamp('2024-01-01T12:00:00Z');
            const result = formatTime(timestamp, -28800); // -8 hours (PST)
            expect(result).toBe('04:00 AM');
        });
    });

    describe('formatStationTime', () => {
        it('formats time with offset', () => {
            const timestamp = createTimestamp('2024-01-01T12:00:00Z');
            const result = formatStationTime(timestamp, -28800);
            expect(result).toBe('04:00 AM');
        });

        it('handles null offset', () => {
            const timestamp = createTimestamp('2024-01-01T12:00:00Z');
            const result = formatStationTime(timestamp, null);
            expect(result).toBeDefined();
        });
    });

    describe('formatStationDateTime', () => {
        it('formats date and time with offset', () => {
            const timestamp = createTimestamp('2024-01-01T12:00:00Z');
            const result = formatStationDateTime(timestamp, -28800);
            expect(result).toBe('Mon, Jan 01, 04:00 AM');
        });

        it('handles null offset', () => {
            const timestamp = createTimestamp('2024-01-01T12:00:00Z');
            const result = formatStationDateTime(timestamp, null);
            expect(result).toBeDefined();
        });
    });

    describe('getStationDayBounds', () => {
        it('returns correct day bounds for PST', () => {
            const timestamp = createTimestamp('2024-01-01T12:00:00Z');
            const offsetSeconds = -28800; // PST (-8 hours)
            const bounds = getStationDayBounds(timestamp, offsetSeconds);

            expect(bounds.startOfDay).toBeDefined();
            expect(bounds.endOfDay).toBeDefined();
            expect(bounds.startDateTime).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/);
            expect(bounds.endDateTime).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/);
        });
    });

    describe('formatDisplayTime', () => {
        it('formats ISO time string', () => {
            const result = formatDisplayTime('2024-01-01T12:00:00');
            expect(result).toBe('12:00 PM');
        });
    });

    describe('formatDisplayDateTime', () => {
        it('formats ISO datetime string', () => {
            const result = formatDisplayDateTime('2024-01-01T12:00:00');
            expect(result).toBe('Mon, Jan 01, 12:00 PM');
        });
    });
});
