/* eslint-disable no-undef */

const crypto = require('crypto')
const { SecretKey } = require('../../../../lib')

describe('SecretKey', function () {
  it('проверяем, что класс существует', function () {
    expect(SecretKey).toBeDefined()
  })

  describe('конструктор', function () {
    describe('должен возвращять ошибку если', function () {
      it('вызван без параметров', function () {
        expect(() => new SecretKey()).toThrowError(Error)
      })

      for (const prm of [null, '', 1, 0.123, [], {}, NaN]) {
        it('передан не Uint8Array', function () {
          expect(() => new SecretKey(prm)).toThrowError(Error)
        })
      }

      it('ключ короче чем 64 байта', function () {
        const key = new Uint8Array(63)
        expect(() => new SecretKey(key)).toThrowError(Error)
      })

      it('ключ длиньше чем 64 байта', function () {
        const key = new Uint8Array(65)
        expect(() => new SecretKey(key)).toThrowError(Error)
      })
    })
  })

  describe('функция fromSeed', function () {
    describe('должна возвращять ошибку если', function () {
      it('вызвана без параметров', function () {
        expect(() => SecretKey.fromSeed()).toThrowError(Error)
      })

      for (const prm of [null, '', 1, 0.123, [], {}, NaN]) {
        it('передан не Uint8Array', function () {
          expect(() => SecretKey.fromSeed(prm)).toThrowError(Error)
        })
      }

      it('seed длиньше чем 128 байт', function () {
        const seed = new Uint8Array(129)
        expect(() => SecretKey.fromSeed(seed)).toThrowError(Error)
      })
    })

    describe('должна создавать правильный приватный ключ если', function () {
      it('seed меньше 32 байт', function () {
        const seed = new Uint8Array(31)
        crypto.randomFillSync(seed)

        const hash = crypto.createHash('sha256').update(seed).digest()

        // первые 32 байта приватного ключа равны 32 битному seed'у
        const act = SecretKey.fromSeed(seed).bytes.subarray(0, 32)
        const exp = new Uint8Array(hash.buffer)

        expect(act).toEqual(exp)
      })

      it('seed имеет длину 32 байт', function () {
        const seed = new Uint8Array(32)
        crypto.randomFillSync(seed)

        // первые 32 байта приватного ключа равны 32 битному seed'у
        const act = SecretKey.fromSeed(seed).bytes.subarray(0, 32)

        expect(act).toEqual(seed)
      })

      it('seed больше 32 байт', function () {
        const seed = new Uint8Array(33)
        crypto.randomFillSync(seed)

        const hash = crypto.createHash('sha256').update(seed).digest()

        // первые 32 байта приватного ключа равны 32 битному seed'у
        const act = SecretKey.fromSeed(seed).bytes.subarray(0, 32)
        const exp = new Uint8Array(hash.buffer)

        expect(act).toEqual(exp)
      })
    })
  })

  describe('функция publicKey', function () {
    it('должна возвращать правильный публичный ключ', function () {
      const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519')

      const derPubKey = publicKey.export({ type: 'spki', format: 'der' })
      const derSecKey = privateKey.export({ type: 'pkcs8', format: 'der' })
      const seed = new Uint8Array(derSecKey.buffer).subarray(16, 48)

      const act = SecretKey.fromSeed(seed).publicKey.bytes
      const exp = new Uint8Array(derPubKey.buffer).subarray(12, 44)

      expect(act).toEqual(exp)
    })
  })

  describe('функция sign', function () {
    it('должна возвращать правильную подпись', function () {
      const msg = new Uint8Array(100)
      crypto.randomFillSync(msg)

      const { privateKey } = crypto.generateKeyPairSync('ed25519')
      const derSecKey = privateKey.export({ type: 'pkcs8', format: 'der' })
      const seed = new Uint8Array(derSecKey.buffer).subarray(16, 48)
      const sig = crypto.sign(null, Buffer.from(msg.buffer), privateKey)

      const act = SecretKey.fromSeed(seed).sign(msg)
      const exp = new Uint8Array(sig.buffer)

      expect(act).toEqual(exp)
    })
  })
})
