import { useQuery } from "@tanstack/react-query";
export type Account = { id: string; name: string };
export const fetchAccounts = async (): Promise<Account[]> => {
  const res = await fetch("/api/accounts");
  if (!res.ok) throw new Error("Failed to load accounts");
  return res.json();
};
export const useAccountsQuery = () => useQuery({ queryKey: ["accounts"], queryFn: fetchAccounts });
