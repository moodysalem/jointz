import { expect } from 'chai';
import { describe, it } from 'mocha';
import jointz from '../index';

describe('jointz#or', () => {
  it('validates one or the other', () => {
    expect(jointz.or(jointz.string(), jointz.number()).validate({}))
      .to.deep.eq([ { message: 'did not match any of the expected types', path: [], value: {} } ]);
    expect(jointz.or(jointz.string(), jointz.number()).validate('abc'))
      .to.deep.eq([]);
    expect(jointz.or(jointz.string(), jointz.number()).validate(123))
      .to.deep.eq([]);

    expect(jointz.or(jointz.string(), jointz.number()).validate({}, [ 'abc' ]))
      .to.deep.eq([ { message: 'did not match any of the expected types', path: [ 'abc' ], value: {} } ]);
  });

  it('accepts an array', () => {
    expect(jointz.or([ jointz.string(), jointz.number() ]).validate('abc'))
      .to.deep.eq([]);

    expect(jointz.or([ jointz.string(), jointz.number() ]).validate(1))
      .to.deep.eq([]);
  });

  it('isValid typeguards properly');
});
