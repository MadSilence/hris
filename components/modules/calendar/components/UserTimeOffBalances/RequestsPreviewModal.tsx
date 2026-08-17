"use client";

import { FC } from "react";
import { CalendarClock } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/public/desact/src/components/ui/dialog";

import { UserTimeOffRequests } from "./UserTimeOffRequests";

type Props = {
  isOpen: boolean;
  userId: string;
  onCloseAction: () => void;
};

/**
 * The request history and the Cancel action, which the calendar-only redesign left without a home.
 * Sits next to the Balances preview so both read-and-act surfaces open the same way.
 */
export const RequestsPreviewModal: FC<Props> = ({ isOpen, userId, onCloseAction }) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCloseAction()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brown-50 text-brown-600">
              <CalendarClock className="h-5 w-5"/>
            </span>
            <div>
              <DialogTitle>Time off requests</DialogTitle>
              <DialogDescription>
                Every request, newest first. Pending and approved ones can still be cancelled.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto pr-1">
          <UserTimeOffRequests userId={userId}/>
        </div>
      </DialogContent>
    </Dialog>
  );
};
