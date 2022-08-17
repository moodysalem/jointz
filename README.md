# jointz
[![Tests](https://github.com/moodysalem/jointz/actions/workflows/test.yml/badge.svg)](https://github.com/moodysalem/jointz/actions/workflows/test.yml)
[![codecov](https://codecov.io/gh/moodysalem/jointz/branch/master/graph/badge.svg)](https://codecov.io/gh/moodysalem/jointz)
[![npm](https://img.shields.io/npm/v/jointz.svg)](https://www.npmjs.com/package/jointz)
[![npm bundle size (minified + gzip)](https://img.shields.io/bundlephobia/minzip/jointz.svg)](https://bundlephobia.com/result?p=jointz)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)


Zero dependency universal TypeScript validation library. Similar interface to [Joi](https://github.com/hapijs/joi) but without all the bloat, and built for browsers and node with zero dependencies.

## Features

- Written in TypeScript
- Zero dependencies, tiny, and well tested
- [Pretty fast](https://github.com/moltar/typescript-runtime-type-benchmarks#data-type-checks-sans-ts-json-validator)
- Infer TypeScript types from validators
- Supports `any`, `string`, `number`, `array`, `tuple`, `constant`, `boolean`, `or` and `object` validation
- Implement your own validator and use it with any of the other validators
- Fluid immutable interface
- Targets both browsers and node

## Installation

You can install it via npm

```
npm i --save jointz
```

or yarn

```
yarn add jointz
```

## Usage

Import the default export from `jointz`

```typescript
import jointz from 'jointz';
``` 

Then use it to construct validators

```typescript
const ThingValidator = jointz.object({
  id: jointz.string().uuid(),
  name: jointz.string().minLength(3).maxLength(100)
}).requiredKeys(['id', 'name']);
```

The validator can now be used to check for errors.
`Validator#validate` returns an array of validation errors,
which is empty if the `value` passes validation. 

```typescript
const myObject = { id: 'abc', name: 'hello world!' };

const errors = ThingValidator.validate(myObject); // expect an error because id is not a uuid

if (errors.length) {
  // Fail
} else {
  // Continue
}
```

You can also generate TypeScript types from your validators, using `Infer`, or get the resulting type
from validation via `checkValid`. 

```typescript
type Thing = Infer<typeof ThingValidator>;

const myObject: unknown = { id: 'abc', name: 'hello world!' };

try {
  const thing: Thing = ThingValidator.checkValid(myObject);
} catch (validationError) {
  console.log(validationError.errors);
}
```

jointz validators also expose the [type guard](https://www.typescriptlang.org/docs/handbook/advanced-types.html#type-guards-and-type-assertions)
function `isValid` on every validator.
 
```typescript
const myObject: unknown = { id: 'abc', name: 'hello world!' };

if (ThingValidator.isValid(myObject)) {
    // This works because myObject is a valid Thing
    const id: string = myObject.id;
}
```

### Errors

Errors match the following interface:

```typescript
interface ValidationError {
  // Array of keys indicating where the validation failed. This is empty if top level validation failed.
  path: Array<string | number>;
  // The error message describing the failed validation.
  message: string;
  // The value that failed validation. This value may not be defined, e.g. in the case of missing required keys.
  value?: unknown;
}
```

A single validator can produce many errors. However, validators will only produce relevant errors, e.g. a number validator that checks a number is a multiple of 2 will not produce an additional error about the multiple when validating a string.

| Validator                                                             | Example           | Error.path  | Error.message                      | Error.value |
|-----------------------------------------------------------------------|-------------------|-------------|------------------------------------|-------------|
| `jointz.number()`                                                     | `'abc'`           | `[]`        | `'must be a number'`               | `'abc'`     |
| `jointz.string()`                                                     | `3`               | `[]`        | `'must be a string'`               | `3`         |
| `jointz.object({ abc: jointz.string() })`                             | `{abc:3}`         | `['abc']`   | `'must be a string'`               | `3`         |
| `jointz.object({ arr: jointz.array(jointz.number().multipleOf(2)) })` | `{arr:[2,'5',8]}` | `['arr',1]` | `'must be a number'`               | `'5'`       |
| `jointz.object({ arr: jointz.array(jointz.number().multipleOf(2)) })` | `{arr:[2,5,8]}`   | `['arr',1]` | `'number was not a multiple of 2'` | `5`         |
