import * as React from "react";
import { FolderOpenIcon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";

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
    <div className="flex h-full min-h-[260px] flex-col items-center justify-center gap-3 rounded-card border border-dashed border-divider bg-subtle/40 p-10 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-pill bg-mist text-tertiary">
        {icon ?? <Icon icon={FolderOpenIcon} size="lg" />}
      </div>

      <h3 className="text-body font-medium text-primary">{title}</h3>

      <p className="max-w-sm text-body text-tertiary">{description}</p>
    </div>
  );
};
