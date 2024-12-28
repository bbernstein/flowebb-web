
const formatTimeZoneOffset = (offsetSeconds: number): string => {
    const sign = offsetSeconds >= 0 ? '+' : '-';
    const absOffset = Math.abs(offsetSeconds);
    const hours = Math.floor(absOffset / 3600).toString().padStart(2, '0');
    const minutes = ((absOffset % 3600) / 60).toString().padStart(2, '0');
    return `${sign}${hours}:${minutes}`;
};

export const formatTime = (timestamp: number, timeZoneOffsetSeconds: number): string => {
    const date = new Date(timestamp);
    const timeZone = formatTimeZoneOffset(timeZoneOffsetSeconds);
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZone: timeZone
    });
};

/**
 * Formats a time in the station's timezone
 * @param timestamp Unix timestamp in milliseconds
 * @param offsetSeconds Timezone offset in seconds
 * @returns Formatted time string in station's local timezone
 */
export const formatStationTime = (timestamp: number, offsetSeconds: number | null): string => {
    if (offsetSeconds !== null) {
        // Convert to station's timezone
        return formatTime(timestamp, offsetSeconds);
    }
    const date = new Date(timestamp);
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
            weekday: 'short',
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
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

    // Set to midnight in the station's local time
    const startOfDay = new Date(stationTime);

    // set starOfDay to the start of the hour 12 hours ago
    startOfDay.setHours(0, 0, 0, 0);
    startOfDay.setHours(startOfDay.getHours() - 12)

    const endOfDay = new Date(startOfDay);

    // set endOfDay to the start of the hour 12 hours in the future
    endOfDay.setHours(endOfDay.getHours() + 48);

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
