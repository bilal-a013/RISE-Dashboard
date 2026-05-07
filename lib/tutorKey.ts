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

export function normaliseTutorKey(tutorKey: string): string {
  return tutorKey.trim().toUpperCase().replace(/\s+/g, "-");
}

export async function hashTutorKey(tutorKey: string): Promise<string> {
  const normalised = normaliseTutorKey(tutorKey);
  const bytes = new TextEncoder().encode(normalised);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
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
