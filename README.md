# jointz
[![Build Status](https://travis-ci.org/moodysalem/jointz.svg?branch=master)](https://travis-ci.org/moodysalem/jointz)
![npm](https://img.shields.io/npm/v/jointz.svg)
![npm bundle size (minified)](https://img.shields.io/bundlephobia/min/jointz.svg)



Zero dependency universal TypeScript validation library. Similar interface to Joi but without all the bloat, built for browsers and node with zero runtime dependencies.

## Features

- Written in TypeScript for TypeScript
- No dependencies
- Supports string, number, array, and object validation
- Fluid [Joi](https://github.com/hapijs/joi)-like interface
- Targets browsers and node

## Installation
`npm i --save jointz`

## Usage
Import the default export from `jointz`

```js
import jointz from 'jointz';
``` 

Then use it to construct validators

```js
const Thing = jointz.object().keys({
  id: jointz.string().uuid(),
  name: jointz.string().minLength(3).maxLength(100)
}).requiredKeys(['id', 'name']);
```

The validator can now be used to check for errors

```js
const myObject = { id: 'abc', name: 'hello world!' };
const errors = Thing.validate(errors); // expect an error because id is not a uuid

if (errors.length) {
  // Fail
} else {
  // Continue
}
```
