import * as React from "react";
import styles from "./Card.module.css";
import { JSX } from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: keyof JSX.IntrinsicElements;
}

export function Card({ as: Tag = "div", className, ...props }: CardProps) {
  // @ts-ignore
  return <Tag className={[styles.root, className].filter(Boolean).join(" ")} {...props} />;
}

export default Card;
