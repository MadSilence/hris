type NameParts = {
  firstName: string | null;
  lastName: string | null;
  email: string;
};

export function personDisplayName(person: NameParts): string {
  return `${person.firstName ?? ""} ${person.lastName ?? ""}`.trim() || person.email;
}

export function personInitials(person: NameParts): string {
  const first = (person.firstName ?? "").trim();
  const last = (person.lastName ?? "").trim();
  const fromParts = (first ? first[0] : "") + (last ? last[0] : "");
  return (fromParts || person.email.slice(0, 2)).toUpperCase();
}
