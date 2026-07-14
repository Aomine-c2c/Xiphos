"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  createChart,
  ColorType,
  CandlestickSeries,
  LineSeries,
  type IChartApi,
  type ISeriesApi,
  type CandlestickData,
  type LineData,
  type Time,
} from "lightweight-charts";
import { useTradingStore } from "../store/useTradingStore";
import { AlertTriangle, Loader2 } from "lucide-react";


const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8001";

interface ChartCandle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  ema_fast?: number | null;
  ema_medium?: number | null;
  sma_slow?: number | null;
}

export default function TradingChart({
  symbol,
  timeframe,
}: {
  symbol: string;
  timeframe: string;
}) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const emaFastRef = useRef<ISeriesApi<"Line"> | null>(null);
  const emaMediumRef = useRef<ISeriesApi<"Line"> | null>(null);
  const smaSlowRef = useRef<ISeriesApi<"Line"> | null>(null);
  const lastCandleRef = useRef<CandlestickData<Time> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  const marketWatch = useTradingStore((state) => state.marketWatch);
  const mt5Connected = useTradingStore((state) => state.mt5Connected);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "#09090e" },
        textColor: "#52525b",
      },
      grid: {
        vertLines: { color: "#1e1e2e" },
        horzLines: { color: "#1e1e2e" },
      },
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight || 300,
      timeScale: {
        borderColor: "#1e1e2e",
        timeVisible: true,
        secondsVisible: false,
      },
      rightPriceScale: {
        borderColor: "#1e1e2e",
      },
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#4ade80",
      downColor: "#f87171",
      borderUpColor: "#4ade80",
      borderDownColor: "#f87171",
      wickUpColor: "#4ade80",
      wickDownColor: "#f87171",
    });

    const emaFast = chart.addSeries(LineSeries, {
      color: "#8b5cf6",
      lineWidth: 1,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    const emaMedium = chart.addSeries(LineSeries, {
      color: "#a78bfa",
      lineWidth: 1,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    const smaSlow = chart.addSeries(LineSeries, {
      color: "#52525b",
      lineWidth: 1,
      priceLineVisible: false,
      lastValueVisible: false,
    });

    chartRef.current = chart;
    candleRef.current = candleSeries;
    emaFastRef.current = emaFast;
    emaMediumRef.current = emaMedium;
    smaSlowRef.current = smaSlow;

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
      chartRef.current = null;
      candleRef.current = null;
      emaFastRef.current = null;
      emaMediumRef.current = null;
      smaSlowRef.current = null;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadChart = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(
          `${API_URL}/api/chart/${symbol}?timeframe=${timeframe}`
        );
        const json = await res.json();

        if (cancelled) return;

        if (!res.ok || json.error || !json.data?.length) {
          setError(json.error || "No data for symbol");
          candleRef.current?.setData([]);
          emaFastRef.current?.setData([]);
          emaMediumRef.current?.setData([]);
          smaSlowRef.current?.setData([]);
          return;
        }

        const candles: CandlestickData<Time>[] = [];
        const emaFastData: LineData<Time>[] = [];
        const emaMediumData: LineData<Time>[] = [];
        const smaSlowData: LineData<Time>[] = [];

        for (const row of json.data as ChartCandle[]) {
          const t = row.time as Time;
          candles.push({
            time: t,
            open: row.open,
            high: row.high,
            low: row.low,
            close: row.close,
          });
          if (row.ema_fast != null) {
            emaFastData.push({ time: t, value: row.ema_fast });
          }
          if (row.ema_medium != null) {
            emaMediumData.push({ time: t, value: row.ema_medium });
          }
          if (row.sma_slow != null) {
            smaSlowData.push({ time: t, value: row.sma_slow });
          }
        }

        candleRef.current?.setData(candles);
        emaFastRef.current?.setData(emaFastData);
        emaMediumRef.current?.setData(emaMediumData);
        smaSlowRef.current?.setData(smaSlowData);
        if (candles.length > 0) {
          lastCandleRef.current = candles[candles.length - 1];
        }
        chartRef.current?.timeScale().fitContent();
      } catch {
        if (!cancelled) {
          setError("Failed to load chart data");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadChart();
    const interval = setInterval(loadChart, 30_000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [symbol, timeframe]);

  return (
    <div className="relative w-full h-full min-h-[200px]">
      {/* Loading overlay */}
      {loading && !error && mt5Connected && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#09090e]/80 backdrop-blur-sm z-10 pointer-events-none">
          <Loader2 className="w-6 h-6 text-[#8b5cf6] animate-spin mb-2" />
          <span className="text-[10px] font-mono text-[#a78bfa] tracking-widest uppercase animate-pulse">
            Synchronizing Feed...
          </span>
        </div>
      )}

      {/* Disconnect/Error overlay */}
      {(!mt5Connected || error) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#09090e]/95 backdrop-blur-md z-10 p-6 text-center select-none">
          <AlertTriangle className="w-8 h-8 text-[#f87171] mb-3 animate-pulse" />
          <h3 className="text-xs font-mono font-bold text-[#f87171] tracking-widest uppercase mb-1">
            {!mt5Connected ? "MT5 DISCONNECTED" : "FEED ERROR"}
          </h3>
          <p className="text-[10px] font-mono text-[#52525b] max-w-xs leading-normal">
            {!mt5Connected 
              ? "MetaTrader 5 terminal is offline. Launch MT5 to resume live chart streaming."
              : error || "An unexpected error occurred while fetching chart data."}
          </p>
        </div>
      )}
      <div ref={chartContainerRef} className="w-full h-full" />
    </div>
  );
}
