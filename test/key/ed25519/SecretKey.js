describe('SecretKey', function () {
  describe('new SecretKey()', function () {
    describe('должен возвращять ошибку если передано', function () {
      const tests = [
        { desc: 'отрицательное целое число', args: -1 },
        { desc: 'положительное вещественное число', args: 0.123 },
        { desc: 'пустую строку', args: '' },
        { desc: 'пустой массив', args: [] },
        { desc: 'пустой объект', args: {} },
        { desc: 'ничего', args: undefined },
        { desc: 'ArrayBuffer', args: new ArrayBuffer(1) },
        { desc: 'DataView', args: new DataView(new ArrayBuffer(1)) },
        { desc: 'ключ короче чем 64 байта', args: new Uint8Array(63) },
        { desc: 'ключ длиньше чем 64 байта', args: new Uint8Array(65) }
      ]

      tests.forEach(function (test) {
        it(test.desc, function () {
          assert.throws(() => new umi.SecretKey(test.args), Error)
        })
      })
    })
  })

  describe('fromSeed()', function () {
    describe('должен возвращять ошибку если передать', function () {
      const tests = [
        { desc: 'отрицательное целое число', args: -1 },
        { desc: 'положительное вещественное число', args: 0.123 },
        { desc: 'пустую строку', args: '' },
        { desc: 'пустой массив', args: [] },
        { desc: 'пустой объект', args: {} },
        { desc: 'ничего', args: undefined },
        { desc: 'ArrayBuffer', args: new ArrayBuffer(1) },
        { desc: 'DataView', args: new DataView(new ArrayBuffer(1)) },
        { desc: 'seed длиньше чем 128 байт', args: new Uint8Array(129) }
      ]

      tests.forEach(function (test) {
        it(test.desc, function () {
          assert.throws(() => umi.SecretKey.fromSeed(test.args), Error)
        })
      })
    })

    describe('должен создавать правильный приватный ключ если', function () {
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
    it('должен возвращать правильный публичный ключ', function () {
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
    describe('должен возвращять ошибку если передать', function () {
      const tests = [
        { desc: 'отрицательное целое число', args: -1 },
        { desc: 'положительное вещественное число', args: 0.123 },
        { desc: 'пустую строку', args: '' },
        { desc: 'пустой массив', args: [] },
        { desc: 'пустой объект', args: {} },
        { desc: 'ничего', args: undefined },
        { desc: 'ArrayBuffer', args: new ArrayBuffer(1) },
        { desc: 'DataView', args: new DataView(new ArrayBuffer(1)) }
      ]

      tests.forEach(function (test) {
        it(test.desc, function () {
          const secKey = umi.SecretKey.fromSeed(new Uint8Array(64))
          assert.throws(() => secKey.sign(test.args), Error)
        })
      })
    })

    it('должен возвращать правильную подпись', function () {
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
