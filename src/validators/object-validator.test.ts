import { describe, it } from 'mocha';
import jointz from '../index';
import { expect } from 'chai';

describe('jointz#object', () => {
  it('expects objects', () => {
    expect(jointz.object().validate([]))
      .to.deep.eq([ { message: 'must be an object', path: '', value: [] } ]);
    expect(jointz.object().validate('abc'))
      .to.deep.eq([ { message: 'must be an object', path: '', value: 'abc' } ]);
    expect(jointz.object().validate(123))
      .to.deep.eq([ { message: 'must be an object', path: '', value: 123 } ]);
  });

  it('allowUnknownKeys can be set to false to prevent unknown keys', () => {
    expect(jointz.object().allowUnknownKeys(false).validate({ abc: 123 }))
      .to.deep.eq([ { message: 'encountered unknown key "abc"', path: '', value: { abc: 123 } } ]);
  });

  it('checks keys', () => {
    expect(jointz.object().keys({ abc: jointz.number() }).requiredKeys('abc').validate({}))
      .to.deep.eq([ { message: 'required key "abc" was not defined', path: '', value: {} } ]);

    expect(jointz.object().keys({ abc: jointz.number() }).requiredKeys('abc').validate({ abc: 'hello' }))
      .to.deep.eq([ { message: 'must be a number', path: '.abc', value: 'hello' } ]);
  });

  describe('#merge', () => {
    it('merges both required keys and keys', () => {
      const obj1 = jointz.object().keys({});
      const obj2 = jointz.object().keys({ abc: jointz.string() }).requiredKeys('abc');
      const merged = obj1.merge(obj2);

      expect(merged.validate({}))
        .to.deep.eq([ { message: 'required key "abc" was not defined', path: '', value: {} } ]);
    });
  });
});
