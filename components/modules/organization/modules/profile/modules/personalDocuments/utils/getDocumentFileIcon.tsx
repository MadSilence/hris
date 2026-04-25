import * as React from "react";
import { File, } from "lucide-react";
import Excel from "@/public/icons/excel.svg";
import Word from "@/public/icons/word.svg";
import Pdf from "@/public/icons/pdf.svg";
import Jpg from "@/public/icons/jpg.svg";

export const getDocumentFileIcon = (mimeType: string) => {
  const normalized = mimeType.toLowerCase();

  if (normalized.includes("pdf")) {
    return <Pdf className="h-4 w-4"/>;
  }

  if (
    normalized.includes("word") ||
    normalized.includes("document") ||
    normalized.includes("msword")
  ) {
    return <Word className="h-4 w-4"/>;
  }

  if (
    normalized.includes("sheet") ||
    normalized.includes("excel") ||
    normalized.includes("spreadsheet") ||
    normalized.includes("csv")
  ) {
    return <Excel className="h-4 w-4"/>;
  }

  if (normalized.startsWith("image/")) {
    return <Jpg className="h-4 w-4"/>;
  }

  return <File className="h-4 w-4"/>;
};
