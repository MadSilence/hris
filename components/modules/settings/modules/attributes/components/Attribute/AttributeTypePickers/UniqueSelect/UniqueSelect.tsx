"use client";

import { FC } from "react";
import { Checkbox } from "@/public/desact/src/components/ui/checkbox";
import { Label } from "@/public/desact/src/components/ui/label";

type UniqueSelectProps = {
  checked: boolean;
  onChangeAction: (value: boolean) => void;
};

export const UniqueSelect: FC<UniqueSelectProps> = ({
  checked,
  onChangeAction,
}) => {
  return (
    <div className="flex items-center gap-3">
      <Checkbox
        id="unique-checkbox"
        checked={checked}
        onCheckedChange={(value) => onChangeAction(value === true)}
      />

      <Label
        htmlFor="unique-checkbox"
        className="cursor-pointer leading-none mb-0"
      >
        Unique
      </Label>
    </div>
  );
};
