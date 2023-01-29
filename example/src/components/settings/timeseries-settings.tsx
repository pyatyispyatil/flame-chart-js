import { TimeseriesConfig, timeseriesConfigDefaults } from '../../test-data';
import { RandomDataSettings } from './random-data-settings';

export type TimeseriesSettingsProps = {
    onChange: (config: TimeseriesConfig) => void;
    isGenerating: boolean;
};

export const TimeseriesSettings = (props: TimeseriesSettingsProps) => {
    return (
        <RandomDataSettings
            onChange={props.onChange}
            config={timeseriesConfigDefaults}
            isGenerating={props.isGenerating}
        >
            Generate random timeseries items
        </RandomDataSettings>
    );
};
