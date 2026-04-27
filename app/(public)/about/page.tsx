import styles from "./about.module.css";
import { Card, CardContent, CardHeader, CardTitle, } from "@/public/desact/src/components/ui/card";

export default function AboutPage() {
  return (
    <div className={styles.wrap}>
      <h1>About SixSoftware</h1>

      <div className={styles.grid}>
        <Card>
          <CardHeader>
            <CardTitle>Our story</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              We’re a product team from Warsaw building HR software that feels
              human. SixSoftware helps HR teams streamline operations without
              sacrificing employee experience.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Our values</CardTitle>
          </CardHeader>
          <CardContent>
            <ul>
              <li>Clarity over complexity</li>
              <li>Respect for people’s time</li>
              <li>Security and privacy by default</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
