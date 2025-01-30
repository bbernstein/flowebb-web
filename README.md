# FlowEbb Web

FlowEbb Web is a Next.js-based web application that provides real-time tide information and predictions using GraphQL. The application displays tide data, station information, and interactive maps for coastal locations.

## Prerequisites

- Node.js >= 20.11.0
- npm (comes with Node.js)

## Getting Started

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory with:
```
NEXT_PUBLIC_API_URL=http://localhost:8080  # URL for the FlowEbb backend API
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Available Scripts

- `npm run dev` - Start development server on port 3000
- `npm run build` - Build the production application
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report

## Architecture Overview

### Tech Stack
- Next.js 15
- React 18
- Apollo Client for GraphQL
- Material-UI (MUI) for components
- Leaflet for maps
- Highcharts for tide charts
- TypeScript
- Jest for testing

### Key Features
- Real-time tide information
- Interactive tide charts
- Station location mapping
- Responsive design
- TypeScript type safety

## GraphQL API

The application uses two main GraphQL queries:

### Tide Data Query
```graphql
query GetTides($stationId: ID!, $startDateTime: String!, $endDateTime: String!) {
    tides(stationId: $stationId, startDateTime: $startDateTime, endDateTime: $endDateTime) {
        localTime
        waterLevel
        nearestStation
        tideType
        timeZoneOffsetSeconds
        predictions {
            timestamp
            height
        }
        extremes {
            type
            timestamp
            height
        }
    }
}
```

### Stations Query
```graphql
query GetStations($lat: Float!, $lon: Float!, $limit: Int) {
    stations(lat: $lat, lon: $lon, limit: $limit) {
        id
        name
        state
        region
        distance
        latitude
        longitude
        source
        capabilities
        timeZoneOffset
    }
}
```

## Project Structure

```
src/
├── apollo/          # Apollo Client setup
├── app/             # Next.js app directory
├── components/      # React components
├── config/          # Environment configuration
├── context/         # React contexts
├── types/           # TypeScript types
└── utils/           # Utility functions
```

## Key Components

### TideInfo
- Displays current tide status
- Shows water level and tide type
- Renders tide chart
- Located in: `src/components/TideInfo.tsx`

### Map
- Interactive map interface
- Shows station locations
- Handles location selection
- Located in: `src/components/Map.tsx`

### Context Providers
- `TideContext`: Manages tide data state and API calls
- `StationContext`: Handles station data and location-based queries

## Making Changes

### Adding New Features
1. Components: Add new components in `src/components/`
2. Styles: Use MUI's styled components or modify `globals.css`
3. GraphQL: Add queries in relevant context files
4. Types: Update TypeScript interfaces in `src/types/`

### Modifying Existing Features
1. Tide Data: Check `TideContext.tsx` and `TideInfo.tsx`
2. Station Data: See `StationContext.tsx` and `Map.tsx`
3. Charts: Modify `TideChart.tsx` for chart changes
4. Map Features: Update `Map.tsx` for map-related changes

### Testing
- Unit tests are in `__tests__` directories
- Use Jest and React Testing Library
- Run tests before submitting changes

## Build and Deployment

The application includes a deployment script at `scripts/deploy-frontend.sh`. The build process automatically includes:
- Build time stamp
- Version information
- Environment configuration

## Contributing

1. Create a feature branch
2. Make changes
3. Ensure tests pass (`npm test`)
4. Run linter (`npm run lint`)
5. Submit pull request

## Environment Variables

- `NEXT_PUBLIC_API_URL`: Backend API URL
- `NEXT_PUBLIC_BUILD_TIME`: Automatically set during build
- `NEXT_PUBLIC_VERSION`: Set from package version during build
- `NODE_ENV`: Environment mode ('development' or 'production')
