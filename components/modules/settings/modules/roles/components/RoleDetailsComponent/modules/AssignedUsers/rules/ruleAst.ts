export type RuleGroupOp = "AND" | "OR";

export type RuleCondition = {
  type: "condition";
  fieldId: string;
  fieldType:
    | "TEXT"
    | "SELECT"
    | "STATUS"
    | "PERSON"
    | "CHECKBOX"
    | "NUMBER"
    | "MULTI_SELECT"
    | "DATE"
    | "EMAIL"
    | "URL";
  operator: string;
  value?: string | boolean | number;
  values?: string[];
  valueTo?: string;
};

export type RuleGroup = {
  type: "group";
  op: RuleGroupOp;
  children: Array<RuleGroup | RuleCondition>;
};

export type RuleAST = {
  root: RuleGroup[];
};

export const normalizeFieldId = (uuid: string) => `attr:${uuid}`;

export const serializeAST = (ast: RuleAST): string => JSON.stringify(ast);

export const deserializeAST = (json: string): RuleAST => JSON.parse(json);
