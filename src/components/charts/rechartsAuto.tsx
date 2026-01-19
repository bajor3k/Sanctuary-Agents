"use client";

import * as React from "react";
import {
  Pie as RCPie,
  Bar as RCBar,
  Line as RCLine,
  Area as RCArea,
  Cell as RCCell,
  type PieProps, type BarProps, type LineProps, type AreaProps,
} from "recharts";
import { getBabyBluePalette } from "@/lib/palette";

/** Adds palette colors to <Cell>s if not provided */
export function CellsAuto({ count }: { count: number }) {
  const palette = getBabyBluePalette();
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <RCCell key={i} fill={palette[i % palette.length]} />
      ))}
    </>
  );
}

/** Pie with auto <Cell> colors when none passed */
export function PieAutoColors(props: PieProps & { autoCellsCount?: number }) {
  const { children, autoCellsCount, ...rest } = props;
  const hasCells = React.Children.toArray(children).some(
    (c: any) => c?.type?.displayName === "Cell"
  );
  return (
    <RCPie {...(rest as any)}>
      {hasCells
        ? children
        : typeof autoCellsCount === "number" && autoCellsCount > 0
          ? <CellsAuto count={autoCellsCount} />
          : children}
    </RCPie>
  );
}

/** HOC to inject default stroke/fill from palette if not provided */
function withSeriesColor<T extends { stroke?: string; fill?: string }>(
  Comp: React.ComponentType<T>,
  index?: number
) {
  return function SeriesWithPalette(props: T) {
    const palette = getBabyBluePalette();
    const i = (index ?? (props as any).__index__ ?? 0) % palette.length;
    const color = palette[i];
    return <Comp {...({ stroke: props.stroke ?? color, fill: props.fill ?? color, ...props } as T)} />;
  };
}

export const BarAutoColors  = withSeriesColor<BarProps>(RCBar as any);
export const LineAutoColors = withSeriesColor<LineProps>(RCLine as any);
export const AreaAutoColors = withSeriesColor<AreaProps>(RCArea as any);
