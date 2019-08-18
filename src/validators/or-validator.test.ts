import { expect } from 'chai';
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

    if (aOrB.isValid(x)) {
      if (x.discriminator === 'a') {
        const a: AType = x as AType;
        // TODO: why do we have to assign x to A type?
        expect(a.num).to.eq(3);
      }
    }
  });
});
