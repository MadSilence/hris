import { MyTasksContainer } from "@/components/modules/lifecycle/tasks/MyTasksContainer";

export default function TasksPage() {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-4">
      <div>
        <h1 className="text-3xl font-semibold text-brown-900">Tasks</h1>
        <p className="mt-1 text-sm text-muted-foreground">What is assigned to you.</p>
      </div>
      <MyTasksContainer />
    </div>
  );
}
