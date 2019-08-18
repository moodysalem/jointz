# jointz
[![Build Status](https://travis-ci.org/moodysalem/jointz.svg?branch=master)](https://travis-ci.org/moodysalem/jointz)
[![codecov](https://codecov.io/gh/moodysalem/jointz/branch/master/graph/badge.svg)](https://codecov.io/gh/moodysalem/jointz)
[![npm](https://img.shields.io/npm/v/jointz.svg)](https://www.npmjs.com/package/jointz)
[![npm bundle size (minified + gzip)](https://img.shields.io/bundlephobia/minzip/jointz.svg)](https://bundlephobia.com/result?p=jointz)

Zero dependency universal TypeScript validation library. Similar interface to [Joi](https://github.com/hapijs/joi) but without all the bloat, and built for browsers and node with zero dependencies.

## Features

- Written in TypeScript
- Zero dependencies, tiny, well tested
- Supports `string`, `number`, `array`, `tuple`, `constant`, `or` and `object` validation
- **New:** Generate TypeScript types from validator definitions!
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

You can also generate TypeScript types from your validators, using ExtractResultType, or get the resulting type
from validation via `checkValid`. 

```typescript
type Thing = ExtractResultType<typeof ThingValidator>;

const myObject: unknown = { id: 'abc', name: 'hello world!' };

try {
  const thing: Thing = ThingValidator.checkValid(myObject);
} catch (validationError) {
  console.log(validationError.errors);
}
```

Jointz also exposes the [type guard](https://www.typescriptlang.org/docs/handbook/advanced-types.html#type-guards-and-type-assertions)
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
  path: string;
  message: string;
  value?: any;
}
```

- `path` is a period delimited string indicating where in the given value the error was found
- `message` is a human readable message that describes the validation error
- `value` is the erroneous value
