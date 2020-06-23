if (typeof window === 'undefined') {
  var umi = require('../../../')
  var assert = require('chai').assert
  var crypto = require('crypto')
}

describe('SecretKey', function () {
  describe('константы', function () {
    const tests = [
      { args: 'LENGTH', expected: 64 },
      { args: 'SIGNATURE_LENGTH', expected: 64 }
    ]

    tests.forEach(function (test) {
      it(test.args, function () {
        const actual = umi.SecretKey[test.args]
        assert.strictEqual(actual, test.expected)
      })
    })
  })

  describe('new SecretKey()', function () {
    describe('возвращяет ошибку если передать', function () {
      const len = umi.SecretKey.LENGTH
      const tests = [
        { desc: 'число', args: len },
        { desc: 'строку', args: 'a'.repeat(len) },
        { desc: 'массив', args: new Array(len) },
        { desc: 'пустой объект', args: { a: 'b' } },
        { desc: 'undefined', args: undefined },
        { desc: 'ArrayBuffer', args: new ArrayBuffer(len) },
        { desc: 'DataView', args: new DataView(new ArrayBuffer(len)) },
        { desc: 'слишко короткий Uint8Array', args: new Uint8Array(len - 1) },
        { desc: 'слишко длинный Uint8Array', args: new Uint8Array(len + 1) }
      ]

      tests.forEach(function (test) {
        it(test.desc, function () {
          assert.throws(() => new umi.SecretKey(test.args), Error)
        })
      })
    })
  })

  describe('fromSeed()', function () {
    describe('возвращяет ошибку если передать', function () {
      const len = 1
      const tests = [
        { desc: 'число', args: len },
        { desc: 'строку', args: 'a'.repeat(len) },
        { desc: 'массив', args: new Array(len) },
        { desc: 'объект', args: {a: 'b'} },
        { desc: 'ничего', args: undefined },
        { desc: 'ArrayBuffer', args: new ArrayBuffer(len) },
        { desc: 'DataView', args: new DataView(new ArrayBuffer(len)) },
        { desc: 'Int8Array', args: new Int8Array(len) },
        { desc: 'Uint8Array длиннее чем 128 байт', args: new Uint8Array(129) }
      ]

      tests.forEach(function (test) {
        it(test.desc, function () {
          assert.throws(() => umi.SecretKey.fromSeed(test.args), Error)
        })
      })
    })

    describe('создает правильный приватный ключ если', function () {
      it('seed меньше 32 байт', function () {
        if (typeof window !== 'undefined') {
          this.skip()
        }

        const seed = new Uint8Array(31)
        crypto.randomFillSync(seed)

        const hash = crypto.createHash('sha256').update(seed).digest()

        // первые 32 байта приватного ключа равны 32 битному seed'у
        const actual = umi.SecretKey.fromSeed(seed).bytes.subarray(0, 32)
        const expected = new Uint8Array(hash.buffer)

        assert.deepEqual(actual, expected)
      })

      it('seed имеет длину 32 байт', function () {
        if (typeof window !== 'undefined') {
          this.skip()
        }

        const seed = new Uint8Array(32)
        crypto.randomFillSync(seed)

        // первые 32 байта приватного ключа равны 32 битному seed'у
        const expected = seed
        const actual = umi.SecretKey.fromSeed(seed).bytes.subarray(0, 32)

        assert.deepEqual(actual, expected)
      })

      it('seed больше 32 байт', function () {
        if (typeof window !== 'undefined') {
          this.skip()
        }

        const seed = new Uint8Array(33)
        crypto.randomFillSync(seed)

        const hash = crypto.createHash('sha256').update(seed).digest()

        // первые 32 байта приватного ключа равны 32 битному seed'у
        const actual = umi.SecretKey.fromSeed(seed).bytes.subarray(0, 32)
        const expected = new Uint8Array(hash.buffer)

        assert.deepEqual(actual, expected)
      })
    })
  })

  describe('publicKey', function () {
    it('возвращяет правильный публичный ключ', function () {
      if (typeof window !== 'undefined') {
        this.skip()
      }

      const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519')

      const derPubKey = publicKey.export({ type: 'spki', format: 'der' })
      const derSecKey = privateKey.export({ type: 'pkcs8', format: 'der' })
      const seed = new Uint8Array(derSecKey.buffer).subarray(16, 48)

      const actual = umi.SecretKey.fromSeed(seed).publicKey.bytes
      const expected = new Uint8Array(derPubKey.buffer).subarray(12, 44)

      assert.deepEqual(actual, expected)
    })
  })

  describe('sign()', function () {
    describe('возвращяет ошибку если передать', function () {
      const len = 1
      const tests = [
        { desc: 'число', args: len },
        { desc: 'строку', args: 'a'.repeat(len) },
        { desc: 'массив', args: new Array(len) },
        { desc: 'объект', args: { a: 'b' } },
        { desc: 'undefined', args: undefined },
        { desc: 'ArrayBuffer', args: new ArrayBuffer(len) },
        { desc: 'DataView', args: new DataView(new ArrayBuffer(len)) }
      ]

      tests.forEach(function (test) {
        it(test.desc, function () {
          const secKey = new umi.SecretKey(new Uint8Array(umi.SecretKey.LENGTH))
          assert.throws(() => secKey.sign(test.args), Error)
        })
      })
    })

    it('возвращяет корректную подпись', function () {
      if (typeof window !== 'undefined') {
        this.skip()
      }

      const msg = new Uint8Array(100)
      crypto.randomFillSync(msg)

      const { privateKey } = crypto.generateKeyPairSync('ed25519')
      const derSecKey = privateKey.export({ type: 'pkcs8', format: 'der' })
      const seed = new Uint8Array(derSecKey.buffer).subarray(16, 48)
      const sig = crypto.sign(null, Buffer.from(msg.buffer), privateKey)

      const actual = umi.SecretKey.fromSeed(seed).sign(msg)
      const expected = new Uint8Array(sig.buffer)

      assert.deepEqual(actual, expected)
    })
  })
})
