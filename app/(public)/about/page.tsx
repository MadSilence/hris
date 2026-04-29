import { Card, CardContent, CardHeader, CardTitle, } from "@/public/desact/src/components/ui/card";

export default function AboutPage() {
  return (
    <div className="flex flex-col gap-10">
      <section className="space-y-4">
        <h1 className="text-5xl font-medium">About SixSoftware</h1>
        <p className="max-w-2xl text-lg text-[var(--color-text-tertiary)]">
          We build HR software that feels clear, secure, and human.
        </p>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
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
            <ul className="list-disc space-y-2 pl-5 text-sm text-[var(--color-text-tertiary)]">
              <li>Clarity over complexity</li>
              <li>Respect for people’s time</li>
              <li>Security and privacy by default</li>
            </ul>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
