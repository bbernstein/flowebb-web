import { useEffect } from 'react';
import { Card, CardContent, Typography, Box, Chip, CircularProgress, Grid } from '@mui/material';
import { styled } from '@mui/material/styles';
import TideChart from "@/components/TideChart";
import { useTideContext } from '@/context/TideContext';
import { formatStationDateTime, getStationDayBounds } from '@/utils/dateTime';

type TideInfoProps = {
    stationId: string;
    timeZoneOffsetSeconds: number
};

const StyledCard = styled(Card)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark'
        ? theme.palette.background.paper
        : theme.palette.grey[50],
}));

export function TideInfo({ stationId, timeZoneOffsetSeconds }: TideInfoProps) {
    const { tideData, loading, error, fetchTideData } = useTideContext();

    useEffect(() => {
        if (stationId) {
            const now = new Date();
            const { startOfDay, endOfDay } = getStationDayBounds(now.getTime(), timeZoneOffsetSeconds);
            fetchTideData(stationId, startOfDay.toISOString(), endOfDay.toISOString()).then();
        }
    }, [stationId, fetchTideData, timeZoneOffsetSeconds]);

    if (loading) {
        return <Box display="flex" justifyContent="center" p={3}><CircularProgress /></Box>;
    }

    if (error) {
        return <Typography color="error" variant="body2">{error}</Typography>;
    }

    if (!tideData) {
        return <Box display="flex" justifyContent="center" p={3}><CircularProgress /></Box>;
    }

    const date = new Date(tideData.timestamp);

    return (
        <StyledCard variant="outlined">
            <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Box>
                        <Typography variant="h6">Current Tide Status</Typography>
                        <Typography variant="body2" color="text.secondary">
                            {date.toLocaleString()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Station ID: {tideData.nearestStation}
                        </Typography>
                    </Box>
                </Box>

                <Box>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="subtitle2">
                            NOAA Predictions
                        </Typography>
                        <Chip
                            label={tideData.tideType}
                            size="small"
                            color="primary"
                            variant="outlined"
                        />
                    </Box>
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <Box>
                                <Typography variant="body2" color="text.secondary">Current</Typography>
                                <Typography variant="subtitle1">
                                    {tideData.waterLevel.toFixed(2)} ft
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={6}>
                            <Box>
                                <Typography variant="body2" color="text.secondary">Predicted</Typography>
                                <Typography variant="subtitle1">
                                    {tideData.predictedLevel.toFixed(2)} ft
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>

                <Box mt={3}>
                    <Typography variant="subtitle2" gutterBottom>
                        Tide Times
                    </Typography>
                    <Grid container spacing={2}>
                        {tideData.extremes
                            .sort((a, b) => a.timestamp - b.timestamp)
                            .map((extreme, index) => (
                                <Grid item xs={6} key={index}>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">
                                            {extreme.type}
                                        </Typography>
                                        <Typography variant="body2">
                                            {formatStationDateTime(extreme.timestamp, tideData.timeZoneOffsetSeconds)}
                                        </Typography>
                                        <Typography variant="body2">
                                            {extreme.height.toFixed(2)} ft
                                        </Typography>
                                    </Box>
                                </Grid>
                            ))}
                    </Grid>
                </Box>

                <Box mt={3}>
                    <TideChart />
                </Box>
            </CardContent>
        </StyledCard>
    );
}

export default TideInfo;
