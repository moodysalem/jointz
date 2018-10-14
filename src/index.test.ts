import jointz from './index';
import { describe, it } from 'mocha';
import { expect } from 'chai';

describe('jointz', () => {
  it('exports a single class', () => {
    expect(jointz).to.be.a('function');
  });

  // expected keys on the object
  [ 'array', 'object', 'string', 'number', 'or' ].forEach(
    func => {
      it(`has a static function: ${func}`, () => {
        expect((jointz as any)[ func ]).to.be.a('function');
      });
    }
  );
});

