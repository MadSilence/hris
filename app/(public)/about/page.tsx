
import styles from "./about.module.css";
import {Card} from "@/components/ui/Card";

export default function AboutPage() {
    return (
        <div className={styles.wrap}>
            <h1>About SixSoftware</h1>
            <div className={styles.grid}>
                <Card className={styles.card}>
                    <h3>Our story</h3>
                    <p>
                        We’re a product team from Warsaw building HR software that feels human.
                        SixSoftware helps HR teams streamline operations without sacrificing employee experience.
                    </p>
                </Card>
                <Card className={styles.card}>
                    <h3>Our values</h3>
                    <ul>
                        <li>Clarity over complexity</li>
                        <li>Respect for people’s time</li>
                        <li>Security and privacy by default</li>
                    </ul>
                </Card>
            </div>
        </div>
    );
}
