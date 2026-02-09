"use client";

import React from "react";
import styles from "./LegalEntityContainer.module.css";
import { LegalEntityComponent } from "@/components/modules/settings/modules/legalEntity/components/LegalEntityComponent";
import { useLegalEntity } from "@/components/modules/settings/modules/legalEntity/hooks/useLegalEntity";
import { Loader } from "@/components/ui/Loader";

const LegalEntityContainer: React.FC = () => {
  const {
    data: legalEntities,
    isLoading: legalEntitiesLoading,
    error: legalEntitiesError,
  } = useLegalEntity();

  return (
    (legalEntitiesLoading ?
        <div className={styles.loaderWrapper}>
          <Loader/>
        </div>
        :
        <div className={styles.outer}>
          <div className={styles.container}>
            <LegalEntityComponent initialEntities={legalEntities}/>
          </div>
        </div>
    )
  );
};

export default LegalEntityContainer;
