import styles from "./InputWithSuffix.module.css";

type Props = {
  id: string;
  value: string;
  placeholder?: string;
  suffix: string;
  onChange: (v: string) => void;
};

export default function InputWithSuffix({ id, value, placeholder, suffix, onChange }: Props) {
  return (
    <div className={styles.wrap}>
      <input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={styles.input}
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
      />
      <span className={styles.suffix}>{suffix}</span>
    </div>
  );
}
