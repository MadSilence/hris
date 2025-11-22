"use client";

import styles from "./SettingsContainer.module.css";
import SettingsCard from "@/components/modules/settings/components/SettingsCard/SettingsCard";
import { settingsGroups } from "@/components/modules/settings/config/settings.config";
import React from "react";

const SettingsContainer: React.FC = () => {
  return (
    <div className={styles.wrap}>
      <h1 className={styles.title}>Settings</h1>

      <div className={styles.grid}>
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
  );
};

export default SettingsContainer;
