import { Extension, type Editor, type Range } from "@tiptap/core";
import { PluginKey } from "@tiptap/pm/state";
import Suggestion, { type SuggestionKeyDownProps, type SuggestionProps } from "@tiptap/suggestion";

/** The "/" menu's entries (CM06), in the spec's order. */
export const SLASH_ITEMS = ["heading", "text", "bulletList", "orderedList", "image", "table", "pageLink", "divider"] as const;
export type SlashItem = (typeof SLASH_ITEMS)[number];

/** What the React side gives the plugin: the words to filter by, and somewhere to draw. */
export type SlashBridge = {
  label: (item: SlashItem) => string;
  show: (state: { items: SlashItem[]; rect: DOMRect | null; command: (item: SlashItem) => void } | null) => void;
  keyDown: (event: KeyboardEvent) => boolean;
  run: (item: SlashItem, editor: Editor, range: Range) => void;
};

/** Filters the entries by what follows the "/", against their words in the page's language. */
export const filterSlashItems = (query: string, label: (item: SlashItem) => string): SlashItem[] => {
  const q = query.trim().toLocaleLowerCase();
  return SLASH_ITEMS.filter((item) => !q || label(item).toLocaleLowerCase().includes(q));
};

/**
 * "/" opens a menu at the caret (a small extension of our own over `@tiptap/suggestion`, MIT — the commercial
 * slash-command package is not used). The plugin finds the trigger; drawing the list is the React side's job.
 */
export const slashCommand = (bridge: { current: SlashBridge | null }) =>
  Extension.create({
    name: "hubSlashCommand",
    addProseMirrorPlugins() {
      return [
        Suggestion<SlashItem, SlashItem>({
          editor: this.editor,
          pluginKey: new PluginKey("hubSlashCommand"),
          char: "/",
          allowSpaces: false,
          startOfLine: false,
          items: ({ query }) => (bridge.current ? filterSlashItems(query, bridge.current.label) : []),
          command: ({ editor, range, props }) => bridge.current?.run(props, editor, range),
          render: () => {
            const draw = (props: SuggestionProps<SlashItem, SlashItem>) =>
              bridge.current?.show({ items: props.items, rect: props.clientRect?.() ?? null, command: props.command });
            return {
              onStart: draw,
              onUpdate: draw,
              onExit: () => bridge.current?.show(null),
              onKeyDown: (props: SuggestionKeyDownProps) => {
                if (props.event.key === "Escape") {
                  bridge.current?.show(null);
                  return true;
                }
                return bridge.current?.keyDown(props.event) ?? false;
              },
            };
          },
        }),
      ];
    },
  });
