import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-divider bg-card">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-4 py-6 md:flex-row">
        <p className="text-body text-tertiary">
          © {new Date().getFullYear()} noddo. All rights reserved.
        </p>

        <ul className="flex items-center gap-6 text-body">
          <li>
            <Link
              href="/#"
              className="text-tertiary hover:text-primary"
            >
              Privacy
            </Link>
          </li>

          <li>
            <Link
              href="/#"
              className="text-tertiary hover:text-primary"
            >
              Terms
            </Link>
          </li>

          <li>
            <Link
              href="/contact"
              className="text-tertiary hover:text-primary"
            >
              Contact
            </Link>
          </li>
        </ul>
      </div>
    </footer>
  );
}
