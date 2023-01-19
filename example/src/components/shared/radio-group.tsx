import styles from './radio-group.module.css';

export type RadioGroupProps = {
    className?: string;
    value: string;
    options: {
        value: string;
        label: string;
    }[];
    onChange: (value: string) => void;
};

export const RadioGroup = (props: RadioGroupProps) => {
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
