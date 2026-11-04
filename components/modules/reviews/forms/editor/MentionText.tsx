import React from "react";
import { splitMentions } from "@/models/reviews/mentions";

/** A form's text as written, its `@` tokens on the same background the editor gives them — for a list that quotes it. */
export function MentionText({ text }: { text: string }) {
  return (
    <>
      {splitMentions(text).map((s, i) =>
        s.token
          ? <mark key={i} data-token={s.token} className="rounded-control bg-mist px-0.5 text-inherit">{s.text}</mark>
          : <React.Fragment key={i}>{s.text}</React.Fragment>,
      )}
    </>
  );
}
