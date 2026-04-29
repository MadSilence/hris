import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-brown-200 bg-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-4 py-6 md:flex-row">
        <p className="text-sm text-[var(--color-text-tertiary)]">
          © {new Date().getFullYear()} SixSoftware. All rights reserved.
        </p>

        <ul className="flex items-center gap-6 text-sm">
          <li>
            <Link
              href="/#"
              className="text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]"
            >
              Privacy
            </Link>
          </li>

          <li>
            <Link
              href="/#"
              className="text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]"
            >
              Terms
            </Link>
          </li>

          <li>
            <Link
              href="/contact"
              className="text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]"
            >
              Contact
            </Link>
          </li>
        </ul>
      </div>
    </footer>
  );
}
