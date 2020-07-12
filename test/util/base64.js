const base64Decode = require('../../dist/index.js').base64Decode
const base64Encode = require('../../dist/index.js').base64Encode
const assert = require('chai').assert

it('base64Encode()', function () {
  const expected = 'AAECAwQF'
  const actual = base64Encode([0, 1, 2, 3, 4, 5])
  assert.strictEqual(actual, expected)
})

describe('base64Decode()', function () {
  it('ошибка если некорректные символы', function () {
    assert.throws(function () {
      base64Decode('AA..')
    }, Error)
  })

  it('корректная строка', function () {
    const base64 = 'AAECAwQF'
    const expected = [0, 1, 2, 3, 4, 5]
    const actual = base64Decode(base64)
    assert.deepEqual(actual, expected)
  })
})
