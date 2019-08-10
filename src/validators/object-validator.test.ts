import { expect } from 'chai';
import { describe, it } from 'mocha';
import jointz from '../index';

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

  it('works with nested objects', () => {
    const nested = jointz.object().keys({
      abc: jointz.object().keys({ def: jointz.number() }).requiredKeys('def')
    }).requiredKeys('abc');

    expect(nested.validate({ abc: {} }))
      .to.deep.eq([ { message: 'required key "def" was not defined', path: '.abc', value: {} } ]);
    expect(nested.validate({ abc: { def: 'string' } }))
      .to.deep.eq([ { message: 'must be a number', path: '.abc.def', value: 'string' } ]);
  });

  describe('#concat', () => {
    it('only concatenates the keys', () => {
      const obj = jointz.object().keys({
        abc: jointz.string().alphanum().minLength(10).maxLength(100)
      }).requiredKeys('abc');
      const concatenated = obj.concat({
        def: jointz.string()
      }).requiredKeys('def');

      expect(obj.validate({ abc: 'abcdefghijklmnop' }))
        .to.deep.eq([]);
      expect(concatenated.validate({ abc: 'abcdefghijklmnop' }))
        .to.deep.eq([ {
        message: 'required key "def" was not defined',
        path: '',
        value: { abc: 'abcdefghijklmnop' }
      } ]);
    });

  });

  describe('#allowUnknownKeys', () => {
    it('results in errors if unknown keys present', () => {
      expect(jointz.object().allowUnknownKeys(false).validate({ abc: 123 }))
        .to.deep.eq([ { message: 'encountered unknown key "abc"', path: '', value: { abc: 123 } } ]);
    });
  });

  describe('#requiredKeys', () => {
    it('does not duplicate messages for duplicate required keys', () => {
      expect(
        jointz.object().requiredKeys('abc', 'abc').validate({})
      ).to.deep.eq([ { message: 'required key "abc" was not defined', path: '', value: {} } ]);
    });
  });

  describe('#merge', () => {
    it('merges both required keys and keys', () => {
      const obj1 = jointz.object().keys({});
      const obj2 = jointz.object().keys({ abc: jointz.string() }).requiredKeys('abc');
      const merged = obj1.merge(obj2);

      expect(merged.validate({}))
        .to.deep.eq([ { message: 'required key "abc" was not defined', path: '', value: {} } ]);
    });

    it('does not duplicate error messages for required keys', () => {
      expect(
        jointz.object().requiredKeys('abc')
          .merge(jointz.object().requiredKeys('abc'))
          .validate({})
      ).to.deep.eq([ { message: 'required key "abc" was not defined', path: '', value: {} } ]);
    });
  });

  it('can have keys specified', () => {
    expect(jointz.object({ abc: jointz.constant('def') }).validate({ abc: 'def' }))
      .to.be.an('array').with.length(0);

    expect(jointz.object({ abc: jointz.constant('def') }).validate({ abc: 'red' }))
      .to.deep.eq([ { message: 'must be one of "def"', path: '.abc', value: 'red' } ]);
  });

  it('isValid typeguards properly', () => {
    const validator = jointz.object({ name: jointz.string() });

    const value = { name: 'abc' };

    expect(validator.isValid(value)).eq(true);

    if (validator.isValid(value)) {
      expect(value.name).to.eq('abc');
    }
  });
});
