import jointz from './index';
import { describe, it } from 'mocha';
import { expect } from 'chai';

describe('jointz', () => {
  it('exports a single class', () => {
    expect(jointz).to.be.a('function');
  });
  [ 'array', 'object', 'string', 'number', 'or' ].forEach(
    func => {
      it(`has a static function: ${func}`, () => {
        expect((jointz as any)[ func ]).to.be.a('function');
      });
    }
  );
});

describe('jointz#string', () => {
  it('validates string type correctly', () => {
    expect(jointz.string().validate('', ''))
      .to.be.an('array').with.length(0);
    expect(jointz.string().validate(void 0, ''))
      .to.be.an('array').with.length(1);
    expect(jointz.string().validate(null, ''))
      .to.be.an('array').with.length(1);
    expect(jointz.string().validate({}, ''))
      .to.be.an('array').with.length(1);
    expect(jointz.string().validate([], ''))
      .to.be.an('array').with.length(1);
  });

  it('validates patterns correctly', () => {
    expect(jointz.string().pattern(/^[abc]{3,4}$/).validate('abc', ''))
      .to.be.an('array').with.length(0);
    expect(jointz.string().pattern(/^[abc]{3,4}$/).validate('abcd', ''))
      .to.be.an('array').with.length(1);
    expect(jointz.string().pattern(/^[abc]{3,4}$/).validate('abca', ''))
      .to.be.an('array').with.length(0);
  });

  it('validates uuids correctly', () => {
    expect(jointz.string().uuid().validate(''))
      .to.deep.eq([ { message: 'must be a uuid', path: '', value: '' } ]);
    expect(jointz.string().uuid().validate('C56A4180-65AA-42EC-A945-5FD21DEC0538'))
      .to.deep.eq([]);
    expect(jointz.string().uuid().validate('c56a4180-65aa-42Ec-A945-5FD21DEC0538'))
      .to.deep.eq([]);
  });

  it('validates alphanumeric', () => {
    expect(jointz.string().alphanum().validate(''))
      .to.deep.eq([]);
    expect(jointz.string().alphanum().validate('abcedF19309'))
      .to.deep.eq([]);
    expect(jointz.string().alphanum().validate('abc910394018fmdsklamf19045190580fmdklasfmdslamjgrqpmzcxklvmzlmty'))
      .to.deep.eq([]);
    expect(jointz.string().alphanum().validate('abc910394018fmdsklamf19045190580fmdklasfmdslamjgrqpmzcxklvmzlmty-'))
      .to.deep.eq([ { message: 'must be alphanumeric', path: '', value: 'abc910394018fmdsklamf19045190580fmdklasfmdslamjgrqpmzcxklvmzlmty-' } ]);
  });

  it('validates minLength and maxLength length properly', () => {
    expect(jointz.string().pattern(/^[abc]{3,4}$/).maxLength(3).validate('abca', ''))
      .to.be.an('array').with.length(1);
    expect(jointz.string().pattern(/^[abc]{3,4}$/).maxLength(3).validate('abcd', ''))
      .to.be.an('array').with.length(2);
    expect(jointz.string().pattern(/^[abc]{3,4}$/).minLength(4).validate('abc', ''))
      .to.be.an('array').with.length(1);
  });

  it('validates objects properly', () => {
    expect(jointz.object().keys({ abc: jointz.number() }).requiredKeys([ 'abc' ]).validate({}))
      .to.deep.eq([ { message: 'required key "abc" was not defined', path: '' } ]);

    expect(jointz.object().keys({ abc: jointz.number() }).requiredKeys([ 'abc' ]).validate({ abc: 'hello' }))
      .to.deep.eq([ { message: 'not a number', path: '.abc', value: 'hello' } ]);
  });
});