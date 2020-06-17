if (typeof window === 'undefined') {
  var umi = require('../../dist')
  var assert = require('chai').assert
  var crypto = require('crypto')
}

describe('Sha256()', function () {
  describe('возвращяет ошибку если', function () {
    it('вызвать без параметров', function () {
      assert.throws(() => umi.sha256(), Error)
    })

    const tests = [
      { desc: 'отрицательное целое число', args: -1 },
      { desc: 'положительное вещественное число', args: 0.123 },
      { desc: 'пустую строку', args: '' },
      { desc: 'пустой массив', args: [] },
      { desc: 'пустой объект', args: {} },
      { desc: 'ArrayBuffer', args: new ArrayBuffer(1) },
      { desc: 'DataView', args: new DataView(new ArrayBuffer(1)) },
      { desc: 'сообщение длиннее чем 247 байт', args: new Uint8Array(248) }
    ]

    tests.forEach(function (test) {
      it(test.desc, function () {
        assert.throws(() => umi.sha256(test.args), Error)
      })
    })
  })

  describe('хэш пустой строки', function () {
    it('возвращяет Uint8Array', function () {
      if (typeof window !== 'undefined') {
        this.skip()
      }

      const actual = umi.sha256(new Uint8Array(0))
      assert.instanceOf(actual, Uint8Array)
    })

    it('имеет длину 32 байта', function () {
      if (typeof window !== 'undefined') {
        this.skip()
      }

      const actual = umi.sha256(new Uint8Array(0))
      assert.lengthOf(actual, 32)
    })

    it('равен e3b0c44298fc1c149af...1e4649b934ca495991b7852b855', function () {
      if (typeof window !== 'undefined') {
        this.skip()
      }

      const expected = new Uint8Array([
        0xe3,
        0xb0,
        0xc4,
        0x42,
        0x98,
        0xfc,
        0x1c,
        0x14,
        0x9a,
        0xfb,
        0xf4,
        0xc8,
        0x99,
        0x6f,
        0xb9,
        0x24,
        0x27,
        0xae,
        0x41,
        0xe4,
        0x64,
        0x9b,
        0x93,
        0x4c,
        0xa4,
        0x95,
        0x99,
        0x1b,
        0x78,
        0x52,
        0xb8,
        0x55])
      const actual = umi.sha256(new Uint8Array(0))

      assert.deepEqual(actual, expected)
    })
  })

  describe('хэш рандомной строки длиной', function () {
    const tests = [
      { desc: '1 байт', ars: 1 },
      { desc: '100 байт', ars: 100 },
      { desc: '150 байт', ars: 150 },
      { desc: '200 байт', ars: 200 },
      { desc: '247 байт', ars: 247 }
    ]

    tests.forEach(function (test) {
      const msg = new Uint8Array(test.ars)

      if (typeof window === 'undefined') { // nodejs
        crypto.randomFillSync(msg)
        const hash = crypto.createHash('sha256').update(msg).digest()
        const expected = new Uint8Array(hash.buffer)
        const actual = umi.sha256(msg)

        it(test.desc, function () {
          assert.deepEqual(actual, expected)
        })
      // } else { // browser
      //   const actual = umi.sha256(msg)
      //
      //   it(test.desc, function (done) {
      //     crypto.subtle.digest('SHA-256', msg).then(
      //       function (digest) {
      //         const expected = new Uint8Array(digest)
      //         assert.deepEqual(actual, expected)
      //         done()
      //       })
      //   })
      }
    })
  })
})
