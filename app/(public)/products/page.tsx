import styles from "./products.module.css";
import {Card} from "@/components/ui/Card";
import {Button} from "@/components/ui/Button";

const products = [
    {
        id: "records",
        title: "Employee Records",
        body:
            "Profiles, docs, contracts and lifecycle changes in one place. RoleDTO-based access and full history.",
    },
    {
        id: "time-off",
        title: "Time Off",
        body:
            "Policies, balances, approvals and accruals with regional holidays and carry-over rules.",
    },
    {
        id: "working-hours",
        title: "Working Hours",
        body:
            "Timesheets, attendance and review flows with CSV/Excel exports.",
    },
];

export default function ProductsPage() {
    return (
        <div className={styles.wrap}>
            <h1>Products</h1>
            <p className={styles.lead}>Modular building blocks designed to work beautifully together.</p>

            <div className={styles.grid}>
                {products.map((p) => (
                    <Card key={p.id} className={styles.card} id={p.id}>
                        <h3>{p.title}</h3>
                        <p>{p.body}</p>
                        <div className={styles.actions}>
                            <Button variant="primary">Request demo</Button>
                            <Button variant="secondary">Learn more</Button>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
