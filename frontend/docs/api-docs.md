# Tides Backend API Documentation

## Base URL
`http://localhost:8080`

## Endpoints

### Get Tide Information
Returns current tide information for a location, either by coordinates or station ID.

#### Request
`GET /api/tides`

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| lat | number | * | Latitude (-90 to 90) |
| lon | number | * | Longitude (-180 to 180) |
| stationId | string | * | NOAA station identifier |
| useCalculation | boolean | No | If true, uses harmonic calculation instead of NOAA API (default: false) |

\* Either (lat, lon) pair OR stationId is required

#### Response
```typescript
{
    timestamp: number;        // Unix timestamp in milliseconds
    waterLevel: number;       // Current water level in feet relative to MLLW
    predictedLevel: number;   // Predicted water level in feet
    nearestStation: string;   // Station identifier
    location: string;        // Station name/location
    stationDistance: number; // Distance to station in kilometers
    type: "RISING" | "FALLING" | "HIGH" | "LOW";
    calculationMethod: "NOAA API" | "Harmonic Calculation"
}
```

#### Example Requests
```
GET /api/tides?lat=47.6062&lon=-122.3321
GET /api/tides?stationId=9447130
GET /api/tides?lat=47.6062&lon=-122.3321&useCalculation=true
GET /api/tides?stationId=9447130&useCalculation=true
```

#### Error Responses
- 400 Bad Request: Invalid coordinates or missing required parameters
- 404 Not Found: Station not found
- 500 Internal Server Error: Server error or NOAA API unavailable

### Get Tide Stations
Returns information about tide stations, either nearest to coordinates or specific station details.

#### Request
`GET /api/stations`

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| lat | number | * | Latitude (-90 to 90) |
| lon | number | * | Longitude (-180 to 180) |
| stationId | string | * | NOAA station identifier |

\* Either (lat, lon) pair OR stationId is required

#### Response
```typescript
Array<{
    id: string;           // Station identifier
    name: string;         // Station name
    state: string;        // State code (e.g., "WA")
    region: string;       // Geographic region
    distance: number;     // Distance in kilometers
    latitude: number;     // Station latitude
    longitude: number;    // Station longitude
    source: "NOAA" | "UKHO" | "CHS";
    capabilities: Array<"WATER_LEVEL" | "TIDAL_CURRENTS" | "WATER_TEMPERATURE" | "AIR_TEMPERATURE" | "WIND">;
    harmonicConstants?: {  // May be null
        stationId: string;
        meanSeaLevel: number;
        constituents: Array<{
            name: string;
            speed: number;    // Angular speed in degrees per hour
            amplitude: number; // Amplitude in feet
            phase: number;    // Phase in degrees
        }>;
    };
}>
```

#### Example Requests
```
GET /api/stations?lat=47.6062&lon=-122.3321
GET /api/stations?stationId=9447130
```

#### Error Responses
- 400 Bad Request: Invalid coordinates or missing required parameters
- 404 Not Found: Station not found
- 500 Internal Server Error: Server error

### Notes
- All water levels are in feet relative to Mean Lower Low Water (MLLW)
- Distances are in kilometers
- When using coordinates, the nearest station within range will be used
- The `useCalculation` parameter allows comparison between NOAA predictions and harmonic calculations
- Rate limits may apply when accessing NOAA API data
