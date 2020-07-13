const hexDecode = require('../../dist/index.js').hexDecode
const hexEncode = require('../../dist/index.js').hexEncode
const assert = require('chai').assert

it('hexEncode()', function () {
  const expected = '000102030405'
  const actual = hexEncode([0, 1, 2, 3, 4, 5])
  assert.strictEqual(actual, expected)
})

describe('hexDecode()', function () {
  it('ошибка если некорректные символы', function () {
    assert.throws(function () {
      hexDecode('fm')
    }, Error)
  })

  it('ошибка если некорректная длина', function () {
    assert.throws(function () {
      hexDecode('f')
    }, Error)
  })

  it('корректная строка', function () {
    const hex = '000102030405'
    const expected = [0, 1, 2, 3, 4, 5]
    const actual = hexDecode(hex)
    assert.deepEqual(actual, expected)
  })
})
