import { MyTasksContainer } from "@/components/modules/lifecycle/tasks/MyTasksContainer";

export default function TasksPage() {
  return (
    /*
     * A full-height column, not a stack that ends where its content does — `6rem` is the shell's own
     * `pt-16 pb-8`. The Inbox has been shaped this way from the start; Tasks and Processes were the
     * two pages where an empty state sat as a small card under the heading with the screen blank
     * beneath it.
     */
    <div className="mx-auto flex h-[calc(100svh-6rem)] w-full max-w-5xl flex-col gap-4">
      <div className="shrink-0">
        <h1 className="text-3xl font-semibold text-brown-900">Tasks</h1>
        <p className="mt-1 text-sm text-muted-foreground">What is assigned to you.</p>
      </div>
      <MyTasksContainer />
    </div>
  );
}
