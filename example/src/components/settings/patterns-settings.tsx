import { useCallback, useState } from 'react';
import styles from './patterns-settings.module.css';
import { Button } from '../shared/button';
import { DefaultPatterns } from '../../../../src';

export const defaultPatterns: DefaultPatterns[] = [
    {
        name: 'example-stripes-pattern',
        type: 'stripes',
        config: {
            color: 'rgb(255,206,71)',
            background: 'rgb(227,180,76)',
            spacing: 6,
            lineWidth: 6,
        },
    },
    {
        name: 'example-combined-pattern',
        type: 'combined',
        config: [
            {
                type: 'stripes',
                config: {
                    color: 'rgba(100,115,217,0.63)',
                    background: 'rgb(255,255,255,0)',
                    angle: 125,
                },
            },
            {
                type: 'gradient',
                config: {
                    colors: [
                        {
                            color: 'rgba(137,211,255,0.5)',
                            offset: 0,
                        },
                        {
                            color: 'rgba(58,178,246,0.5)',
                            offset: 0.1,
                        },
                        {
                            color: 'rgba(0,166,255,0.5)',
                            offset: 0.5,
                        },
                        {
                            color: 'rgba(54,110,136,0.5)',
                            offset: 0.9,
                        },
                        {
                            color: 'rgba(29,49,58,0.5)',
                            offset: 1,
                        },
                    ],
                },
            },
            {
                type: 'dots',
                config: {
                    color: 'rgba(64,255,0,0.35)',
                    background: 'rgb(255,255,255,0)',
                    size: 2,
                    spacing: 2,
                    align: 'center',
                },
            },
        ],
    },
];

export const defaultPatternsNames = defaultPatterns.map((pattern) => pattern.name);

export const PatternsSettings = ({
    value = [],
    onChange,
}: {
    value?: DefaultPatterns[];
    onChange: (patterns: DefaultPatterns[]) => void;
}) => {
    const [patterns, setPatterns] = useState(
        value.map((pattern) => ({ ...pattern, config: JSON.stringify(pattern.config, null, 2) })),
    );

    const handleApply = useCallback(() => {
        onChange(
            patterns.map((pattern) => ({
                ...pattern,
                config: JSON.parse(pattern.config),
            })),
        );
    }, [onChange, patterns]);

    return (
        <div className={styles.root}>
            <div className={styles.sectionsWrapper}>
                {patterns.map(({ name, type, config }, index) => (
                    <div key={(name || type) + index} className={styles.section}>
                        <div className={styles.sectionHeader}>{name || type}</div>
                        <textarea
                            className={styles.input}
                            value={config}
                            onChange={(e) => {
                                const newValue = e.target.value;

                                setPatterns(
                                    patterns.map((pattern, i) =>
                                        i === index ? { ...pattern, config: newValue } : pattern,
                                    ),
                                );
                            }}
                        />
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
