import { ChangeEvent, PropsWithChildren, useCallback } from 'react';
import cn from 'classnames';
import styles from './input.module.css';

export type InputProps = {
    value: string | number;
    onChange: (value: string) => void;
    className?: string;
    type?: 'text' | 'number';
    placeholder?: string;
    label?: string;
};

export const Input = (props: PropsWithChildren<InputProps>) => {
    const handleChange = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            props.onChange(event.target.value);
        },
        [props.onChange]
    );

    return (
        <label className={cn(styles.root, props.className)}>
            {props.label}
            <input type={props.type} value={props.value} onChange={handleChange} placeholder={props.placeholder} />
        </label>
    );
};
