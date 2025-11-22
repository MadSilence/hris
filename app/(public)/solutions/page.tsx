import styles from "./solutions.module.css";
import {Card} from "@/components/ui/Card";

const solutions = [
    {
        id: "hr",
        title: "HR Teams",
        body: "Automate admin and standardize processes without losing flexibility.",
        bullets: ["Templates & reminders", "Document workflows", "Reports & exports"],
    },
    {
        id: "people-managers",
        title: "People Managers",
        body: "Approve requests, view balances, and keep schedules in sync.",
        bullets: ["Approvals in one view", "Team calendars", "Manager insights"],
    },
    {
        id: "finance",
        title: "Finance",
        body: "Reliable time data and leave balances ready for payroll.",
        bullets: ["Timesheet exports", "Accrual rules", "Audit log"],
    },
];

export default function SolutionsPage() {
    return (
        <div className={styles.wrap}>
            <h1>Solutions</h1>
            <p className={styles.lead}>Role-based value across your organization.</p>

            <div className={styles.grid}>
                {solutions.map((s) => (
                    <Card key={s.id} className={styles.card} id={s.id}>
                        <h3>{s.title}</h3>
                        <p>{s.body}</p>
                        <ul>
                            {s.bullets.map((b) => <li key={b}>{b}</li>)}
                        </ul>
                    </Card>
                ))}
            </div>
        </div>
    );
}
