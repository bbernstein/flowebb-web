
/**
 * Formats a time in the station's timezone
 * @param timestamp Unix timestamp in milliseconds
 * @param offsetSeconds Timezone offset in seconds
 * @returns Formatted time string in station's local timezone
 */
export const formatStationTime = (timestamp: number, offsetSeconds: number | null): string => {
    const date = new Date(timestamp);
    if (offsetSeconds !== null) {
        // Convert to station's timezone
        const utcDate = new Date(date.getTime() + date.getTimezoneOffset() * 60 * 1000);
        return new Date(utcDate.getTime() + offsetSeconds * 1000).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    }
    return date.toLocaleTimeString();
};

/**
 * Formats a full date and time in the station's timezone
 * @param timestamp Unix timestamp in milliseconds
 * @param offsetSeconds Timezone offset in seconds
 * @returns Formatted date and time string in station's local timezone
 */
export const formatStationDateTime = (timestamp: number, offsetSeconds: number | null): string => {
    const date = new Date(timestamp);
    if (offsetSeconds !== null) {
        // Convert to station's timezone
        const utcDate = new Date(date.getTime() + date.getTimezoneOffset() * 60 * 1000);
        return new Date(utcDate.getTime() + offsetSeconds * 1000).toLocaleString('en-US', {
            dateStyle: 'medium',
            timeStyle: 'short'
        });
    }
    return date.toLocaleString();
};

/**
 * Gets the start and end of a day in station's local time
 * @param timestamp Unix timestamp in milliseconds
 * @param offsetSeconds Timezone offset in seconds
 * @returns Object containing start and end timestamps for the day
 */
export const getStationDayBounds = (timestamp: number, offsetSeconds: number): {
    startOfDay: Date;
    endOfDay: Date;
    startOfDayUTC: Date;
    endOfDayUTC: Date;
} => {
    // Convert to station's local time
    const stationTime = new Date(timestamp + (offsetSeconds * 1000));
    const startOfDay = new Date(stationTime);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(startOfDay);
    endOfDay.setHours(24, 0, 0, 0);

    // Convert back to UTC for filtering
    const startOfDayUTC = new Date(startOfDay.getTime() - (offsetSeconds * 1000));
    const endOfDayUTC = new Date(endOfDay.getTime() - (offsetSeconds * 1000));

    return {
        startOfDay,
        endOfDay,
        startOfDayUTC,
        endOfDayUTC
    };
};
