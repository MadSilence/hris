"use client";

import * as React from "react";
import { Card, CardContent, CardHeader } from "@/public/desact/src/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/public/desact/src/components/ui/tabs";
import { Database, Shield } from "lucide-react";
import { Toast } from "@/components/ui/Toast";
import { RolePermissionsHeader } from "./RolePermissionsHeader";
import ModulesAccessTable, {
  ModuleLevel
} from "@/components/modules/settings/modules/roles/components/RoleDetailsContainer/modules/Permissions/ModulesAccessTable/ModulesAccessTable";
import AttributeGroupsTable
  from "@/components/modules/settings/modules/roles/components/RoleDetailsContainer/modules/Permissions/AttributeGroupsTable/AttributeGroupsTable";
import { AttributeGroup } from "@/models/attribute";

type View = "modules" | "personal";

export default function RolePermissionsView(props: {
  roleId: string;
  modulesData: any;
  modulesLoading: boolean;
  attributeGroups: AttributeGroup[];
  groupsLoading: boolean;
  saveModules: (payload: any) => Promise<void>;
  savingModules: boolean;
}) {
  const { modulesData, modulesLoading, attributeGroups, groupsLoading, saveModules, savingModules } = props;

  const [view, setView] = React.useState<View>("modules");
  const [toastMsg, setToastMsg] = React.useState<string | null>(null);

  const [pendingModules, setPendingModules] = React.useState<Record<string, ModuleLevel> | null>(null);
  const currentModules = pendingModules ?? modulesData?.modules ?? {};
  const hasPending = !!pendingModules;

  const onSave = async () => {
    if (!pendingModules) return;
    try {
      await saveModules({ modules: pendingModules });
      setPendingModules(null);
      setToastMsg("Permissions saved");
    } catch {
      setToastMsg("Failed to save permissions");
    }
  };

  return (
    <Card className="border-0 px-8 pt-8">
      <CardHeader className="py-0">
        <div className="flex items-center justify-between gap-4">
          <Tabs value={view} onValueChange={(v) => setView(v as View)} className="w-full">
            <TabsList className="grid grid-cols-2 bg-brown-50 w-[420px]">
              <TabsTrigger value="modules" className="flex items-center gap-2">
                <Shield className="w-4 h-4"/>
                Modules Access
              </TabsTrigger>

              <TabsTrigger value="personal" className="flex items-center gap-2">
                <Database className="w-4 h-4"/>
                Personal Data Access
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Save нужен только для modules-вкладки */}
          {view === "modules" && (
            <RolePermissionsHeader
              saving={savingModules}
              disabled={!hasPending}
              onSave={onSave}
              onReset={hasPending ? () => setPendingModules(null) : undefined}
            />
          )}
        </div>
      </CardHeader>

      <CardContent className="pb-0 pt-6">
        {view === "modules" ? (
          <ModulesAccessTable
            loading={modulesLoading}
            value={currentModules}
            onChange={(key, level) =>
              setPendingModules((prev) => ({ ...(prev ?? currentModules), [key]: level }))
            }
          />
        ) : (
          <AttributeGroupsTable loading={groupsLoading} groups={attributeGroups}/>
        )}
      </CardContent>

      {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg(null)}/>}
    </Card>
  );
}
