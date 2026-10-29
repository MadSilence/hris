"use client";

import React from "react";
import Link from "next/link";
import { CalendarPlus, Clock } from "lucide-react";
import { Button } from "@/public/desact/src/components/ui/button";
import { useCanAccess } from "@/components/auth/useAccess";
import { useCurrentUser } from "@/components/providers/CurrentUserProvider/CurrentUserProvider";
import { HomeCard } from "@/components/modules/home/components/HomeCard";

/**
 * The two things people come to an HR system to do in a hurry. Each goes to the reader's own profile tab,
 * where the form and the data behind it already live — `?request=1` opens the request form on arrival. Each
 * button is drawn only for somebody who could act; the widget itself is offered only when one of them is.
 */
export const QuickActionsWidget: React.FC = () => {
  const { userId } = useCurrentUser();
  const canRequest = useCanAccess("PEOPLE.TIME_OFF", "EDIT");
  const canLog = useCanAccess("PEOPLE.ATTENDANCE", "EDIT");

  return (
    <HomeCard title="Quick Actions">
      <div className="flex flex-wrap gap-2">
        {canRequest && userId && (
          <Button asChild variant="outline" size="sm" className="gap-1.5">
            <Link href={`/organization/people/${userId}/time-off?request=1`}>
              <CalendarPlus className="h-4 w-4" />
              Request Time Off
            </Link>
          </Button>
        )}
        {canLog && userId && (
          <Button asChild variant="outline" size="sm" className="gap-1.5">
            <Link href={`/organization/people/${userId}/attendance`}>
              <Clock className="h-4 w-4" />
              Log Time
            </Link>
          </Button>
        )}
      </div>
    </HomeCard>
  );
};
