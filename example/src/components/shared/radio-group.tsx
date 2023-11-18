import styles from './radio-group.module.css';

export type RadioGroupProps<Values extends string> = {
    className?: string;
    value: Values;
    options: {
        value: Values;
        label: string;
    }[];
    onChange: (value: Values) => void;
};

export const RadioGroup = <Values extends string>(props: RadioGroupProps<Values>) => {
    const { className, options, value, onChange } = props;

    return (
        <div className={className}>
            {options.map((option) => (
                <label key={option.value} className={styles.radio}>
                    <input
                        type='radio'
                        name={option.value}
                        checked={value === option.value}
                        onChange={() => onChange(option.value)}
                    />
                    {option.label}
                </label>
            ))}
        </div>
    );
};
