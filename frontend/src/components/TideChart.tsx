'use client';

import React from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { Box } from '@mui/material';
import { useTideContext } from '@/context/TideContext';
import { formatStationTime } from '@/utils/dateTime';

export default function TideChart() {
    const { tideData } = useTideContext();

    if (!tideData) {
        return null;
    }

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
            formatter: function() {
                if (this.y === undefined) return '';
                return `
                    <b>${formatStationTime(this.x, tideData.timeZoneOffsetSeconds)}</b><br/>
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
                data: tideData.predictions.map(p => [p.timestamp, p.height]),
                color: '#4A90E2',
                type: 'spline'
            }
        ],
        credits: {
            enabled: false
        },
        accessibility: {
            // TODO get accessibilty working in nextjs. It seems nontrivial in this case
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
