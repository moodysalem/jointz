import { expect } from 'chai';
import { describe, it } from 'mocha';
import jointz from '../index';

describe('jointz#constant', () => {
  it('allows only allowed values', () => {
    expect(jointz.constant('def').validate('def'))
      .to.deep.eq([]);
    expect(jointz.constant('def').validate('deff'))
      .to.deep.eq([ { message: 'value was not one of the allowed values', path: '', value: 'deff' } ]);
  });

  it('throws with invalid allowed values', () => {
    expect(() => jointz.constant({} as any)).to.throw();
  });

  it('throws with empty list', () => {
    expect(() => jointz.constant()).to.throw();
  });

  it('only works with allowed value types', () => {
    expect(jointz.constant('abc', 'def').validate('def'))
      .to.deep.eq([]);
    expect(jointz.constant('abc', 'def', 123, false).validate('abc'))
      .to.deep.eq([]);
    expect(jointz.constant('abc', 'def', 123, false).validate(123))
      .to.deep.eq([]);
    expect(jointz.constant('abc', 'def', 123, false).validate(false))
      .to.deep.eq([]);
    expect(jointz.constant('abc', 'def', 0, false).validate(0))
      .to.deep.eq([]);
    expect(jointz.constant('abc', 'def', 123, false).validate({}, 'def'))
      .to.deep.eq([ {
      message: 'value was not one of the supported constant types: string, number or boolean',
      path: 'def',
      value: {}
    } ]);
  });
});
