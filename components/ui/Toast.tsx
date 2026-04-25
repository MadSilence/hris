import * as React from "react";
import styles from "./Toast.module.css";

export const Toast: React.FC<{ message: string; onClose: () => void }> = ({ message, onClose }) => {
    React.useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={styles.toast}>
            <span>{message}</span>
            <button onClick={onClose} className={styles.close}>×</button>
        </div>
    );
};
