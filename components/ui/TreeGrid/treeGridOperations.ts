import { TreeNodeBase, TreePosition } from "./types";

export function cloneTree(nodes: TreeNodeBase[]): TreeNodeBase[] {
  return nodes.map((node) => ({
    ...node,
    children: node.children ? cloneTree(node.children) : undefined,
  }));
}

export function removeNode(
  nodes: TreeNodeBase[],
  id: string
): { tree: TreeNodeBase[]; removed: TreeNodeBase | null } {
  const result: TreeNodeBase[] = [];
  let removed: TreeNodeBase | null = null;

  for (const node of nodes) {
    if (node.id === id) {
      removed = node;
      continue;
    }
    if (node.children && node.children.length) {
      const { tree: newChildren, removed: extracted } = removeNode(node.children, id);
      if (extracted) {
        removed = extracted;
      }
      result.push({ ...node, children: newChildren });
    } else {
      result.push(node);
    }
  }

  return { tree: result, removed };
}

export function insertAsLastChild(
  nodes: TreeNodeBase[],
  parentId: string,
  nodeToInsert: TreeNodeBase
): TreeNodeBase[] {
  return nodes.map((node) => {
    if (node.id === parentId) {
      const children = node.children ? [...node.children, nodeToInsert] : [nodeToInsert];
      return { ...node, children };
    }
    if (node.children && node.children.length) {
      return {
        ...node,
        children: insertAsLastChild(node.children, parentId, nodeToInsert),
      };
    }
    return node;
  });
}

export function insertAtRoot(
  nodes: TreeNodeBase[],
  nodeToInsert: TreeNodeBase
): TreeNodeBase[] {
  return [...nodes, nodeToInsert];
}

export function flattenPositions(
  nodes: TreeNodeBase[],
  parentId: string | null = null,
  accumulator: TreePosition[] = []
): TreePosition[] {
  nodes.forEach((node, index) => {
    accumulator.push({ id: node.id, parentId, index });
    if (node.children && node.children.length) {
      flattenPositions(node.children, node.id, accumulator);
    }
  });
  return accumulator;
}
