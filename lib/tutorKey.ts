export function generateTutorKey(fullName: string): string {
  const initials =
    fullName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "ST";

  const alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const suffix = Array.from({ length: 2 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
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
