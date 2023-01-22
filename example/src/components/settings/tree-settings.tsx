import { TreeConfig, treeConfigDefaults } from '../../test-data';
import { RandomDataSettings } from './random-data-settings';

export type TreeSettingsProps = {
    onChange: (config: TreeConfig) => void;
    isGenerating: boolean;
};

const units: Partial<Record<keyof TreeConfig, string>> = {
    thinning: '%',
};

export const TreeSettings = (props: TreeSettingsProps) => {
    return (
        <RandomDataSettings
            onChange={props.onChange}
            config={treeConfigDefaults}
            units={units}
            isGenerating={props.isGenerating}
        >
            Generate random flame chart items
        </RandomDataSettings>
    );
};
