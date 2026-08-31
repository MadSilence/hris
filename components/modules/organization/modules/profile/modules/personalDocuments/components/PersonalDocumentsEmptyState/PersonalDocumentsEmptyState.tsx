import * as React from "react";
import { FolderOpen } from "lucide-react";

type Props = {
  /** Defaults describe an empty folder; the trash passes its own wording. */
  title?: string;
  description?: string;
  icon?: React.ReactNode;
};

/**
 * The "there is nothing here" panel for the Documents tab and its trash.
 *
 * It fills the space it is given rather than sitting as a small card at the top of an otherwise
 * blank page — an empty folder should look like an empty folder, not like a notice that failed to
 * load. Dashed edge and a tint, so it reads as a place waiting for content instead of a surface.
 */
export const PersonalDocumentsEmptyState: React.FC<Props> = ({
  title = "No folders or files",
  description = "This location is empty. Create a folder or upload a file to get started.",
  icon,
}) => {
  return (
    <div className="flex h-full min-h-[260px] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-brown-200 bg-brown-50/40 p-10 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brown-100 text-brown-500">
        {icon ?? <FolderOpen className="h-6 w-6"/>}
      </div>

      <h3 className="text-base font-medium text-foreground">{title}</h3>

      <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
    </div>
  );
};
