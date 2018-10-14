export default function uniqueString(arr: string[]) {
  const set: { [ key: string ]: true } = {};

  for (let i = 0; i < arr.length; i++) {
    set[ arr[ i ] ] = true;
  }

  return Object.keys(set);
}