import { defaultRenderStyles } from '../../../../src/engines/basic-render-engine';
import { defaultTimeGridStyles } from '../../../../src/engines/time-grid';
import { defaultTimeGridPluginStyles } from '../../../../src/plugins/time-grid-plugin';
import { defaultTimeframeSelectorPluginStyles } from '../../../../src/plugins/timeframe-selector-plugin';
import { defaultWaterfallPluginStyles } from '../../../../src/plugins/waterfall-plugin';
import { defaultTogglePluginStyles } from '../../../../src/plugins/toggle-plugin';
import { Input } from '../shared/input';
import { useCallback, useState } from 'react';
import styles from './styles-settings.module.css';
import { Button } from '../shared/button';
import { FlameChartStyles } from '../../../../src';
import { FlameChartContainerStyles } from '../../../../src/flame-chart-container';
import { defaultTimeseriesPluginStyles } from '../../../../src/plugins/timeseries-plugin';

const defaultStyles: FlameChartContainerStyles<FlameChartStyles> = {
    main: defaultRenderStyles,
    timeGrid: defaultTimeGridStyles,
    timeGridPlugin: defaultTimeGridPluginStyles,
    timeseriesPlugin: defaultTimeseriesPluginStyles,
    timeframeSelectorPlugin: defaultTimeframeSelectorPluginStyles,
    waterfallPlugin: defaultWaterfallPluginStyles,
    togglePlugin: defaultTogglePluginStyles,
};

export const StylesSettings = (props: { onChange: (styles: FlameChartContainerStyles<FlameChartStyles>) => void }) => {
    const [values, setValues] = useState({});

    const handleApply = useCallback(() => {
        props.onChange(values);
    }, [props.onChange, values]);

    return (
        <div className={styles.root}>
            <div className={styles.sectionsWrapper}>
                {Object.entries(defaultStyles).map(([sectionName, sectionStyles]) => (
                    <div key={sectionName} className={styles.section}>
                        <div className={styles.sectionHeader}>{sectionName}</div>
                        <div className={styles.inputsWrapper}>
                            {Object.entries(sectionStyles).map(([styleName, value]) => (
                                <Input
                                    className={styles.input}
                                    key={styleName}
                                    value={values?.[sectionName]?.[styleName] ?? value}
                                    label={styleName}
                                    type={typeof value === 'number' ? 'number' : 'text'}
                                    onChange={(newValue: string) => {
                                        const isNumber = typeof value === 'number';
                                        const newSectionValues = {
                                            ...values[sectionName],
                                            [styleName]: isNumber ? parseFloat(newValue) : newValue,
                                        };

                                        setValues({ ...values, [sectionName]: newSectionValues });
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            <div>
                <Button className={styles.applyButton} onClick={handleApply}>
                    Apply
                </Button>
            </div>
        </div>
    );
};
