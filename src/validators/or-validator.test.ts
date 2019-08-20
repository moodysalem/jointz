import { expect } from 'chai';
import { assert, IsExact } from 'conditional-type-checks';
import { describe, it } from 'mocha';
import jointz, { ExtractResultType } from '../index';

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

  it('isValid typeguards properly', () => {
    const aValidator = jointz.object({
      discriminator: jointz.constant('a'),
      num: jointz.number()
    });

    type AType = ExtractResultType<typeof aValidator>;

    const bValidator = jointz.object({
      discriminator: jointz.constant('b'),
      str: jointz.string()
    });

    const aOrB = jointz.or(aValidator, bValidator);

    const x: unknown = { discriminator: 'a', num: 3 };

    assert<IsExact<ExtractResultType<typeof aValidator>, { discriminator: 'a'; num: number; }>>(true);
    assert<IsExact<ExtractResultType<typeof bValidator>, { discriminator: 'b'; str: string; }>>(true);
    assert<IsExact<ExtractResultType<typeof aOrB>, { discriminator: 'a'; num: number; } | { discriminator: 'b'; str: string; }>>(true);

    if (aOrB.isValid(x)) {
      if ('num' in x) {
        expect(x.num).to.eq(3);
      } else if ('str' in x) {
        expect(x.str.substring(0, 1)).to.eq(1);
      }
    }
  });

  it('has the right type', () => {
    const validator = jointz.or(jointz.number(), jointz.string(), jointz.tuple(jointz.string(), jointz.number()));

    assert<IsExact<ExtractResultType<typeof validator>, number | string | [ string, number ]>>(true);
  });
});
