import React, { useEffect, useRef, useState, forwardRef } from 'react';
import type { ForwardedRef, MouseEvent } from 'react';
import ChartJS from 'chart.js/auto';
import type { ChartData, ChartType, DefaultDataPoint } from 'chart.js';

import type { ChartProps, TypedChartComponent } from './types';
import {
  reforwardRef,
  cloneData,
  setOptions,
  setLabels,
  setDatasets,
} from './utils';

const noopData = {
  datasets: [],
};

function ChartComponent<
  TType extends ChartType = ChartType,
  TData = DefaultDataPoint<TType>,
  TLabel = unknown
>(
  {
    height = 150,
    width = 300,
    redraw = false,
    type,
    data: dataProp,
    options,
    plugins = [],
    getDatasetAtEvent,
    getElementAtEvent,
    getElementsAtEvent,
    fallbackContent,
    onClick: onClickProp,
    onMouseOver: onMouseOverProp,
    ...props
  }: ChartProps<TType, TData, TLabel>,
  ref: ForwardedRef<ChartJS<TType, TData, TLabel>>
) {
  type TypedChartJS = ChartJS<TType, TData, TLabel>;
  type TypedChartData = ChartData<TType, TData, TLabel>;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<TypedChartJS | null>();
  /**
   * In case `dataProp` is function use internal state
   */
  const [computedData, setComputedData] = useState<TypedChartData>();
  const data: TypedChartData =
    computedData || (typeof dataProp === 'function' ? noopData : dataProp);

  const renderChart = () => {
    if (!canvasRef.current) return;

    chartRef.current = new ChartJS(canvasRef.current, {
      type,
      data: cloneData(data),
      options,
      plugins,
    });

    reforwardRef(ref, chartRef.current);
  };

  const destroyChart = () => {
    reforwardRef(ref, null);

    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }
  };

  const onClick = (event: MouseEvent<HTMLCanvasElement>) => {
    if (onClickProp) {
      onClickProp(event);
    }

    const { current: chart } = chartRef;

    if (!chart) return;

    getDatasetAtEvent &&
      getDatasetAtEvent(
        chart.getElementsAtEventForMode(
          event.nativeEvent,
          'dataset',
          { intersect: true },
          false
        ),
        event
      );
    getElementAtEvent &&
      getElementAtEvent(
        chart.getElementsAtEventForMode(
          event.nativeEvent,
          'nearest',
          { intersect: true },
          false
        ),
        event
      );
    getElementsAtEvent &&
      getElementsAtEvent(
        chart.getElementsAtEventForMode(
          event.nativeEvent,
          'index',
          { intersect: true },
          false
        ),
        event
      );
  };

  const onMouseOver = (event: MouseEvent<HTMLCanvasElement>) => {
    if (onMouseOverProp) {
      onMouseOverProp(event);
    }

    const { current: chart } = chartRef;

    if (!chart) return;

    getDatasetAtEvent &&
      getDatasetAtEvent(
        chart.getElementsAtEventForMode(
          event.nativeEvent,
          'dataset',
          { intersect: true },
          false
        ),
        event
      );
    getElementAtEvent &&
      getElementAtEvent(
        chart.getElementsAtEventForMode(
          event.nativeEvent,
          'nearest',
          { intersect: true },
          false
        ),
        event
      );
    getElementsAtEvent &&
      getElementsAtEvent(
        chart.getElementsAtEventForMode(
          event.nativeEvent,
          'index',
          { intersect: true },
          false
        ),
        event
      );
  };

  /**
   * In case `dataProp` is function,
   * then update internal state
   */
  useEffect(() => {
    if (typeof dataProp === 'function' && canvasRef.current) {
      setComputedData(dataProp(canvasRef.current));
    }
  }, [dataProp]);

  useEffect(() => {
    if (!redraw && chartRef.current && options) {
      setOptions(chartRef.current, options);
    }
  }, [redraw, options]);

  useEffect(() => {
    if (!redraw && chartRef.current) {
      setLabels(chartRef.current.config.data, data.labels);
    }
  }, [redraw, data.labels]);

  useEffect(() => {
    if (!redraw && chartRef.current && data.datasets) {
      setDatasets(chartRef.current.config.data, data.datasets);
    }
  }, [redraw, data.datasets]);

  useEffect(() => {
    if (!chartRef.current) return;

    if (redraw) {
      destroyChart();
      setTimeout(renderChart);
    } else {
      chartRef.current.update();
    }
  }, [redraw, options, data.labels, data.datasets]);

  useEffect(() => {
    renderChart();

    return () => destroyChart();
  }, []);

  return (
    <canvas
      ref={canvasRef}
      role='img'
      height={height}
      width={width}
      onClick={onClick}
      onMouseOver={onMouseOver}
      {...props}
    >
      {fallbackContent}
    </canvas>
  );
}

export const Chart = forwardRef(ChartComponent) as TypedChartComponent;
