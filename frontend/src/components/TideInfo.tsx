// frontend/src/components/TideInfo.tsx
import { useEffect } from 'react';
import { Box, Card, CardContent, Chip, CircularProgress, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import TideChart from "@/components/TideChart";
import { useTideContext } from '@/context/TideContext';
import { formatStationTime } from '@/utils/dateTime';

type TideInfoProps = {
    stationId: string;
};

const StyledCard = styled(Card)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark'
        ? theme.palette.background.paper
        : theme.palette.grey[50],
}));

export function TideInfo({ stationId }: TideInfoProps) {
    const { tideData, loading, error, fetchTideData } = useTideContext();

    useEffect(() => {
        if (stationId) {
            fetchTideData(stationId);
        }
    }, [stationId, fetchTideData]); // fetchTideData is now memoized

    if (loading) {
        return <Box display="flex" justifyContent="center" p={ 3 }><CircularProgress/></Box>;
    }

    if (error) {
        return <Typography color="error" variant="body2">{ error }</Typography>;
    }

    if (!tideData) {
        return <Box display="flex" justifyContent="center" p={ 3 }><CircularProgress/></Box>;
    }

    const date = new Date(tideData.timestamp);

    return (
        <StyledCard variant="outlined">
            <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={ 2 }>
                    <Box>
                        <Typography variant="h6">Current Tide Status</Typography>
                        <Typography variant="body2" color="text.secondary">
                            { date.toLocaleString() }
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Station ID: { tideData.nearestStation }
                        </Typography>
                    </Box>
                </Box>

                <Box>
                    <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" gap={ 2 }>
                        <Box>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={ 2 }>
                                <Chip
                                    label={ tideData.tideType }
                                    size="small"
                                    color="primary"
                                    variant="outlined"
                                />
                            </Box>
                        </Box>
                        <Box>
                            <Typography variant="body2" color="text.secondary">Current</Typography>
                            <Typography variant="subtitle1">
                                { tideData.waterLevel.toFixed(2) } ft
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                <Box mt={ 3 }>
                    <Typography variant="subtitle2" gutterBottom>
                        Today's Tides
                    </Typography>
                    <Box display="grid" gridTemplateColumns="repeat(2, 1fr)" gap={ 2 }>
                        { tideData.extremes
                            .sort((a, b) => a.timestamp - b.timestamp)
                            .map((extreme, index) => (
                                <Box key={ index }>
                                    <Typography variant="caption" color="text.secondary">
                                        { extreme.type }
                                    </Typography>
                                    <Typography variant="body2">
                                        { formatStationTime(extreme.timestamp, tideData.timeZoneOffsetSeconds) }
                                    </Typography>
                                    <Typography variant="body2">
                                        { extreme.height.toFixed(2) } ft
                                    </Typography>
                                </Box>
                            )) }
                    </Box>
                </Box>

                <Box mt={ 3 }>
                    <TideChart/>
                </Box>
            </CardContent>
        </StyledCard>
    );
}

export default TideInfo;
