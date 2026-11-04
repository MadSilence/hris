import * as React from "react";
import { cn } from "@/lib/cn";

export interface PageDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export const PageDescription: React.FC<PageDescriptionProps> = ({ children, className }) => {
  return (
    <p className={cn("text-tertiary/90 text-body leading-relaxed", className)}>
      {children}
    </p>
  );
};

export default PageDescription;
