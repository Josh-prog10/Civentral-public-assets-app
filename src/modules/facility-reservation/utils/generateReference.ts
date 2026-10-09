export function generateReference(index: number): string {
  const prefix = 'FRS';
  const numeric = String(index + 1).padStart(4, '0');
  return `${prefix}-${new Date().getFullYear()}-${numeric}`;
}
