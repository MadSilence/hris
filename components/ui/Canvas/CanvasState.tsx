import * as React from "react";

/**
 * Состояния канваса оргструктуры — общие для департаментов, команд и орг-чарта.
 *
 * Скелетон повторяет форму того, что появится: корневой узел, коннекторы и три ребёнка. Спиннер на
 * его месте давал бы полный сдвиг макета, а канвас — самый крупный блок на экране.
 */
export function CanvasLoading({ label }: { label: string }) {
  return (
    <div
      role="status"
      aria-label={label}
      className="flex h-full flex-col items-center justify-center px-6"
    >
      <div className="flex flex-col items-center animate-pulse">
        {/* root node */}
        <div className="flex w-56 items-center gap-3 rounded-xl border border-brown-200 bg-white p-3 shadow-sm">
          <div className="h-9 w-9 flex-none rounded-lg bg-brown-100" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-28 rounded bg-brown-100" />
            <div className="h-2.5 w-16 rounded bg-brown-100" />
          </div>
        </div>
        {/* connectors */}
        <div className="h-6 w-px bg-brown-200" />
        <div className="h-px w-64 bg-brown-200" />
        {/* children */}
        <div className="flex gap-6">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="h-6 w-px bg-brown-200" />
              <div className="w-40 space-y-2 rounded-xl border border-brown-200 bg-white p-3 shadow-sm">
                <div className="h-3 w-24 rounded bg-brown-100" />
                <div className="h-2.5 w-14 rounded bg-brown-100" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <p className="mt-6 text-sm text-brown-400">{label}</p>
    </div>
  );
}

export function CanvasMessage({
  children,
  tone = "muted",
}: {
  children: React.ReactNode;
  tone?: "muted" | "error";
}) {
  return (
    <div
      className={`flex h-full flex-col items-center justify-center px-6 text-center text-sm ${
        tone === "error" ? "text-red-500" : "text-brown-400"
      }`}
    >
      {children}
    </div>
  );
}
