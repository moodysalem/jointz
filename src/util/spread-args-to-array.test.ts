import { expect } from 'chai';
import { spreadArgsToArray } from './spread-args-to-array';

describe('spreadArgsToArray', () => {
  it('takes array of arguments as option', () => {
    expect(spreadArgsToArray([ 'abc', 'def' ]))
      .to.deep.eq([ 'abc', 'def' ]);
  });

  it('takes a single array argument', () => {
    expect(spreadArgsToArray([ [ 'abc', 'def' ] ]))
      .to.deep.eq([ 'abc', 'def' ]);
  });
});