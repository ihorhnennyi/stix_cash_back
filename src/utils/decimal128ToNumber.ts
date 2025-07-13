export const decimal128ToNumber = (value: unknown): number => {
  if (value && typeof value === 'object' && 'toString' in value) {
    return parseFloat((value as any).toString());
  }
  return 0;
};
