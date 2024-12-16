import { useEffect, useState } from 'react';

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
                    `${ apiBaseUrl }/api/tides?stationId=${ stationId }&useCalculation=${ useCalculated }`
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
        return <div className="animate-pulse bg-foreground/5 h-32 rounded-md"></div>;
    }

    if (error) {
        return <div className="text-red-500 text-sm">{ error }</div>;
    }

    if (!tideData) {
        return null;
    }

    const date = new Date(tideData.timestamp);

    return (
        <div className="space-y-4 p-4 bg-foreground/5 rounded-md">
            <div className="flex justify-between items-start">
                <div>
                    <h4 className="font-medium">Current Tide Status</h4>
                    <p className="text-sm opacity-70">{ date.toLocaleString() }</p>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-sm">
                        { useCalculated ? 'Calculated' : 'NOAA' }
                    </span>
                    <div className="relative inline-flex items-center">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={ useCalculated }
                            onChange={ e => setUseCalculated(e.target.checked) }
                        />
                        <div
                            className="w-9 h-5 bg-foreground/20 peer-checked:bg-blue-600 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                    </div>
                </label>
            </div>

            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <h5 className="text-sm font-medium">
                        { tideData.calculationMethod } Data
                    </h5>
                    <span className="px-2 py-1 text-xs rounded-full bg-foreground/10">
                        { tideData.tideType }
                    </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm opacity-70">Current</p>
                        <p className="font-medium">{ tideData.waterLevel.toFixed(2) } ft</p>
                    </div>
                    <div>
                        <p className="text-sm opacity-70">Predicted</p>
                        <p className="font-medium">{ tideData.predictedLevel.toFixed(2) } ft</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TideInfo;
