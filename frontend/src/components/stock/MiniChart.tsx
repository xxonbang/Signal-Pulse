import { useEffect, useRef } from 'react';
import { createChart, CandlestickSeries, type IChartApi, type CandlestickData, type Time } from 'lightweight-charts';

interface MiniChartProps {
  /** OHLCV 데이터 (날짜 오름차순) */
  data: { date: string; open: number; high: number; low: number; close: number }[];
  width?: number;
  height?: number;
}

export function MiniChart({ data, width = 280, height = 120 }: MiniChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!containerRef.current || data.length === 0) return;

    const chart = createChart(containerRef.current, {
      width,
      height,
      layout: { background: { color: 'transparent' }, textColor: '#999' },
      grid: { vertLines: { visible: false }, horzLines: { color: '#f0f0f0' } },
      rightPriceScale: { visible: false },
      timeScale: { visible: false },
      crosshair: { mode: 0 },
      handleScroll: false,
      handleScale: false,
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: '#ef4444',
      downColor: '#3b82f6',
      borderUpColor: '#ef4444',
      borderDownColor: '#3b82f6',
      wickUpColor: '#ef4444',
      wickDownColor: '#3b82f6',
    });

    const candleData: CandlestickData<Time>[] = data.map((d) => ({
      time: d.date as Time,
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
    }));

    series.setData(candleData);
    chart.timeScale().fitContent();
    chartRef.current = chart;

    return () => {
      chart.remove();
      chartRef.current = null;
    };
  }, [data, width, height]);

  if (data.length === 0) return null;

  return <div ref={containerRef} />;
}
