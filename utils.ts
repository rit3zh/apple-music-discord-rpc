const randomizeHeaders = <T extends string>(
  headers: Record<string, T>,
): Record<string, T> => {
  const keys = Object.keys(headers);
  const values = Object.values(headers);
  const shuffledValues = values.sort(() => Math.random() - 0.5);
  const randomizedHeaders: Record<string, T> = {};

  keys.forEach((key, index) => {
    randomizedHeaders[key] = shuffledValues[index]!;
  });

  return randomizedHeaders;
};

export { randomizeHeaders };
