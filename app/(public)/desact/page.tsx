"use client";

import { useRouter } from "next/navigation";
import { ReadMePage } from "@/public/desact/src/components/ReadMePage";
import { COMPONENTS_DATA } from "@/public/desact/src/components/constants/componentsData";

export default function DesactHome() {
  const router = useRouter();
  const onBack = () => router.push("/");
  const onComponentClick = (name: string) => {
    const slug = name.toLowerCase().replace(/\s+/g, "-");
    router.push(`/desact/${slug}`);
  };

  return (
    <ReadMePage
      onBack={onBack}
      components={COMPONENTS_DATA}
      onComponentClick={onComponentClick}
      currentComponent="Read Me"
    />
  );
}
