// src/utils/math-helpers.ts
/**
 * Generates a pair of standard normal random variates using the Box-Muller transform.
 * Call this once and use one of the returned values for one random step.
 */
export function boxMullerTransform(): [number, number] {
  let u1 = 0, u2 = 0;
  // Ensure u1 is not 0 to avoid Math.log(0) which is -Infinity
  while (u1 === 0) u1 = Math.random();
  while (u2 === 0) u2 = Math.random();

  const R = Math.sqrt(-2.0 * Math.log(u1));
  const Theta = 2.0 * Math.PI * u2;

  return [R * Math.cos(Theta), R * Math.sin(Theta)];
}

/**
 * Calculates percentiles for an array of numbers.
 * @param data Sorted array of numbers.
 * @param percentile The percentile to calculate (0-100).
 * @returns The value at the given percentile.
 */
export function getPercentile(sortedData: number[], percentile: number): number {
  if (!sortedData || sortedData.length === 0) {
    return 0;
  }
  const index = (percentile / 100) * (sortedData.length - 1);
  if (index % 1 === 0) {
    return sortedData[index];
  }
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  return sortedData[lower] + (index - lower) * (sortedData[upper] - sortedData[lower]);
}
