# Country flags

3x2 SVG flags, one file per ISO 3166-1 alpha-2 code (uppercase, e.g. `DE.svg`).

Vendored from [`country-flag-icons`](https://gitlab.com/catamphetamine/country-flag-icons) v1.6.20
(`3x2/`), MIT-licensed; the flag artwork itself is public domain. Copied in rather than installed so
the app carries no dependency and no third-party request — see `components/ui/CountryFlag`, which is
the only thing that should reference these paths.

To refresh: pull the same `3x2/` directory from a newer release and replace the `.svg` files. Keep
the uppercase names — `CountryFlag` builds the path from the country code directly.
