export function generateTutorKey(fullName: string): string {
  const initials =
    fullName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "ST";

  const suffix = Math.floor(10 + Math.random() * 90);
  return `RISE-${initials}${suffix}`;
}

export function initialsFromName(fullName: string): string {
  return (
    fullName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "RS"
  );
}
