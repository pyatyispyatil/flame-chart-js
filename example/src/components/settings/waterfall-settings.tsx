import { WaterfallConfig, waterfallConfigDefaults } from '../../test-data';
import { RandomDataSettings } from './random-data-settings';

export type WaterfallSettingsProps = {
    onChange: (config: WaterfallConfig) => void;
    isGenerating: boolean;
};

const units: Partial<Record<keyof WaterfallConfig, string>> = {
    thinning: '%',
    baseThinning: '%',
};

export const WaterfallSettings = (props: WaterfallSettingsProps) => {
    return (
        <RandomDataSettings
            onChange={props.onChange}
            config={waterfallConfigDefaults}
            units={units}
            isGenerating={props.isGenerating}
        >
            Generate random waterfall items
        </RandomDataSettings>
    );
};
