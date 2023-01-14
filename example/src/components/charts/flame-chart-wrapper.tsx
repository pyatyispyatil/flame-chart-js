import { useCallback, useEffect, useRef } from 'react';
import {
    Data,
    FlameChartSettings,
    Marks,
    Waterfall,
    FlameChart,
    FlameChartNode,
    WaterfallItem,
    Mark,
    UIPlugin,
} from '../../../../src';
import useResizeObserver from 'use-resize-observer';

type NodeTypes =
    | { node: FlameChartNode | null; type: 'flame-chart-node' }
    | { node: WaterfallItem | null; type: 'waterfall-node' }
    | { node: Mark | null; type: 'mark' };

export type FlameChartProps = {
    data?: Data;
    marks?: Marks;
    waterfall?: Waterfall;
    colors?: Record<string, string>;
    settings?: FlameChartSettings;
    position?: { x: number; y: number };
    zoom?: {
        start: number;
        end: number;
    };
    plugins?: UIPlugin[];
    className?: string;

    onSelect?: (data: NodeTypes) => void;
};

export const FlameChartWrapper = (props: FlameChartProps) => {
    const boxRef = useRef<null | HTMLDivElement>(null);
    const canvasRef = useRef<null | HTMLCanvasElement>(null);
    const flameChart = useRef<null | FlameChart>(null);

    useResizeObserver({
        ref: boxRef,
        onResize: ({ width = 0, height = 0 }) => flameChart.current?.resize(width, height - 3),
    });

    const initialize = useCallback(() => {
        const { data, marks, waterfall, settings, colors, plugins } = props;

        if (canvasRef.current && boxRef.current) {
            const { width = 0, height = 0 } = boxRef.current.getBoundingClientRect();

            canvasRef.current.width = width;
            canvasRef.current.height = height - 3;

            flameChart.current = new FlameChart({
                canvas: canvasRef.current,
                data,
                marks,
                waterfall,
                settings,
                colors,
                plugins,
            });
        }
    }, []);

    const setBoxRef = useCallback((ref: HTMLDivElement) => {
        const isNewRef = ref !== boxRef.current;

        boxRef.current = ref;

        if (isNewRef) {
            initialize();
        }
    }, []);

    const setCanvasRef = useCallback((ref: HTMLCanvasElement) => {
        const isNewRef = ref !== canvasRef.current;

        canvasRef.current = ref;

        if (isNewRef) {
            initialize();
        }
    }, []);

    useEffect(() => {
        if (props.data) {
            flameChart.current?.setData(props.data);
        }
    }, [props.data]);

    useEffect(() => {
        if (props.marks) {
            flameChart.current?.setMarks(props.marks);
        }
    }, [props.marks]);

    useEffect(() => {
        if (props.waterfall) {
            flameChart.current?.setWaterfall(props.waterfall);
        }
    }, [props.waterfall]);

    useEffect(() => {
        if (props.settings) {
            flameChart.current?.setSettings(props.settings);
        }
    }, [props.settings]);

    useEffect(() => {
        if (props.position) {
            flameChart.current?.setFlameChartPosition(props.position);
        }
    }, [props.position]);

    useEffect(() => {
        if (props.zoom) {
            flameChart.current?.setZoom(props.zoom.start, props.zoom.end);
        }
    }, [props.zoom]);

    return (
        <div className={props.className} ref={setBoxRef}>
            <canvas ref={setCanvasRef} />
        </div>
    );
};
