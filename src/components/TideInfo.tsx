import { useEffect, useState } from 'react';
import { Box, Card, CardContent, Chip, CircularProgress, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import TideChart from "@/components/TideChart";
import { useTideContext } from '@/context/TideContext';
import { getStationDayBounds } from '@/utils/dateTime';

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
    const [dataFetched, setDataFetched] = useState(false);

    useEffect(() => {
        setDataFetched(false); // Reset dataFetched when stationId changes
    }, [stationId]);

    useEffect(() => {
        if (stationId && timeZoneOffsetSeconds !== undefined && !dataFetched) {
            const { startDateTime, endDateTime } = getStationDayBounds(
                Date.now(),
                timeZoneOffsetSeconds
            );
            fetchTideData(stationId, startDateTime, endDateTime);
            setDataFetched(true);
        }
    }, [stationId, fetchTideData, timeZoneOffsetSeconds, dataFetched]);

    if (loading) {
        return <Box display="flex" justifyContent="center" p={ 3 }><CircularProgress/></Box>;
    }

    if (error) {
        return (
            <StyledCard variant="outlined">
                <CardContent>
                    <Box display="flex" alignItems="center" gap={1}>
                        <Typography color="error" variant="body1">{ error }</Typography>
                    </Box>
                </CardContent>
            </StyledCard>
        );
    }

    if (!tideData) {
        return <Box display="flex" justifyContent="center" p={ 3 }><CircularProgress/></Box>;
    }

    return (
        <StyledCard variant="outlined">
            <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={ 2 }>
                    <Box>
                        <Typography variant="h6">Current Tide Status</Typography>
                        <Typography variant="body2" color="text.secondary">
                            { tideData.localTime }
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Station ID: { tideData.nearestStation }
                        </Typography>
                    </Box>
                </Box>

                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={ 2 }>
                    <Typography variant="body2" color="text.secondary">Current</Typography>
                    <Typography variant="subtitle1">
                        { tideData.waterLevel.toFixed(2) } ft
                    </Typography>
                    <Chip
                        label={ tideData.tideType }
                        size="small"
                        color="primary"
                        variant="outlined"
                    />
                </Box>

                <Box mt={ 3 }>
                    <TideChart/>
                </Box>
            </CardContent>
        </StyledCard>
    );
}

export default TideInfo;
