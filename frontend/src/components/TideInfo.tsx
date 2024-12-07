import { useState, useEffect } from 'react';

type TideInfo = {
    timestamp: number;
    waterLevel: number;
    predictedLevel: number;
    nearestStation: string;
    location: string;
    stationDistance: number;
    type: "RISING" | "FALLING" | "HIGH" | "LOW";
    calculationMethod: "NOAA API" | "Harmonic Calculation";
};

type TideInfoProps = {
    stationId: string;
};

export function TideInfo({ stationId }: TideInfoProps) {
    const [noaaData, setNoaaData] = useState<TideInfo | null>(null);
    const [calculatedData, setCalculatedData] = useState<TideInfo | null>(null);
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTideData = async () => {
            try {
                // Fetch both NOAA API and calculated data in parallel
                const [noaaResponse, calculatedResponse] = await Promise.all([
                    fetch(`http://0.0.0.0:8080/api/tides?stationId=${stationId}`),
                    fetch(`http://0.0.0.0:8080/api/tides?stationId=${stationId}&useCalculation=true`)
                ]);

                if (!noaaResponse.ok || !calculatedResponse.ok) {
                    throw new Error('Failed to fetch tide data');
                }

                const [noaaData, calculatedData] = await Promise.all([
                    noaaResponse.json(),
                    calculatedResponse.json()
                ]);

                setNoaaData(noaaData);
                setCalculatedData(calculatedData);
                setError('');
            } catch (err) {
                setError('Failed to fetch tide data');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchTideData();
    }, [stationId]);

    if (loading) {
        return <div className="animate-pulse bg-foreground/5 h-32 rounded-md"></div>;
    }

    if (error) {
        return <div className="text-red-500 text-sm">{error}</div>;
    }

    if (!noaaData || !calculatedData) {
        return null;
    }

    const date = new Date(noaaData.timestamp);
    const difference = Math.abs(noaaData.waterLevel - calculatedData.waterLevel);

    return (
        <div className="space-y-4 p-4 bg-foreground/5 rounded-md">
            <div className="flex justify-between items-start">
                <div>
                    <h4 className="font-medium">Current Tide Status</h4>
                    <p className="text-sm opacity-70">{date.toLocaleString()}</p>
                </div>
                <div className="flex gap-2">
                    <span className="px-2 py-1 text-xs rounded-full bg-foreground/10">
                        NOAA: {noaaData.type}
                    </span>
                    <span className="px-2 py-1 text-xs rounded-full bg-foreground/10">
                        Calculated: {calculatedData.type}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
                {/* NOAA API Data */}
                <div className="space-y-3">
                    <h5 className="text-sm font-medium">NOAA API Data</h5>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <p className="text-sm opacity-70">Current</p>
                            <p className="font-medium">{noaaData.waterLevel.toFixed(2)} ft</p>
                        </div>
                        <div>
                            <p className="text-sm opacity-70">Predicted</p>
                            <p className="font-medium">{noaaData.predictedLevel.toFixed(2)} ft</p>
                        </div>
                    </div>
                </div>

                {/* Calculated Data */}
                <div className="space-y-3">
                    <h5 className="text-sm font-medium">Harmonic Calculation</h5>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <p className="text-sm opacity-70">Current</p>
                            <p className="font-medium">{calculatedData.waterLevel.toFixed(2)} ft</p>
                        </div>
                        <div>
                            <p className="text-sm opacity-70">Predicted</p>
                            <p className="font-medium">{calculatedData.predictedLevel.toFixed(2)} ft</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Difference */}
            <div className="pt-2 border-t border-foreground/10">
                <p className="text-sm">
                    <span className="opacity-70">Difference between methods: </span>
                    <span className="font-medium">{difference.toFixed(2)} ft</span>
                </p>
            </div>
        </div>
    );
}
