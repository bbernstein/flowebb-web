'use client';

import React from 'react';
import Highcharts, { Point } from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { Box } from '@mui/material';
import { useTideContext } from '@/context/TideContext';
import { formatStationTime } from '@/utils/dateTime';

export default function TideChart() {
    const { tideData } = useTideContext();

    if (!tideData) {
        return null;
    }

    // Create a map of extreme timestamps for easy lookup
    const extremePoints = new Map(
        tideData.extremes.map(extreme => [extreme.timestamp, extreme])
    );

    const mergedData = [
        ...tideData.predictions.map(p => ({
            x: p.timestamp,
            y: p.height,
            isExtreme: false,
            type: ''
        })),
        ...tideData.extremes.map(e => ({
            x: e.timestamp,
            y: e.height,
            isExtreme: true,
            type: e.type
        }))
    ].sort((a, b) => a.x - b.x);

    const highchartsData = mergedData.map(point => {
        const highchartsPoint: Highcharts.PointOptionsObject = {
            x: point.x,
            y: point.y
        };

        if (point.isExtreme) {
            highchartsPoint.marker = {
                enabled: true,
                symbol: point.type === 'HIGH' ? 'triangle' : 'triangle-down',
                radius: 6,
                fillColor: point.type === 'HIGH' ? '#2E7D32' : '#C62828',
                lineWidth: 1,
                lineColor: '#FFFFFF'
            };
        }

        return highchartsPoint;
    });

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
                    return formatStationTime(
                        typeof this.value === 'string' ? parseInt(this.value) : this.value,
                        tideData.timeZoneOffsetSeconds
                    );
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
            formatter: function(this: Point) {
                if (!this || !this.y) return '';

                const extreme = extremePoints.get(this.x);
                let extraInfo = '';
                if (extreme) {
                    extraInfo = `<br/><strong>${extreme.type} Tide</strong>`;
                }

                return `
                    <b>${formatStationTime(this.x, tideData.timeZoneOffsetSeconds)}</b><br/>
                    Height: ${this.y.toFixed(2)} ft${extraInfo}
                `;
            }
        },
        plotOptions: {
            spline: {
                marker: {
                    enabled: false
                },
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
        series: [{
            name: 'Predicted Level',
            type: 'spline',
            color: '#4A90E2',
            data: highchartsData
        }],
        credits: {
            enabled: false
        },
        accessibility: {
            enabled: false,
            description: 'This chart shows the predicted tide levels over time.',
            announceNewData: {
                enabled: true
            },
            point: {
                valueDescriptionFormat: '{index}. {xDescription}, tide height: {value} feet.'
            }
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
