import { expect } from 'chai';
import { describe, it } from 'mocha';
import jointz from './index';

describe('jointz', () => {
  it('exports a single class', () => {
    expect(jointz).to.be.a('function');
  });

  // expected keys on the object
  [ 'array', 'object', 'string', 'number', 'or', 'tuple', 'constant' ].forEach(
    func => {
      it(`has a static function: ${func}`, () => {
        expect((jointz as any)[ func ]).to.be.a('function');
      });
    }
  );
});

