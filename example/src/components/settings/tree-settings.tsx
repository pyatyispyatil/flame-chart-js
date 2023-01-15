import { useCallback, useEffect, useState } from 'react';
import { Input } from '../shared/input';
import { generateRandomTree, TreeConfig, treeConfigDefaults } from '../../test-data';
import styles from './tree-settings.module.css';
import { FlameChartNode } from '../../../../src';
import { Button } from '../shared/button';

const units: Partial<Record<keyof TreeConfig, string>> = {
    thinning: '%',
};

export const TreeSettings = (props: { onChange: (data: FlameChartNode[]) => void }) => {
    const [values, setValues] = useState<TreeConfig>({
        ...treeConfigDefaults,
    });
    const [isGenerating, setIsGenerating] = useState(false);

    const generateData = useCallback(() => {
        setIsGenerating(true);

        setTimeout(() => {
            const newData = generateRandomTree(values);

            props.onChange(newData);

            setTimeout(() => {
                setIsGenerating(false);
            });
        });
    }, [props.onChange, values]);

    useEffect(() => {
        generateData();
    }, [generateData]);

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
                    <Button onClick={generateData} disabled={isGenerating} className={styles.generateButton}>
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
