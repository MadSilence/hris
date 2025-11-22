import { useAccountsQuery } from "../api/accounts.queries";
import { AccountCard } from "./AccountCard";
export function AccountList() {
  const { data, isLoading, isError } = useAccountsQuery();
  if (isLoading) return <p>Loading…</p>;
  if (isError) return <p>Something went wrong.</p>;
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {data!.map((acc) => (
        <li key={acc.id}>
          <AccountCard account={acc} />
        </li>
      ))}
    </ul>
  );
}
