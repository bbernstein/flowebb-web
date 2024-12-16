import { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Switch, Box, Chip, CircularProgress, Grid2 } from '@mui/material';
import { styled } from '@mui/material/styles';

type TideInfo = {
    timestamp: number;
    waterLevel: number;
    predictedLevel: number;
    nearestStation: string;
    location: string;
    stationDistance: number;
    tideType: "RISING" | "FALLING" | "HIGH" | "LOW";
    calculationMethod: "NOAA API" | "Harmonic Calculation";
};

type TideInfoProps = {
    stationId: string;
};

const StyledCard = styled(Card)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark'
        ? theme.palette.background.paper
        : theme.palette.grey[50],
}));

export function TideInfo({ stationId }: TideInfoProps) {
    const [useCalculated, setUseCalculated] = useState(true);
    const [tideData, setTideData] = useState<TideInfo | null>(null);
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState(true);

    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

    useEffect(() => {
        const fetchTideData = async () => {
            setLoading(true);
            try {
                const response = await fetch(
                    `${apiBaseUrl}/api/tides?stationId=${stationId}&useCalculation=${useCalculated}`
                );

                if (!response.ok) {
                    setError('Failed to fetch tide data');
                    console.error('Failed to fetch tide data');
                    return;
                }

                const data = await response.json();
                setTideData(data);
                setError('');
            } catch (err) {
                setError('Failed to fetch tide data');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchTideData();
    }, [stationId, useCalculated, apiBaseUrl]);

    if (loading) {
        return <Box display="flex" justifyContent="center" p={3}><CircularProgress /></Box>;
    }

    if (error) {
        return <Typography color="error" variant="body2">{error}</Typography>;
    }

    if (!tideData) {
        return null;
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
                    </Box>
                    <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="body2" color="text.secondary">
                            {useCalculated ? 'Calculated' : 'NOAA'}
                        </Typography>
                        <Switch
                            checked={useCalculated}
                            onChange={(e) => setUseCalculated(e.target.checked)}
                            size="small"
                        />
                    </Box>
                </Box>

                <Box>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="subtitle2">
                            {tideData.calculationMethod} Data
                        </Typography>
                        <Chip
                            label={tideData.tideType}
                            size="small"
                            color="primary"
                            variant="outlined"
                        />
                    </Box>
                    <Grid2 container spacing={2}>
                        <Grid2 size={2}>
                            <Box>
                                <Typography variant="body2" color="text.secondary">Current</Typography>
                                <Typography variant="subtitle1">
                                    {tideData.waterLevel.toFixed(2)} ft
                                </Typography>
                            </Box>
                        </Grid2>
                        <Grid2 size={2}>
                            <Box>
                                <Typography variant="body2" color="text.secondary">Predicted</Typography>
                                <Typography variant="subtitle1">
                                    {tideData.predictedLevel.toFixed(2)} ft
                                </Typography>
                            </Box>
                        </Grid2>
                    </Grid2>
                </Box>
            </CardContent>
        </StyledCard>
    );
}

export default TideInfo;
