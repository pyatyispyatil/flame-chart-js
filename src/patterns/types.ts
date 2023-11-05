import { BasicRenderEngine } from '../engines/basic-render-engine';
import { defaultPatterns } from './default-patterns';

export type Pattern = { pattern: CanvasPattern; scale?: number; width?: number };
export type PatternCreator = (engine: BasicRenderEngine) => Pattern;

type DefaultPattern<T, Config> = {
    name: string;
    type: T;
    config: Config;
};

export type UnionizePatternsMap<Map extends Record<keyof Map, (config: any) => PatternCreator>> = {
    [Key in keyof Map]: DefaultPattern<Key, Map[Key] extends (config: infer Config) => PatternCreator ? Config : never>;
}[keyof Map];

export type DefaultPatterns = UnionizePatternsMap<typeof defaultPatterns>;
