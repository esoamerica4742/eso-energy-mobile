import type { TelemetryPoint } from '@/stores/telemetryStore';

import type { TelemetryData, DataPoint } from '@/types/telemetry';

import { ChartColors } from '@/tokens/design';

import { cloneTelemetry, mockTelemetry } from '@/data/mockTelemetry';

import { formatLiveStreamMeta } from '@/lib/telemetryLivePerception';



function toChartKw(value: number): number {

  return Number((value / 100).toFixed(3));

}



function toChartBattery(value: number): number {

  return Number(((value / 100) * 0.05).toFixed(4));

}



function historyToSeries(

  history: TelemetryPoint[],

  pick: (point: TelemetryPoint) => number,

): DataPoint[] {

  return history.map((point) => ({

    timestamp: new Date(point.timestamp).getTime(),

    value: pick(point),

  }));

}



type BuildOptions = {

  streaming?: boolean;

};



export function buildTelemetryData(

  history: TelemetryPoint[],

  latest: TelemetryPoint | null | undefined,

  options: BuildOptions = {},

): TelemetryData {

  const base = cloneTelemetry(mockTelemetry);

  const streaming = Boolean(options.streaming && latest);

  const anchorUpdatedAt = latest?.timestamp ?? null;



  if (latest) {

    base.series = base.series.map((series) => {

      if (series.id === 'power') {

        return { ...series, currentValue: Number(latest.power_kw.toFixed(2)) };

      }

      if (series.id === 'load') {

        return { ...series, currentValue: Number(latest.load_kw.toFixed(1)) };

      }

      if (series.id === 'battery') {

        return { ...series, currentValue: Math.round(latest.battery_pct) };

      }

      return series;

    });

  }



  if (history.length < 2) {

    return {

      ...base,

      isLive: streaming,

      anchorUpdatedAt,

      lastReadingAgo: formatLiveStreamMeta(anchorUpdatedAt, streaming),

    };

  }



  const powerData = historyToSeries(history, (point) => toChartKw(point.power_kw));

  const loadData = historyToSeries(history, (point) => toChartKw(point.load_kw));

  const batteryData = historyToSeries(history, (point) => toChartBattery(point.battery_pct));



  const maxPlot = Math.max(

    ...powerData.map((point) => point.value),

    ...loadData.map((point) => point.value),

    3,

  );



  return {

    ...base,

    readingCount: history.length,

    isLive: streaming,

    anchorUpdatedAt,

    lastReadingAgo: formatLiveStreamMeta(anchorUpdatedAt, streaming),

    yMax: Math.max(3, Math.ceil(maxPlot * 10) / 10),

    series: [

      {

        ...base.series[0],

        color: ChartColors.power,

        fillColor: ChartColors.powerFill,

        data: powerData,

      },

      {

        ...base.series[1],

        color: ChartColors.load,

        fillColor: ChartColors.loadFill,

        data: loadData,

      },

      {

        ...base.series[2],

        color: ChartColors.battery,

        fillColor: ChartColors.batteryFill,

        data: batteryData,

      },

    ],

  };

}


