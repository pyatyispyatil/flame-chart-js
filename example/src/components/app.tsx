import 'reset-css';
import styles from './app.module.css';
import { DefaultFlameChart } from './charts/default-flame-chart';

export const App = () => {
    return (
        <div className={styles.root}>
            <DefaultFlameChart />
        </div>
    );
};
