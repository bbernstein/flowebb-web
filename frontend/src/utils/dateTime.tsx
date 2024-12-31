
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

export interface DayBounds {
    startOfDay: Date;
    endOfDay: Date;
    startDateTime: string;
    endDateTime: string;
}

/**
 * Gets the start and end of a day in station's local time
 * @param timestamp Unix timestamp in milliseconds
 * @param offsetSeconds Timezone offset in seconds
 * @returns Object containing start and end times for the day
 */
export const getStationDayBounds = (timestamp: number, offsetSeconds: number): DayBounds => {
    // Create fake timezone using offset for date handling
    const dateStr = new Date(timestamp).toISOString();
    const localTime = new Date(dateStr);
    localTime.setHours(localTime.getHours() + offsetSeconds / 3600);

    // Set to midnight in the station's local time
    const startOfDay = new Date(localTime);
    startOfDay.setHours(0, 0, 0, 0);
    startOfDay.setHours(startOfDay.getHours() - 12);

    const endOfDay = new Date(startOfDay);
    endOfDay.setHours(endOfDay.getHours() + 48);

    // Format dates for API
    const formatForApi = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
    };

    return {
        startOfDay,
        endOfDay,
        startDateTime: formatForApi(startOfDay),
        endDateTime: formatForApi(endOfDay)
    };
};

/**
 * Formats a local time string from the API for display
 * @param localTime ISO formatted local time string from API
 * @returns Formatted time string
 */
export const formatDisplayTime = (localTime: string): string => {
    const date = new Date(localTime);
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
};

/**
 * Formats a full date and time for display
 * @param localTime ISO formatted local time string from API
 * @returns Formatted date and time string
 */
export const formatDisplayDateTime = (localTime: string): string => {
    const date = new Date(localTime);
    return date.toLocaleString('en-US', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
};
