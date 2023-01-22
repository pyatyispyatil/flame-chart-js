import cn from 'classnames';
import styles from './collapse.module.css';
import { PropsWithChildren, useCallback, useRef, useState } from 'react';
import { Chevron } from '../icons/chevron';

export type CollapseProps = {
    className?: string;
    isCollapsed?: boolean;
    title: string;
};

export const Collapse = (props: PropsWithChildren<CollapseProps>) => {
    const heightRef = useRef(0);
    const [isCollapsed, setIsCollapsed] = useState(props.isCollapsed);

    const setHeight = useCallback((ref: HTMLDivElement) => {
        if (ref) {
            heightRef.current = ref.clientHeight;
        }
    }, []);

    return (
        <div className={props.className}>
            <div className={styles.header} onClick={() => setIsCollapsed(!isCollapsed)}>
                {props.title}{' '}
                <span className={cn(styles.collapseIcon, isCollapsed && styles.collapseIconExpand)}>
                    <Chevron />
                </span>
            </div>
            <div
                className={cn(styles.content, isCollapsed && styles.collapsed)}
                style={{ height: isCollapsed ? 0 : heightRef.current || 'fit-content' }}
            >
                <div ref={setHeight}>{props.children}</div>
            </div>
        </div>
    );
};
