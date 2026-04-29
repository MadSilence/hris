import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, } from "@/public/desact/src/components/ui/card";
import { Button } from "@/public/desact/src/components/ui/button";

import {
  CandidatePipeline,
  CandidateQuality,
  HiringFunnel,
  OfferAcceptance,
  OpenPositions,
  RecentHires,
  RecruitmentTrends,
  TimeToHire,
  TopSources,
} from "@/public/desact/src/components/dashboard/RecruitmentWidgets";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-2">

          <h1 className="text-3xl font-semibold">Dashboard</h1>

          <p className="max-w-2xl text-[var(--color-text-tertiary)]">
            Track hiring activity, team growth, open roles and recent company
            updates in one place.
          </p>
        </div>

        <Button asChild>
          <Link href="/dashboard/users">Manage users</Link>
        </Button>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        <OpenPositions/>
        <TimeToHire/>
        <OfferAcceptance/>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <RecruitmentTrends/>
        </div>

        <CandidateQuality/>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <CandidatePipeline/>
        <HiringFunnel/>
        <TopSources/>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <RecentHires/>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Company health</CardTitle>
          </CardHeader>

          <CardContent className="flex flex-col gap-4">
            {[
              ["Employee records", "96% complete"],
              ["Roles configured", "12 active roles"],
              ["Pending requests", "8 waiting"],
              ["Onboarding tasks", "14 open"],
            ].map(([label, value]) => (
              <div
                key={label}
                className="flex items-center justify-between gap-4 border-b pb-4 last:border-b-0 last:pb-0"
              >
                <span>{label}</span>
                <span className="text-sm text-[var(--color-text-tertiary)]">
                  {value}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
