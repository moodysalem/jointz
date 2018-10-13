# jointz
[![Build Status](https://travis-ci.org/moodysalem/jointz.svg?branch=master)](https://travis-ci.org/moodysalem/jointz)

Simple TypeScript validation library, akin to Joi but without all the fancy stuff.

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
  name: jointz.string().minLength(100).maxLength(100)
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
