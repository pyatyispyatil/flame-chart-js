import { PropsWithChildren, useCallback, useEffect, useState } from 'react';
import { Input } from '../shared/input';
import { Button } from '../shared/button';
import styles from './tree-settings.module.css';

export type RandomDataSettingsProps<Config> = {
    onChange: (config: Config) => void;
    config: Config;
    units?: Partial<Record<keyof Config, string>>;
    isGenerating: boolean;
};

export const RandomDataSettings = <Config extends Record<string, string | number>>(
    props: PropsWithChildren<RandomDataSettingsProps<Config>>,
) => {
    const [values, setValues] = useState<Config>({
        ...props.config,
    });

    const applyConfig = useCallback(() => {
        props.onChange(values);
    }, [props.onChange, values]);

    useEffect(() => {
        props.onChange(values);
    }, []);

    return (
        <div className={styles.root}>
            <div className={styles.inputsWrapper}>
                {Object.entries(values).map(([name, value]) => (
                    <Input
                        className={styles.input}
                        key={name}
                        value={value}
                        label={props.units?.[name] ? `${name} (${props.units[name]})` : name}
                        onChange={(newValue: string) => {
                            const newValues = { ...values, [name]: parseFloat(newValue) };

                            setValues(newValues);
                        }}
                    />
                ))}
            </div>
            <div>
                <Button onClick={applyConfig} disabled={props.isGenerating} className={styles.generateButton}>
                    {props.children}
                </Button>
            </div>
        </div>
    );
};
