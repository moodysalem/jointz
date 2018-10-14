import { expect } from 'chai';
import { describe, it } from 'mocha';
import jointz from '../index';

describe('jointz#number', () => {
  it('only allows numbers', () => {
    expect(jointz.number().validate('s'))
      .to.deep.eq([ { message: 'must be a number', path: '', value: 's' } ]);
    expect(jointz.number().validate({}))
      .to.deep.eq([ { message: 'must be a number', path: '', value: {} } ]);
    expect(jointz.number().validate(1))
      .to.deep.eq([]);


  });

  it('validates multipleOf', () => {
    expect(jointz.number().multipleOf(1).validate(1))
      .to.deep.eq([]);
    expect(jointz.number().multipleOf(0.5).validate(1))
      .to.deep.eq([]);
    expect(jointz.number().integer().validate(1))
      .to.deep.eq([]);

    expect(jointz.number().integer().validate(0.5))
      .to.deep.eq([ { message: 'number was not an integer', path: '', value: 0.5 } ]);

    expect(jointz.number().multipleOf(2).validate(3))
      .to.deep.eq([ { message: 'number was not a multiple of 2', path: '', value: 3 } ]);
  });

  it('validates min/max', () => {
    expect(jointz.number().min(1).validate(1))
      .to.deep.eq([]);
    expect(jointz.number().max(1).validate(1))
      .to.deep.eq([]);
    expect(jointz.number().max(0).validate(1))
      .to.deep.eq([ { message: '1 must be less than or equal to 0', path: '', value: 1 } ]);
    expect(jointz.number().min(2).validate(1))
      .to.deep.eq([ { message: '1 must be greater than or equal to 2', path: '', value: 1 } ]);
  });
});