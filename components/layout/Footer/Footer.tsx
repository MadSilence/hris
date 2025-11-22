import styles from "./Footer.module.css";

export function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={styles.inner}>
                <p className={styles.copy}>© {new Date().getFullYear()} SixSoftware. All rights reserved.</p>
                <ul className={styles.links}>
                    <li><a href="/privacy">Privacy</a></li>
                    <li><a href="/terms">Terms</a></li>
                    <li><a href="/contact">Contact</a></li>
                </ul>
            </div>
        </footer>
    );
}