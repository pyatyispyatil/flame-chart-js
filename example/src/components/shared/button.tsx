import { PropsWithChildren } from 'react';
import cn from 'classnames';
import styles from './button.module.css';

export type ButtonProps = {
    onClick?: () => void;
    className?: string;
};

export const Button = (props: PropsWithChildren<ButtonProps>) => {
    return <button className={cn(styles.root, props.className)} onClick={props.onClick} />;
};
