/**
 * Given the spread arguments, returns the array of options
 * @param args to flatten
 */
export function spreadArgsToArray<T>(args: T[] | [ T[] ]): T[] {
  if (args.length === 1 && Array.isArray(args[ 0 ])) {
    return args[ 0 ];
  } else {
    return args as T[];
  }
}