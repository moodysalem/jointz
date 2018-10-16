# jointz
[![Build Status](https://travis-ci.org/moodysalem/jointz.svg?branch=master)](https://travis-ci.org/moodysalem/jointz)
[![codecov](https://codecov.io/gh/moodysalem/jointz/branch/master/graph/badge.svg)](https://codecov.io/gh/moodysalem/jointz)
[![npm](https://img.shields.io/npm/v/jointz.svg)](https://www.npmjs.com/package/jointz)
[![npm bundle size (minified + gzip)](https://img.shields.io/bundlephobia/minzip/jointz.svg)](https://bundlephobia.com/result?p=jointz)




Zero dependency universal TypeScript validation library. Similar interface to Joi but without all the bloat, built for browsers and node with zero runtime dependencies.

## Features

- Written in TypeScript
- Zero dependencies
- Tiny
- Supports `string`, `number`, `array`, and `object` validation
- Implement your own validator interface
- Fluid [Joi](https://github.com/hapijs/joi)-like interface
- Targets both browsers and node
- i18n (coming soon)

## Installation

You can install it via NPM

`npm i --save jointz`

Alternately you can use it in the browser via unpkg

```html
<script src="https://unpkg.com/jointz@0.0.5/dist/jointz.js" crossorigin="anonymous"></script>
```


## Usage
Import the default export from `jointz`

```typescript
import jointz from 'jointz';
``` 

Then use it to construct validators

```typescript
const Thing = jointz.object().keys({
  id: jointz.string().uuid(),
  name: jointz.string().minLength(3).maxLength(100)
}).requiredKeys(['id', 'name']);
```

The validator can now be used to check for errors.
`Validator#validate` returns an array of validation errors,
which is empty if the `value` passes validation. 

```typescript
const myObject = { id: 'abc', name: 'hello world!' };
const errors = Thing.validate(errors); // expect an error because id is not a uuid

if (errors.length) {
  // Fail
} else {
  // Continue
}
```

All errors are in the following format. 
The value is the erroneous value, where applicable
 (e.g. not so in the case of missing required keys)
and the path describes where in the value the error was found
 (e.g. in the case of nested objects) 

```typescript
interface ValidationError {
  path: string;
  message: string;
  value?: any;
}
```
