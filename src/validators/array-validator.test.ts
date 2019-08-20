import { expect } from 'chai';
import { assert, IsExact } from 'conditional-type-checks';
import { describe, it } from 'mocha';
import jointz, { ExtractResultType } from '../index';

describe('jointz#array', () => {
  it('expects arrays', () => {
    expect(jointz.array().validate({}))
      .to.deep.eq([ { message: 'must be an array', path: [], value: {} } ]);
    expect(jointz.array().validate('abc'))
      .to.deep.eq([ { message: 'must be an array', path: [], value: 'abc' } ]);
    expect(jointz.array().validate(123))
      .to.deep.eq([ { message: 'must be an array', path: [], value: 123 } ]);
  });

  it('checks minimum length', () => {
    expect(jointz.array().minLength(1).validate([]))
      .to.deep.eq([ { message: 'array length 0 was less than minimum length: 1', path: [], value: [] } ]);
  });

  it('checks maximum length', () => {
    expect(jointz.array().maxLength(1).validate([ 'abc', {} ]))
      .to.deep.eq([ { message: 'array length 2 was greater than maximum length: 1', path: [], value: [ 'abc', {} ] } ]);
  });

  it('validates arrays properly', () => {
    expect(jointz.array().minLength(1).maxLength(2).items(jointz.string().alphanum().minLength(3)).validate([ 'abc', '123' ]))
      .to.deep.eq([]);

    expect(jointz.array().items(jointz.string().alphanum().minLength(3)).validate([ 'ab', '123' ]))
      .to.deep.eq([ { message: 'length 2 was shorter than minimum length: 3', path: [ 0 ], value: 'ab' } ]);

    expect(jointz.array().items(jointz.string().alphanum().minLength(3)).validate([ 'a19-', 'de' ]))
      .to.deep.eq([ {
      message: 'must be alphanumeric',
      path: [ 0 ],
      value: 'a19-'
    }, { message: 'length 2 was shorter than minimum length: 3', path: [ 1 ], value: 'de' } ]);
  });

  it('throws with invalid minLength', () => {
    expect(() => jointz.array(jointz.number()).minLength(-1)).to.throw('min length -1 must be greater than or equal to 0');
  });

  it('throws with invalid maxLength', () => {
    expect(() => jointz.array(jointz.number()).maxLength(-1)).to.throw('max length -1 must be greater than or equal to 0');
  });

  it('isValid typeguards properly', () => {
    const validator = jointz.array(jointz.object({ value: jointz.number() }).requiredKeys('value'));
    const value: unknown = [ { value: 1 }, { value: 2 }, { value: 3 } ];

    expect(validator.isValid(value)).eq(true);

    if (validator.isValid(value)) {
      expect(value[ 0 ].value + value[ 1 ].value + value[ 2 ].value).to.eq(6);
    }
  });

  it('has the right type', () => {
    const validator = jointz.array(jointz.number());

    assert<IsExact<ExtractResultType<typeof validator>, number[]>>(true);
  });
});
