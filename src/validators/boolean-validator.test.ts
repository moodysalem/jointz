import { expect } from 'chai'
import { assert, IsExact } from 'conditional-type-checks'
import { describe, it } from 'mocha'
import jointz, { ExtractResultType } from '../index'

describe('jointz#boolean', () => {
  it('allows true or false', () => {
    expect(jointz.boolean().validate(true))
      .to.deep.eq([])
    expect(jointz.boolean().validate(false))
      .to.deep.eq([])
  })

  it('rejects other types', () => {
    expect(jointz.boolean().validate('def'))
      .to.deep.eq([{message: 'must be one of true, false', path: [], value: 'def'}])
    expect(jointz.boolean().validate({}))
      .to.deep.eq([{message: 'must be one of true, false', path: [], value: {}}])
    expect(jointz.boolean().validate(5))
      .to.deep.eq([{message: 'must be one of true, false', path: [], value: 5}])
  })

  it('isValid typeguards properly', () => {
    const validator = jointz.boolean()
    const value: unknown = false

    if (validator.isValid(value)) {
      expect(value.valueOf()).to.eq(false)
    }
  })

  it('has the right type', () => {
    const validator = jointz.boolean()
    assert<IsExact<ExtractResultType<typeof validator>, boolean>>(true)
  })
})
