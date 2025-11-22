"use client";
import styles from "./SubdomainField.module.css";

type Props = {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  invalid?: boolean;
  id?: string;
};

export default function SubdomainField({
  value,
  onChange,
  placeholder = "your-company",
  invalid,
  id,
}: Props) {
  return (
    <div className={`${styles.wrap} ${invalid ? styles.invalid : ""}`}>
      <input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={styles.input}
        aria-invalid={invalid || undefined}
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
      />
      <div className={styles.suffix}>.app.sixsoftware.com</div>
    </div>
  );
}
