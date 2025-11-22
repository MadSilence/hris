import styles from "./pricing.module.css";
import {Card} from "@/components/ui/Card";
import {Button} from "@/components/ui/Button";

const tiers = [
    {
        name: "Starter",
        price: "€3 / employee / mo",
        features: ["Employee records", "Time off", "Basic reports"],
        cta: "Get started",
    },
    {
        name: "Growth",
        price: "€5 / employee / mo",
        features: ["Everything in Starter", "Working hours", "Advanced reports"],
        cta: "Start trial",
    },
    {
        name: "Enterprise",
        price: "Custom",
        features: ["Custom workflows", "SLA & SSO", "Dedicated support"],
        cta: "Talk to sales",
    },
];

export default function PricingPage() {
    return (
        <div className={styles.wrap}>
            <h1>Pricing</h1>
            <p className={styles.lead}>Simple, transparent pricing that scales with your team.</p>

            <div className={styles.grid}>
                {tiers.map((t) => (
                    <Card key={t.name} className={styles.card}>
                        <h3>{t.name}</h3>
                        <div className={styles.price}>{t.price}</div>
                        <ul className={styles.list}>
                            {t.features.map((f) => <li key={f}>{f}</li>)}
                        </ul>
                        <Button variant="primary" fullWidth>{t.cta}</Button>
                    </Card>
                ))}
            </div>
        </div>
    );
}
