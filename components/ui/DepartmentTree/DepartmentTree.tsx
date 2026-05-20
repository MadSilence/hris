"use client";

import React from "react";
import styles from "./DepartmentTree.module.css";
import Building from "@/public/icons/building.svg";
import ArrowDown from "@/public/icons/arrow-down.svg";
import ArrowUp from "@/public/icons/arrow-up.svg";

export type DepartmentNode = {
  id: string;
  name: string;
  members: number;
  children?: DepartmentNode[];
};

type DepartmentTreeProps = {
  data: DepartmentNode[];
  defaultExpandedIds?: string[];
  onSelect?: (node: DepartmentNode) => void;
};

type NodeProps = {
  node: DepartmentNode;
  level: number;
  expandedSet: Set<string>;
  toggleNode: (id: string) => void;
  onSelect?: (node: DepartmentNode) => void;
};

function Node({ node, level, expandedSet, toggleNode, onSelect }: NodeProps) {
  const hasChildren = (node.children?.length ?? 0) > 0;
  const isExpanded = expandedSet.has(node.id);

  return (
    <li>
      <div
        className={styles.row}
        role="treeitem"
        aria-level={level}
        aria-expanded={hasChildren ? isExpanded : undefined}
        onClick={() => onSelect?.(node)}
      >
        <span className={styles.levelGuides} aria-hidden="true">
          {Array.from({ length: level - 1 }, (_, i) => (
            <span key={i} className={styles.levelGuide}/>
          ))}
        </span>

        {hasChildren ? (
          <button
            type="button"
            className={styles.toggleButton}
            aria-label={isExpanded ? "Collapse" : "Expand"}
            onClick={(e) => {
              e.stopPropagation();
              toggleNode(node.id);
            }}
          >
            {isExpanded ? <ArrowDown/> : <ArrowUp/>}
          </button>
        ) : (
          <span className={styles.togglePlaceholder} aria-hidden="true"/>
        )}

        <span className={styles.icon} aria-hidden="true">
          <Building/>
        </span>

        <span className={styles.name}>{node.name}</span>

        <span className={styles.badge}>{node.members}</span>
      </div>

      {hasChildren && isExpanded && (
        <ul className={styles.list} role="group">
          {node.children!.map((child) => (
            <Node
              key={child.id}
              node={child}
              level={level + 1}
              expandedSet={expandedSet}
              toggleNode={toggleNode}
              onSelect={onSelect}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

export function DepartmentTree({ data, defaultExpandedIds = [], onSelect }: DepartmentTreeProps) {
  const [expandedSet, setExpandedSet] = React.useState<Set<string>>(
    () => new Set(defaultExpandedIds)
  );

  function toggleNode(id: string) {
    setExpandedSet((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  return (
    <nav className={styles.tree} aria-label="Departments">
      <ul className={styles.list} role="tree">
        {data.map((node) => (
          <Node
            key={node.id}
            node={node}
            level={1}
            expandedSet={expandedSet}
            toggleNode={toggleNode}
            onSelect={onSelect}
          />
        ))}
      </ul>
    </nav>
  );
}
