// Compares two semantic versions like '4.1.0'. Negative if a < b, positive if a > b, zero if equal.
export const compareVersions = (a: string, b: string) => {
  const aParts = a.split('.').map((part) => parseInt(part, 10) || 0);
  const bParts = b.split('.').map((part) => parseInt(part, 10) || 0);

  for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
    const diff = (aParts[i] ?? 0) - (bParts[i] ?? 0);
    if (diff !== 0) {
      return diff;
    }
  }

  return 0;
};
