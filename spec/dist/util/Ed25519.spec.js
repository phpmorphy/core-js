const crypto = require('crypto')
const { Ed25519 } = require('../../../lib')

describe('Ed25519', function () {
  const derPfx = new Uint8Array([
    0x30,
    0x2e,
    0x02,
    0x01,
    0x00,
    0x30,
    0x05,
    0x06,
    0x03,
    0x2b,
    0x65,
    0x70,
    0x04,
    0x22,
    0x04,
    0x20])

  it('проверяем, что class сущестует', function () {
    expect(Ed25519).toBeDefined()
  })

  describe('проверяем, что функция secretKeyFromSeed', function () {
    const seed = new Uint8Array(32)
    const exp = new Uint8Array(64)

    const prvKeyDer = new Uint8Array(48)
    prvKeyDer.set(derPfx)

    it('генерирует правильный приватный ключ', function () {
      for (let i = 0; i < 64; i++) {
        // рандомный seed
        crypto.randomFillSync(seed)
        prvKeyDer.set(seed, 16)
        exp.set(seed)

        // импортируем приватный ключик
        const newSecKey = crypto.createPrivateKey(
          { key: prvKeyDer, format: 'der', type: 'pkcs8' })
        // экспортируем публичный ключик
        const newPubKey = crypto.createPublicKey(newSecKey).export(
          { type: 'spki', format: 'der' })

        for (let j = 0; j < 32; j++) {
          exp[32 + j] = newPubKey[12 + j]
        }

        const act = Ed25519.secretKeyFromSeed(seed)

        expect(act).toEqual(exp)
      }
    })
  })

  describe('проверяем, что функция publicKeyFromSecretKey', function () {
    it('возвращяет правильный публичный ключ', function () {
      const rnd = new Uint8Array(64)
      const exp = new Uint8Array(32)

      for (let i = 0; i < 64; i++) {
        crypto.randomFillSync(rnd)

        for (let j = 0; j < 32; j++) {
          exp[j] = rnd[32 + j]
        }

        const act = Ed25519.publicKeyFromSecretKey(rnd)

        expect(act).toEqual(exp)
      }
    })
  })

  describe(
    'проверяем, что функция sign генерирует корректную подпись для сообщения длиной',
    function () {
      const seed = new Uint8Array(32)
      const prvKeyDer = new Uint8Array(48)
      prvKeyDer.set(derPfx)

      for (let i = 0; i < 200; i++) {
        it(i + ' байт', function () {
          const message = new Uint8Array(i)
          crypto.randomFillSync(seed)
          crypto.randomFillSync(message)
          prvKeyDer.set(seed, 16)
          const exp = crypto.sign(null, Buffer.from(message.buffer),
            crypto.createPrivateKey(
              { key: prvKeyDer, format: 'der', type: 'pkcs8' }))

          const sec = Ed25519.secretKeyFromSeed(seed)
          const act = Ed25519.sign(message, sec)

          expect(act).toEqual(new Uint8Array(exp.buffer))
        })
      }
    })

  describe('проверяем, что функция verify', function () {
    const message = new Uint8Array(100)
    const signature = new Uint8Array(64)
    const pubKey = new Uint8Array(32)
    const seed = new Uint8Array(32)
    const prvKeyDer = new Uint8Array(48)
    prvKeyDer.set(derPfx)

    it('возвращяет false для некорректной подписи', function () {
      for (let i = 0; i < 32; i++) {
        crypto.randomFillSync(pubKey)
        crypto.randomFillSync(signature)
        crypto.randomFillSync(message)

        expect(Ed25519.verify(message, signature, pubKey)).toBeFalse()
      }
    })

    it('возвращяет true для корректной подписи', function () {
      for (let i = 0; i < 42; i++) {
        crypto.randomFillSync(message)
        crypto.randomFillSync(seed)
        prvKeyDer.set(seed, 16)

        const secKey = crypto.createPrivateKey(
          { key: prvKeyDer, format: 'der', type: 'pkcs8' })
        const signature = crypto.sign(null, Buffer.from(message.buffer),
          secKey)
        const pubKeyDer = crypto.createPublicKey(secKey).export(
          { type: 'spki', format: 'der' })
        for (let j = 0; j < 32; j++) {
          pubKey[j] = pubKeyDer[12 + j]
        }

        const act = Ed25519.verify(message, signature, pubKey)

        expect(act).toBeTrue()
      }
    })
  })
})
