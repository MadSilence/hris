/**
 * A stand-in for the desact (Radix) `Select`, as a native `<select>` — so a test picks an option with
 * `fireEvent.change(getByLabelText("Trigger"), { target: { value: "DATE_OFFSET" } })` instead of
 * driving a portal listbox jsdom can barely open.
 *
 * Use it as the module factory:
 *   jest.mock("@/public/desact/src/components/ui/select", () => jest.requireActual("@/test/selectMock"));
 *
 * The label comes from `SelectTrigger`'s `aria-label`; the options from every `SelectItem` inside
 * `SelectContent`, in order.
 */
import * as React from "react";

type ItemProps = { value: string; children?: React.ReactNode };
type TriggerProps = { "aria-label"?: string; id?: string; children?: React.ReactNode };

const textOf = (node: React.ReactNode): string => {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (React.isValidElement<{ children?: React.ReactNode }>(node)) return textOf(node.props.children);
  return "";
};

export const SelectItem: React.FC<ItemProps> = () => null;
export const SelectTrigger: React.FC<TriggerProps> = () => null;
export const SelectValue: React.FC<{ placeholder?: string }> = () => null;
export const SelectContent: React.FC<{ children?: React.ReactNode }> = () => null;
export const SelectGroup: React.FC<{ children?: React.ReactNode }> = () => null;
export const SelectLabel: React.FC<{ children?: React.ReactNode }> = () => null;

const walk = (
  node: React.ReactNode,
  found: { label?: string; id?: string; items: { value: string; text: string }[] },
) => {
  React.Children.forEach(node, (child) => {
    if (!React.isValidElement<Record<string, unknown> & { children?: React.ReactNode }>(child)) return;
    if (child.type === SelectTrigger) {
      found.label = child.props["aria-label"] as string | undefined;
      found.id = child.props.id as string | undefined;
      return;
    }
    if (child.type === SelectItem) {
      found.items.push({ value: String(child.props.value), text: textOf(child.props.children) });
      return;
    }
    walk(child.props.children, found);
  });
};

export const Select: React.FC<{
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  children?: React.ReactNode;
}> = ({ value, onValueChange, disabled, children }) => {
  const found: { label?: string; id?: string; items: { value: string; text: string }[] } = { items: [] };
  walk(children, found);
  return (
    <select
      aria-label={found.label}
      id={found.id}
      value={value ?? ""}
      disabled={disabled}
      onChange={(e) => onValueChange?.(e.target.value)}
    >
      <option value="" disabled>Select</option>
      {found.items.map((i) => <option key={i.value} value={i.value}>{i.text}</option>)}
    </select>
  );
};
