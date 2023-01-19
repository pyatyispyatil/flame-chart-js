import { NodeTypes } from './flame-chart-wrapper';
import styles from './selected-data.module.css';

export const SelectedData = ({ data }: { data: NodeTypes }) => {
    const preparedDataNode =
        data?.type === 'flame-chart-node'
            ? {
                  ...data.node,
                  parent: undefined,
                  source: {
                      ...(data.node?.source ?? {}),
                      parent: undefined,
                      children: undefined,
                  },
              }
            : data?.node;

    return (
        <div className={styles.root}>
            <div className={styles.type}>type: {data?.type}</div>
            <pre className={styles.json}>{JSON.stringify(preparedDataNode, null, 2)}</pre>
        </div>
    );
};
