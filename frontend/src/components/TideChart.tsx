import React from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { Box } from '@mui/material';
import { useTideContext } from '@/context/TideContext';

export default function TideChart() {
    const { tideData } = useTideContext();

    if (!tideData) {
        return null;
    }

    // Format time for display
    const timeFormatter = (timestamp: number): string => {
        const localTime = new Date(timestamp);
        return localTime.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    // Calculate the start and end timestamps for midnight last night and midnight tonight
    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0)).getTime();
    const endOfDay = new Date(now.setHours(24, 0, 0, 0)).getTime();

    // Filter the predictions to only include values within the desired range
    const filteredPredictions = tideData.predictions.filter(
        p => p.timestamp >= startOfDay && p.timestamp < endOfDay
    );

    const chartOptions: Highcharts.Options = {
        chart: {
            type: 'spline',
            height: 300,
            style: {
                fontFamily: 'var(--font-geist-sans)'
            }
        },
        title: {
            text: 'Tide Predictions',
        },
        xAxis: {
            type: 'datetime',
            labels: {
                formatter: function() {
                    return timeFormatter(typeof this.value === 'string' ? parseInt(this.value) : this.value);
                },
                style: {
                    fontSize: '12px'
                }
            },
            crosshair: true,
            tickInterval: 4 * 3600 * 1000, // 4 hours
            plotLines: [{
                color: '#FF4444',
                width: 2,
                value: tideData.timestamp,
                zIndex: 3,
                label: {
                    text: 'Current Time',
                    style: {
                        color: '#FF4444',
                        fontSize: '12px'
                    },
                    rotation: 0,
                    align: 'right',
                    x: -10
                }
            }]
        },
        yAxis: {
            title: {
                text: 'Height (ft)',
                style: {
                    fontSize: '12px'
                }
            },
            labels: {
                format: '{value:.1f}',
                style: {
                    fontSize: '12px'
                }
            }
        },
        tooltip: {
            shared: true,
            formatter: function() {
                if (this.y === undefined) return '';
                return `
                    <b>${timeFormatter(this.x)}</b><br/>
                    Height: ${this.y.toFixed(2)} ft
                `;
            }
        },
        plotOptions: {
            spline: {
                marker: {
                    enabled: false
                }
            },
            series: {
                states: {
                    hover: {
                        enabled: true,
                        lineWidth: 2
                    }
                }
            }
        },
        series: [
            {
                name: 'Predicted Level',
                data: filteredPredictions.map(p => [p.timestamp, p.height]),
                color: '#4A90E2',
                type: 'spline'
            }
        ],
        credits: {
            enabled: false
        }
    };

    return (
        <Box width="100%">
            <HighchartsReact
                highcharts={Highcharts}
                options={chartOptions}
            />
        </Box>
    );
}
