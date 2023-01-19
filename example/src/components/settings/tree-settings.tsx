import { useCallback, useEffect, useState } from 'react';
import { Input } from '../shared/input';
import { TreeConfig, treeConfigDefaults } from '../../test-data';
import styles from './tree-settings.module.css';
import { Button } from '../shared/button';

export type TreeSettingsProps = {
    onChange: (config: TreeConfig) => void;
    isGenerating: boolean;
};

const units: Partial<Record<keyof TreeConfig, string>> = {
    thinning: '%',
};

export const TreeSettings = (props: TreeSettingsProps) => {
    const [values, setValues] = useState<TreeConfig>({
        ...treeConfigDefaults,
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
                        label={units[name] ? `${name} (${units[name]})` : name}
                        onChange={(newValue: string) => {
                            const newValues = { ...values, [name]: parseFloat(newValue) };

                            setValues(newValues);
                        }}
                    />
                ))}
            </div>
            <div>
                <div>
                    <Button onClick={applyConfig} disabled={props.isGenerating} className={styles.generateButton}>
                        Generate random tree
                    </Button>
                </div>
                <div className={styles.fileButtons}>
                    <Button className={styles.fileButton}>Export</Button>
                    <Button className={styles.fileButton}>Import</Button>
                </div>
                <input type='file' className={styles.fileInput} />
            </div>
        </div>
    );
};
