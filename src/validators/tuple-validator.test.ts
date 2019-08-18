import { expect } from 'chai';
import { describe, it } from 'mocha';
import jointz from '../index';

describe('jointz#tuple', () => {
  it('validates item is array', () => {
    expect(jointz.tuple([ jointz.constant(0) ]).validate(0))
      .to.be.an('array').with.length(1);
    expect(jointz.tuple([ jointz.constant(0) ]).validate([ 0 ]))
      .to.be.an('array').with.length(0);
  });

  it('error if missing items', () => {
    expect(jointz.tuple([ jointz.constant('a') ]).validate([]))
      .to.deep.eq([
      { path: '.0', message: 'must be one of "a"', value: undefined }
    ]);
  });

  it('error if too long', () => {
    expect(jointz.tuple([ jointz.constant('a') ]).validate([ 'a', 'b' ]))
      .to.deep.eq([
      { path: '', message: 'array length 2 was greater than expected length 1', value: [ 'a', 'b' ] }
    ]);
  });

  it('works with varargs', () => {
    expect(jointz.tuple(jointz.constant('abc', 'def'), jointz.number()).validate([ 'def', 3 ]))
      .to.deep.eq([]);
  });

  it('isValid typeguards properly', () => {
    const validator = jointz.tuple(jointz.string(), jointz.number());
    const value: unknown = [ 'abc', 123 ];

    expect(validator.isValid(value)).eq(true);

    if (validator.isValid(value)) {
      // substring only available on string type
      expect(value[ 0 ].substring(0, 1)).eq('a');
      expect(value[ 1 ].toFixed(1)).eq('123.0');
    }
  });
});