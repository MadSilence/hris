"use client";

import { FC } from "react";
import { Lock, SlidersHorizontal } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/public/desact/src/components/ui/tabs";
import AttributeGroupsContainer
  from "@/components/modules/settings/modules/attributes/components/AttributeGroupsContainer/AttributeGroupsContainer";
import {
  SystemFieldsSection,
} from "@/components/modules/settings/modules/attributes/components/SystemFieldsSection";

/**
 * The two halves of the field catalogue, as tabs rather than as one long page.
 *
 * <p><b>Custom is the default</b> because it is the half an administrator comes here to change; the
 * system half is a reference they look at occasionally, and it used to sit above the work.
 *
 * <p>The tabs are their own row above the content — `ui/ACTIONS_AND_MENUS.md`: tabs choose *which*
 * list, so they never live inside a toolbar.
 */
export const PersonFieldsTabs: FC = () => (
  <Tabs defaultValue="custom" className="w-full">
    <TabsList className="grid w-full grid-cols-2 bg-brown-50">
      <TabsTrigger value="custom" className="flex items-center gap-2">
        <SlidersHorizontal className="h-4 w-4"/>
        Custom Fields
      </TabsTrigger>
      <TabsTrigger value="system" className="flex items-center gap-2">
        <Lock className="h-4 w-4"/>
        System Fields
      </TabsTrigger>
    </TabsList>

    <TabsContent value="custom" className="mt-8">
      <AttributeGroupsContainer/>
    </TabsContent>

    <TabsContent value="system" className="mt-8">
      <SystemFieldsSection/>
    </TabsContent>
  </Tabs>
);

export default PersonFieldsTabs;
