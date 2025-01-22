import React, { useEffect, useState } from 'react';
import Highcharts, { Point } from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { Box } from '@mui/material';
import { useTideContext } from '@/context/TideContext';
import { formatStationTime, getStationDayBounds } from '@/utils/dateTime';

export default function TideChart() {
    const { tideData, fetchTideData } = useTideContext();
    const [currentTime, setCurrentTime] = useState<number>(Date.now());

    useEffect(() => {
        // Update current time every minute
        const timer = setInterval(() => {
            const newTime = Date.now();
            setCurrentTime(newTime);

            // Check if we've crossed a 6-hour boundary
            const oldDate = new Date(currentTime);
            const newDate = new Date(newTime);

            const oldHour = oldDate.getHours();
            const newHour = newDate.getHours();

            // If we've crossed a 6-hour boundary (0, 6, 12, 18)
            if (Math.floor(oldHour / 6) !== Math.floor(newHour / 6)) {
                // Refresh the tide data
                if (tideData?.nearestStation) {
                    const { startDateTime, endDateTime } = getStationDayBounds(
                        newTime,
                        tideData.timeZoneOffsetSeconds
                    );
                    fetchTideData(tideData.nearestStation, startDateTime, endDateTime);
                }
            }
        }, 60000); // Update every minute

        return () => clearInterval(timer);
    }, [currentTime, tideData, fetchTideData]);
    
    if (!tideData) {
        return null;
    }

    // Function to find the nearest extreme point within a threshold
    const findNearestExtreme = (timestamp: number, threshold: number = 900000) => { // 30 minutes in milliseconds
        let nearestExtreme = null;
        let minDistance = threshold;

        for (const extreme of tideData.extremes) {
            const distance = Math.abs(extreme.timestamp - timestamp);
            if (distance < minDistance) {
                minDistance = distance;
                nearestExtreme = extreme;
            }
        }

        return nearestExtreme;
    };

    interface CustomPoint {
        x: number;
        y: number;
        isExtreme: boolean;
        type: string;
    }

    if (!tideData.predictions) {
        tideData.predictions = [];
    }
    if (!tideData.extremes) {
        tideData.extremes = [];
    }
    const mergedData: CustomPoint[] = [
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

    const highchartsData = mergedData.map(point => ({
        x: point.x,
        y: point.y,
        id: point.isExtreme ? `extreme-${point.x}` : undefined,
        marker: point.isExtreme ? {
            enabled: true,
            symbol: point.type === 'HIGH' ? 'triangle' : 'triangle-down',
            radius: 6,
            fillColor: point.type === 'HIGH' ? '#2E7D32' : '#C62828',
            lineWidth: 1,
            lineColor: '#FFFFFF'
        } : undefined
    }));

    const chartOptions: Highcharts.Options = {
        chart: {
            type: 'spline',
            height: 300,
            style: {
                fontFamily: 'var(--font-geist-sans)'
            },
            events: {
                render: function() {
                    // Remove any existing custom crosshair
                    const axis = this.xAxis[0];
                    axis.removePlotLine('custom-crosshair');
                }
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
            crosshair: false, // Disable default crosshair
            tickInterval: 4 * 3600 * 1000, // 4 hours
            plotLines: [{
                color: '#FF4444',
                width: 2,
                value: currentTime,
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
            snap: 0,  // Disable default snapping
            formatter: function(this: Point) {
                if (!this || !this.x) return '';

                // Check if we're near an extreme point
                const nearestExtreme = findNearestExtreme(this.x);
                if (nearestExtreme) {
                    // If near an extreme, show that point's data instead
                    return `
                        <b>${formatStationTime(nearestExtreme.timestamp, tideData.timeZoneOffsetSeconds)}</b><br/>
                        Height: ${nearestExtreme.height.toFixed(2)} ft<br/>
                        <strong>${nearestExtreme.type} Tide</strong>
                    `;
                }

                // Default tooltip for regular points
                return `
                    <b>${formatStationTime(this.x, tideData.timeZoneOffsetSeconds)}</b><br/>
                    Height: ${(this.y || 0).toFixed(2)} ft
                `;
            },
            positioner: function(labelWidth, labelHeight, point) {
                // Find nearest extreme point
                const nearestExtreme = findNearestExtreme(point.x);
                if (nearestExtreme) {
                    // If near an extreme, position tooltip over the extreme point
                    const extremePoint = this.chart.get(`extreme-${nearestExtreme.timestamp}`) as Highcharts.Point;
                    if (extremePoint?.plotX != null && extremePoint?.plotY != null) {
                        return {
                            x: extremePoint.plotX + this.chart.plotLeft - labelWidth / 2,
                            y: extremePoint.plotY + this.chart.plotTop - labelHeight - 10
                        };
                    }
                }

                // Default positioning
                return {
                    x: point.plotX + this.chart.plotLeft - labelWidth / 2,
                    y: point.plotY + this.chart.plotTop - labelHeight - 10
                };
            }
        },
        plotOptions: {
            series: {
                states: {
                    hover: {
                        enabled: true,
                        lineWidth: 2
                    }
                },
                point: {
                    events: {
                        mouseOver: function() {
                            const nearestExtreme = findNearestExtreme(this.x);
                            if (nearestExtreme) {
                                // If near an extreme, update crosshair and tooltip
                                const extremePoint = this.series.chart.get(`extreme-${nearestExtreme.timestamp}`) as Highcharts.Point;
                                if (extremePoint && extremePoint !== this) {
                                    // Add a custom crosshair at the extreme point
                                    const xAxis = this.series.chart.xAxis[0];
                                    xAxis.removePlotLine('custom-crosshair');
                                    xAxis.addPlotLine({
                                        value: nearestExtreme.timestamp,
                                        color: '#666666',
                                        width: 1,
                                        id: 'custom-crosshair',
                                        zIndex: 5
                                    });

                                    // Update tooltip
                                    this.series.chart.tooltip.refresh(extremePoint);
                                }
                                return false; // Prevent default hover behavior
                            }

                            // If not near an extreme, show regular crosshair
                            const xAxis = this.series.chart.xAxis[0];
                            xAxis.removePlotLine('custom-crosshair');
                            xAxis.addPlotLine({
                                value: this.x,
                                color: '#666666',
                                width: 1,
                                id: 'custom-crosshair',
                                zIndex: 5
                            });
                        }
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
