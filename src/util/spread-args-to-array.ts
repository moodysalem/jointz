/**
 * Spread args should either be of the type an array of T or a single argument which is an array of T
 */
export type SpreadArgs<T> = T[] | [ T[] ];

/**
 * Given the spread arguments, returns the array of options
 * @param args to flatten
 */
export function spreadArgsToArray<T>(args: SpreadArgs<T>): T[] {
  if (args.length === 1 && Array.isArray(args[ 0 ])) {
    return args[ 0 ];
  } else {
    return args as T[];
  }
}