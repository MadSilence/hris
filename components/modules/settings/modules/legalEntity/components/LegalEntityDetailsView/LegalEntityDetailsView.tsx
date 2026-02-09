import React from "react";
import styles from "./LegalEntityDetailsView.module.css";
import { LegalEntity } from "@/models/legalEntity";


export type LegalEntityDetailsViewProps = {
  legalEntity: LegalEntity
}

export const LegalEntityDetailsView: React.FC<LegalEntityDetailsViewProps> = ({
  legalEntity
}) => {
  return (
    <div className={styles.view}>
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Legal entity details</h3>

        <div className={styles.row}>
          <span className={styles.label}>Name</span>
          <div className={styles.valueBox}>{legalEntity.name}</div>
        </div>

        <div className={styles.row}>
          <span className={styles.label}>Description</span>
          <div className={`${styles.valueBox} ${styles.valueMultiline}`}>
            {legalEntity.description}
          </div>
        </div>

        <div className={styles.row}>
          <span className={styles.label}>Registration number</span>
          <div className={styles.valueBox}>
            {legalEntity.registrationNumber}
          </div>
        </div>

        <div className={styles.row}>
          <span className={styles.label}>Tax ID</span>
          <div className={styles.valueBox}>{legalEntity.taxId}</div>
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Address</h3>

        <div className={styles.row}>
          <span className={styles.label}>Country</span>
          <div className={styles.valueBox}>{legalEntity.country}</div>
        </div>

        <div className={styles.row}>
          <span className={styles.label}>City</span>
          <div className={styles.valueBox}>{legalEntity.city}</div>
        </div>

        <div className={styles.rowTwoCols}>
          <div className={styles.subRow}>
            <span className={styles.label}>Street</span>
            <div className={styles.valueBox}>{legalEntity.street}</div>
          </div>
          <div className={styles.subRow}>
            <span className={styles.label}>Building</span>
            <div className={styles.valueBox}>{legalEntity.building}</div>
          </div>
        </div>

        <div className={styles.row}>
          <span className={styles.label}>Post code</span>
          <div className={styles.valueBox}>{legalEntity.postCode}</div>
        </div>
      </div>
    </div>
  );
};
