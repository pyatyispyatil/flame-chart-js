import { useCallback, useEffect, useState } from 'react';
import { Input } from '../shared/input';
import { generateRandomTree, TreeConfig, treeConfigDefaults } from '../../test-data';
import styles from './tree-settings.module.css';
import { FlameChartNode } from '../../../../src';

const units: Partial<Record<keyof TreeConfig, string>> = {
    thinning: '%',
};

export const TreeSettings = (props: { onChange: (data: FlameChartNode[]) => void }) => {
    const [values, setValues] = useState<TreeConfig>({
        ...treeConfigDefaults,
    });

    const generateData = useCallback(() => {
        const newData = generateRandomTree(values);

        props.onChange(newData);
    }, [props.onChange]);

    useEffect(() => {
        generateData();
    }, [generateData]);

    return (
        <div>
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
            <div className={styles.buttonsWrapper}>
                <div>
                    <button onClick={generateData}>Generate random tree</button>
                </div>
                <div className='fileButtons'>
                    <button>Export</button>
                    <button>Import</button>
                    <input type='file' />
                </div>
            </div>
        </div>
    );
};
