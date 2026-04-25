import * as React from "react";

export const PersonalDocumentsEmptyState: React.FC = () => {
  return (
    <div className="rounded-lg border bg-white p-10 text-center">
      <h3 className="text-lg font-medium">No folders or files</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        This location is empty. Create a folder or upload a file to get started.
      </p>
    </div>
  );
};
