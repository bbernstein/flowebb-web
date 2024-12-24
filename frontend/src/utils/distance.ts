/**
 * Converts kilometers to miles
 * @param km Distance in kilometers
 * @returns Distance in miles
 */
export const kmToMiles = (km: number): number => {
    return km * 0.621371;
};

/**
 * Formats a distance in a human-readable way, converting from km to miles
 * @param km Distance in kilometers
 * @param decimals Number of decimal places to show (default: 1)
 * @returns Formatted distance string (e.g., "5.2 mi")
 */
export const formatDistance = (km: number, decimals: number = 1): string => {
    const miles = kmToMiles(km);
    return `${miles.toFixed(decimals)} mi`;
};
