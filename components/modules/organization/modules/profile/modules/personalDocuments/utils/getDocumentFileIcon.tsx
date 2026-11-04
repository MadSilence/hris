import * as React from "react";
import { Doc01Icon, File01Icon, Image01Icon, Pdf01Icon, Xls01Icon } from "@hugeicons/core-free-icons";
import { Icon } from "@/components/desact/icon";

/* A file's type, as an icon of the one set (SPEC § 9): neutral, in the text colour. */

export const getDocumentFileIcon = (mimeType: string) => {
  const normalized = mimeType.toLowerCase();

  if (normalized.includes("pdf")) {
    return <Icon icon={Pdf01Icon} size="sm" />;
  }

  if (
    normalized.includes("word") ||
    normalized.includes("document") ||
    normalized.includes("msword")
  ) {
    return <Icon icon={Doc01Icon} size="sm" />;
  }

  if (
    normalized.includes("sheet") ||
    normalized.includes("excel") ||
    normalized.includes("spreadsheet") ||
    normalized.includes("csv")
  ) {
    return <Icon icon={Xls01Icon} size="sm" />;
  }

  if (normalized.startsWith("image/")) {
    return <Icon icon={Image01Icon} size="sm" />;
  }

  return <Icon icon={File01Icon} size="sm" />;
};
