"use client";

import React from "react";
import styles from "./OfficeContainer.module.css";
import { OfficeComponent } from "@/components/modules/settings/modules/office/components/OfficeComponent";
import { useOffice } from "@/components/modules/settings/modules/office/hooks/useOffice";
import { Loader } from "@/components/ui/Loader";

const OfficeContainer: React.FC = () => {
  const {
    data: offices,
    isLoading: officesLoading,
    error: officesError,
  } = useOffice();

  return (
    (officesLoading ?
        <div className={styles.loaderWrapper}>
          <Loader/>
        </div>
        :
        <div className={styles.outer}>
          <div className={styles.container}>
            <OfficeComponent initialOffices={offices}/>
          </div>
        </div>
    )
  );
};

export default OfficeContainer;
