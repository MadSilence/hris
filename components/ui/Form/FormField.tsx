import styles from "./FormField.module.css";

type Props = {
  id: string;
  label?: string;
  error?: string;
  hint?: string;
  children: React.ReactNode; // your <input> / custom control
};

export default function FormField({ id, label, error, hint, children }: Props) {
  return (
    <div className={`${styles.field} ${error ? styles.invalid : ""}`}>
      {label && (
        <label htmlFor={id} className={styles.label}>
          {label}
        </label>
      )}
      <div className={styles.control}>{children}</div>
      {error ? (
        <p className={styles.error} role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className={styles.hint}>{hint}</p>
      ) : null}
    </div>
  );
}
