"use client";

import * as React from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/public/desact/src/components/ui/dialog";
import { Button } from "@/public/desact/src/components/ui/button";
import { Input } from "@/public/desact/src/components/ui/input";
import { Label } from "@/public/desact/src/components/ui/label";
import { Switch } from "@/public/desact/src/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/public/desact/src/components/ui/select";
import { LayoutTemplate, Plus } from "lucide-react";

type Template = { id: string; name: string; description?: string };

export interface AddRoleModalProps {
  isOpen: boolean;
  isLoading?: boolean;
  templates: Template[];

  onRequestClose: () => void;
  onCreateBlank: (values: { name: string }) => void;
  onCreateFromTemplate: (values: { templateId: string; name?: string }) => void;
}

export default function AddRoleModal({
  isOpen,
  isLoading = false,
  templates,
  onRequestClose,
  onCreateBlank,
  onCreateFromTemplate,
}: AddRoleModalProps) {
  const [useTemplate, setUseTemplate] = React.useState(false);

  const [name, setName] = React.useState("");
  const [templateId, setTemplateId] = React.useState<string | undefined>(undefined);
  const [templateName, setTemplateName] = React.useState("");

  React.useEffect(() => {
    if (!isOpen) return;
    setUseTemplate(false);
    setName("");
    setTemplateId(templates[0]?.id);
    setTemplateName("");
  }, [isOpen, templates]);

  const canSubmit = React.useMemo(() => {
    if (useTemplate) return !!templateId;
    return name.trim().length >= 2;
  }, [useTemplate, templateId, name]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onRequestClose()}>
      <DialogContent className="sm:max-w-xl p-8" hideClose>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-brown-600"/>
            Add new role
          </DialogTitle>
          <DialogDescription>
            Create a new role from scratch or start from a template and adjust it later.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 space-y-6">
          <div className="flex items-center justify-between gap-4 rounded-md bg-brown-50 px-4 py-3">
            <div className="min-w-0">
              <div className="text-sm font-medium flex items-center gap-2">
                <LayoutTemplate className="w-4 h-4 text-brown-600"/>
                Choose from a template
              </div>
              <div className="text-xs text-muted-foreground">
                Pick a ready configuration and customize it in the future.
              </div>
            </div>

            <Switch
              checked={useTemplate}
              onCheckedChange={(v) => setUseTemplate(Boolean(v))}
              disabled={isLoading || templates.length === 0}
            />
          </div>

          {!useTemplate ? (
            <div className="space-y-2">
              <Label>Role name</Label>
              <Input
                placeholder="e.g. HR Manager"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isLoading}
              />
              <div className="text-xs text-muted-foreground">Minimum 2 characters.</div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Template</Label>
                <Select
                  value={templateId}
                  onValueChange={(v) => setTemplateId(v)}
                  disabled={isLoading || templates.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select template"/>
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {templateId && (
                  <div className="text-xs text-muted-foreground">
                    {templates.find((t) => t.id === templateId)?.description ??
                      "You can edit permissions after creation."}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Role name (optional)</Label>
                <Input
                  placeholder="Leave empty to use template name"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="mt-8">
          <DialogClose asChild>
            <Button variant="outline" disabled={isLoading}>
              Cancel
            </Button>
          </DialogClose>

          <Button
            disabled={isLoading || !canSubmit}
            className="bg-brown-600 text-white hover:bg-brown-700"
            onClick={() => {
              if (!canSubmit) return;

              if (!useTemplate) {
                onCreateBlank({ name: name.trim() });
                return;
              }

              if (!templateId) return;
              const n = templateName.trim();
              onCreateFromTemplate({ templateId, name: n ? n : undefined });
            }}
          >
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
