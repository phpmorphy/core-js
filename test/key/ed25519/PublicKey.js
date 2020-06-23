if (typeof window === 'undefined') {
  var umi = require('../../../')
  var assert = require('chai').assert
}

describe('PublicKey', function () {
  describe('константы', function () {
    const tests = [
      { args: 'LENGTH', expected: 32 },
      { args: 'SIGNATURE_LENGTH', expected: 64 }
    ]

    tests.forEach(function (test) {
      it(test.args, function () {
        const actual = umi.PublicKey[test.args]
        assert.strictEqual(actual, test.expected)
      })
    })
  })

  describe('new PublicKey()', function () {
    describe('возвращяет ошибку если передать', function () {
      const len = umi.PublicKey.LENGTH
      const tests = [
        { desc: 'число', args: len },
        { desc: 'строку', args: 'a'.repeat(len) },
        { desc: 'массив', args: new Array(len) },
        { desc: 'объект', args: { a: 'b' } },
        { desc: 'undefined', args: undefined },
        { desc: 'DataView', args: new DataView(new ArrayBuffer(len)) },
        { desc: 'Int8Array', args: new Int8Array(len) },
        { desc: 'ArrayBuffer', args: new ArrayBuffer(len) },
        { desc: 'слишко короткий Uint8Array', args: new Uint8Array(len - 1) },
        { desc: 'слишко длинный Uint8Array', args: new Uint8Array(len + 1) }
      ]

      tests.forEach(function (test) {
        it(test.desc, function () {
          assert.throws(() => new umi.PublicKey(test.args), Error)
        })
      })
    })

    describe('создает объект если передать', function () {
      const len = umi.PublicKey.LENGTH
      const tests = [
        { desc: 'Uint8Array корректной длины', args: new Uint8Array(len) }
      ]

      tests.forEach(function (test) {
        it(test.desc, function () {
          const actual = new umi.PublicKey(test.args)
          assert.instanceOf(actual, umi.PublicKey)
        })
      })
    })
  })

  describe('verifySignature()', function () {
    describe('возвращяет ошибку если передать в message', function () {
      const len = 1
      const tests = [
        { desc: 'число', args: len },
        { desc: 'строку', args: 'a'.repeat(len) },
        { desc: 'массив', args: new Array(len) },
        { desc: 'undefined', args: undefined },
        { desc: 'объект', args: { a: 'b' } },
        { desc: 'ArrayBuffer', args: new ArrayBuffer(len) },
        { desc: 'DataView', args: new DataView(new ArrayBuffer(len)) },
        { desc: 'Int8Array', args: new Int8Array(len) }
      ]

      tests.forEach(function (test) {
        it(test.desc, function () {
          const key = new umi.PublicKey(new Uint8Array(umi.PublicKey.LENGTH))
          const sig = new Uint8Array(64)
          assert.throws(() => key.verifySignature(test.args, sig), Error)
        })
      })
    })

    describe('возвращяет ошибку если передать в signature', function () {
      const len = umi.PublicKey.SIGNATURE_LENGTH
      const tests = [
        { desc: 'число', args: len },
        { desc: 'строку', args: 'a'.repeat(len) },
        { desc: 'массив', args: new Array(len) },
        { desc: 'undefined', args: undefined },
        { desc: 'объект', args: { a: 'b' } },
        { desc: 'ArrayBuffer', args: new ArrayBuffer(len) },
        { desc: 'DataView', args: new DataView(new ArrayBuffer(len)) },
        { desc: 'Int8Array', args: new Int8Array(len) },
        { desc: 'слишко коротки Uint8Array', args: new Uint8Array(len - 1) },
        { desc: 'слишком длинный Uint8Array', args: new Uint8Array(len + 1) }
      ]

      tests.forEach(function (test) {
        it(test.desc, function () {
          const key = new umi.PublicKey(new Uint8Array(umi.PublicKey.LENGTH))
          const msg = new Uint8Array(1)
          assert.throws(() => key.verifySignature(msg, test.args), Error)
        })
      })
    })

    describe('возрвщяет false', function () {
      it('для некорректной подписи', function () {
        const msg = new Uint8Array(1)
        const key = new Uint8Array(umi.PublicKey.LENGTH)
        const sig = new Uint8Array(umi.PublicKey.SIGNATURE_LENGTH)

        const actual = new umi.PublicKey(key).verifySignature(msg, sig)
        assert.isFalse(actual)
      })
    })
  })
})
