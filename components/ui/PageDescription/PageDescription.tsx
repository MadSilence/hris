import * as React from "react";
import { cn } from "@/public/desact/src/components/ui/utils";

export interface PageDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export const PageDescription: React.FC<PageDescriptionProps> = ({ children, className }) => {
  return (
    <p className={cn("text-muted-foreground/90 text-base leading-relaxed px-8", className)}>
      {children}
    </p>
  );
};

export default PageDescription;
