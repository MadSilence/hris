import { ImageResponse } from "next/og";

/*
 * The app icon for a home screen (SPEC § 3): the Wine tile with the Rose ring, rendered to a PNG at build
 * time from the package's `noddo_appicon_wine.svg` geometry. Apple wants a PNG and no rounded corners of
 * its own — the system rounds them.
 */
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <svg viewBox="0 0 96 96" width="180" height="180">
        <rect width="96" height="96" fill="#6E1630" />
        <path
          fill="#F2B8C6"
          d="M25.5 56A22.5 22.5 0 1 1 70.5 56A22.5 22.5 0 1 1 25.5 56ZM34.5 56A13.5 13.5 0 1 0 61.5 56A13.5 13.5 0 1 0 34.5 56Z"
        />
      </svg>
    ),
    size,
  );
}
