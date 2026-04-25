import * as React from "react";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, } from "@/public/desact/src/components/ui/form";
import { Input } from "@/public/desact/src/components/ui/input";

type FormValues = { name: string };

export interface RenameRoleFormProps {
  initialName: string;
  isLoading?: boolean;
  submitText?: string;
  onSubmit: (values: FormValues) => void;
  onCancel?: () => void;
  autoFocus?: boolean;
}

export default function RenameRoleForm({
  initialName,
  isLoading = false,
  onSubmit,
  autoFocus = true,
}: RenameRoleFormProps) {
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const form = useForm<FormValues>({
    defaultValues: { name: initialName ?? "" },
    mode: "onChange",
  });

  React.useLayoutEffect(() => {
    if (!autoFocus) return;
    const el = inputRef.current;
    if (!el) return;

    const raf = requestAnimationFrame(() => {
      el.focus({ preventScroll: true });
      const len = el.value?.length ?? 0;
      try {
        el.setSelectionRange(len, len);
      } catch {
      }
    });

    return () => cancelAnimationFrame(raf);
  }, [autoFocus]);

  React.useEffect(() => {
    if (!autoFocus) return;

    const el = inputRef.current;
    if (!el) return;

    // next tick — после открытия диалога
    const id = window.setTimeout(() => {
      el.focus({ preventScroll: true });

      // поставить курсор в конец без выделения
      const len = el.value?.length ?? 0;
      try {
        el.setSelectionRange(len, len);
      } catch {
        // ignore
      }
    }, 0);

    return () => window.clearTimeout(id);
  }, [autoFocus]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-6">
        <FormField
          control={form.control}
          name="name"
          rules={{
            required: "Role name is required",
            minLength: { value: 2, message: "Minimum 2 characters" },
          }}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">Role name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter role name"
                  {...field}
                  onFocus={(e) => {
                    // если браузер выделил всё — снимем выделение
                    const el = e.currentTarget;
                    const len = el.value?.length ?? 0;
                    try {
                      el.setSelectionRange(len, len);
                    } catch {
                    }
                  }}
                  ref={(node) => {
                    field.ref(node);
                    inputRef.current = node;
                  }}
                />
              </FormControl>
              <FormMessage/>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
