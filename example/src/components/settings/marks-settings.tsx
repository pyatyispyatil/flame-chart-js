import { MarksConfig, marksConfigDefaults } from '../../test-data';
import { RandomDataSettings } from './random-data-settings';

export type MarksSettingsProps = {
    onChange: (config: MarksConfig) => void;
    isGenerating: boolean;
};

export const MarksSettings = (props: MarksSettingsProps) => {
    return (
        <RandomDataSettings onChange={props.onChange} config={marksConfigDefaults} isGenerating={props.isGenerating}>
            Generate random marks items
        </RandomDataSettings>
    );
};
