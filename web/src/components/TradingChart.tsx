"use client";

import React, { useEffect, useRef } from 'react';
import { createChart, ColorType, LineSeries } from 'lightweight-charts';

export default function TradingChart({ symbol }: { symbol: string }) {
  const chartContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#6f7e90',
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.05)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.05)' },
      },
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight || 300,
      timeScale: {
        borderColor: 'rgba(255, 255, 255, 0.1)',
      },
      rightPriceScale: {
        borderColor: 'rgba(255, 255, 255, 0.1)',
      },
    });

    // Use Cyan for data streams (actual price)
    const lineSeries = chart.addSeries(LineSeries, {
      color: '#4CC9F0',
      lineWidth: 2,
    });

    // Mock data for the chart
    const data = [
      { time: '2026-06-01', value: 1.085 },
      { time: '2026-06-02', value: 1.087 },
      { time: '2026-06-03', value: 1.086 },
      { time: '2026-06-04', value: 1.089 },
      { time: '2026-06-05', value: 1.091 },
      { time: '2026-06-06', value: 1.090 },
      { time: '2026-06-07', value: 1.092 },
    ];

    lineSeries.setData(data);

    // Add a second series for Gold Kronos predictions
    const predictionSeries = chart.addSeries(LineSeries, {
      color: '#D4AF37',
      lineWidth: 1,
      lineStyle: 2, // Dashed
    });

    predictionSeries.setData([
      { time: '2026-06-05', value: 1.091 },
      { time: '2026-06-06', value: 1.093 },
      { time: '2026-06-07', value: 1.095 },
      { time: '2026-06-08', value: 1.094 },
    ]);

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [symbol]);

  return <div ref={chartContainerRef} className="w-full h-full min-h-[300px]" />;
}
