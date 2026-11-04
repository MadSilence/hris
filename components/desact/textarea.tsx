import * as React from "react";

import { cn } from "@/lib/cn";
import { fieldClasses } from "./input";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(fieldClasses, "field-sizing-content min-h-20 resize-none px-3 py-2", className)}
      {...props}
    />
  );
}

export { Textarea };
