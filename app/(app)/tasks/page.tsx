import { getTranslations } from "next-intl/server";
import { MyTasksContainer } from "@/components/modules/lifecycle/tasks/MyTasksContainer";

export default async function TasksPage() {
  const t = await getTranslations("lifecycle");
  return (
    /*
     * A full-height column, not a stack that ends where its content does — `6rem` is the shell's own
     * `pt-16 pb-8`. The Inbox has been shaped this way from the start; Tasks and Processes were the
     * two pages where an empty state sat as a small card under the heading with the screen blank
     * beneath it.
     */
    <div className="mx-auto flex h-[calc(100svh-6rem)] w-full max-w-5xl flex-col gap-4">
      <div className="shrink-0">
        <h1 className="text-page-title text-primary">{t("pages.tasksTitle")}</h1>
        <p className="mt-1 text-body text-tertiary">{t("pages.tasksDescription")}</p>
      </div>
      <MyTasksContainer />
    </div>
  );
}
