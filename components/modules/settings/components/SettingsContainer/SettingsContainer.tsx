"use client";

import SettingsCard from "@/components/modules/settings/components/SettingsCard/SettingsCard";
import { settingsGroups } from "@/components/modules/settings/config/settings.config";
import React from "react";

const SettingsContainer: React.FC = () => {
  return (
    <div className="bg-muted/40">
      <header className="pt-3">
        <div className="max-w-screen-xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <div className="min-w-0">
                <h1 className="text-[40px] leading-tight">Settings</h1>
                <p className="text-[13px] text-muted-foreground mt-1">Configure your organization and people settings</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-screen-xl mx-auto px-6 py-6 grid gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 items-start">
          {settingsGroups.map((group) => (
            <SettingsCard
              key={group.id}
              title={group.title}
              icon={group.icon}
              items={group.items}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SettingsContainer;
