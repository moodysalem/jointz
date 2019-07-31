/**
 * Given an array of strings, return the unique set of strings in that array
 * @param arr of strings
 */
export default function uniqueString(arr: string[]): string[] {
  const set: { [ key: string ]: true } = {};

  for (let i = 0; i < arr.length; i++) {
    set[ arr[ i ] ] = true;
  }

  return Object.keys(set);
}