
describe('Ed25519', function () {
  describe('secretKeyFromSeed()', function () {
    it('генерирует правильный приватный ключ', function () {
      if (typeof window !== 'undefined') {
        this.skip()
      }

      const expected = new Uint8Array(64)
      const seed = new Uint8Array(32)
      crypto.randomFillSync(seed)

      expected.set(seed)

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

      const prvKeyDer = new Uint8Array(48)
      prvKeyDer.set(derPfx)
      prvKeyDer.set(seed, 16)

      // импортируем приватный ключик
      const newSecKey = crypto.createPrivateKey(
        { key: prvKeyDer, format: 'der', type: 'pkcs8' })

      // экспортируем публичный ключик
      const newPubKey = crypto.createPublicKey(newSecKey).export(
        { type: 'spki', format: 'der' })

      for (let j = 0; j < 32; j++) {
        expected[32 + j] = newPubKey[12 + j]
      }

      const actual = umi.Ed25519.secretKeyFromSeed(seed)

      assert.deepEqual(actual, expected)
    })
  })

  describe('publicKeyFromSecretKey()', function () {
    it('возвращяет правильный публичный ключ', function () {
      if (typeof window !== 'undefined') {
        this.skip()
      }

      const rnd = new Uint8Array(64)
      const expected = new Uint8Array(32)

      for (let i = 0; i < 64; i++) {
        crypto.randomFillSync(rnd)

        for (let j = 0; j < 32; j++) {
          expected[j] = rnd[32 + j]
        }

        const actual = umi.Ed25519.publicKeyFromSecretKey(rnd)

        assert.deepEqual(actual, expected)
      }
    })
  })

  describe('sign()', function () {
    it('генерирует корректную подпись', function () {
      if (typeof window !== 'undefined') {
        this.skip()
      }

      const seed = new Uint8Array(32)
      const prvKeyDer = new Uint8Array(48)
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
      prvKeyDer.set(derPfx)

      const message = new Uint8Array(100)
      crypto.randomFillSync(seed)
      crypto.randomFillSync(message)
      prvKeyDer.set(seed, 16)
      const exp = crypto.sign(null, Buffer.from(message.buffer),
        crypto.createPrivateKey(
          { key: prvKeyDer, format: 'der', type: 'pkcs8' }))

      const sec = umi.Ed25519.secretKeyFromSeed(seed)
      const actual = umi.Ed25519.sign(message, sec)

      const expected = new Uint8Array(exp.buffer)

      assert.deepEqual(actual, expected)
    })
  })

  describe('verify()', function () {
    it('возвращяет true для корректной подписи', function () {
      if (typeof window !== 'undefined') {
        this.skip()
      }

      const message = new Uint8Array(100)
      const pubKey = new Uint8Array(32)
      const seed = new Uint8Array(32)
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
      const prvKeyDer = new Uint8Array(48)
      prvKeyDer.set(derPfx)

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

      const actual = umi.Ed25519.verify(message, signature, pubKey)

      assert.isTrue(actual)
    })

    it('возвращяет false для некорректной подписи', function () {
      if (typeof window !== 'undefined') {
        this.skip()
      }

      const message = new Uint8Array(100)
      const pubKey = new Uint8Array(32)
      const signature = new Uint8Array(64)

      crypto.randomFillSync(pubKey)
      crypto.randomFillSync(signature)
      crypto.randomFillSync(message)

      const actual = umi.Ed25519.verify(message, signature, pubKey)

      assert.isFalse(actual)
    })
  })

  describe('константы', function () {
    it('SEED_BYTES', function () {
      assert.isNumber(umi.Ed25519.SEED_BYTES)
    })
  })
})
