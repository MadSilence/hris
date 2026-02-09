import React from "react";
import styles from "./OfficeDetailsView.module.css";
import { Office } from "@/models/office";

export type OfficeDetailsViewProps = {
  office: Office;
};

export const OfficeDetailsView: React.FC<OfficeDetailsViewProps> = ({
  office,
}) => {
  return (
    <div className={styles.view}>
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Office details</h3>

        <div className={styles.row}>
          <span className={styles.label}>Name</span>
          <div className={styles.valueBox}>{office.name}</div>
        </div>

        <div className={styles.row}>
          <span className={styles.label}>Description</span>
          <div className={`${styles.valueBox} ${styles.valueMultiline}`}>
            {office.description}
          </div>
        </div>

        <div className={styles.row}>
          <span className={styles.label}>Email</span>
          <div className={styles.valueBox}>{office.email}</div>
        </div>

        <div className={styles.row}>
          <span className={styles.label}>Phone</span>
          <div className={styles.valueBox}>{office.phone}</div>
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Address</h3>

        <div className={styles.row}>
          <span className={styles.label}>Country</span>
          <div className={styles.valueBox}>{office.country}</div>
        </div>

        <div className={styles.row}>
          <span className={styles.label}>City</span>
          <div className={styles.valueBox}>{office.city}</div>
        </div>

        <div className={styles.rowTwoCols}>
          <div className={styles.subRow}>
            <span className={styles.label}>Street</span>
            <div className={styles.valueBox}>{office.street}</div>
          </div>
          <div className={styles.subRow}>
            <span className={styles.label}>Building</span>
            <div className={styles.valueBox}>{office.building}</div>
          </div>
        </div>

        <div className={styles.row}>
          <span className={styles.label}>Post code</span>
          <div className={styles.valueBox}>{office.postCode}</div>
        </div>
      </div>
    </div>
  );
};
