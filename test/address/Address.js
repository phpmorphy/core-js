describe('Address', function () {
  describe('new Address()', function () {
    describe('возвращяет ошибку если передать', function () {
      const tests = [
        { desc: 'отрицательное целое число', args: -1 },
        { desc: 'положительное вещественное число', args: 0.123 },
        { desc: 'пустую строку', args: '' },
        { desc: 'пустой массив', args: [] },
        { desc: 'пустой объект', args: {} },
        { desc: 'ArrayBuffer', args: new ArrayBuffer(1) },
        { desc: 'DataView', args: new DataView(new ArrayBuffer(1)) },
        { desc: 'адрес короче чем 34 байта', args: new Uint8Array(33) },
        { desc: 'адрес длиннее чем 34 байта', args: new Uint8Array(35) }
      ]

      tests.forEach(function (test) {
        it(test.desc, function () {
          assert.throws(() => new umi.Address(test.args), Error)
        })
      })
    })

    describe('создает адрес', function () {
      it('с префиксом "umi" если вызвать без параметров', function () {
        const expected = 'umi1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqr5zcpj'
        const actual = new umi.Address().bech32

        assert.equal(actual, expected)
      })

      it('с префиксом "genesis" если передать 34 нуля', function () {
        const expected = 'genesis1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqkxaddc'
        const actual = new umi.Address(new Uint8Array(34)).bech32

        assert.equal(actual, expected)
      })
    })
  })

  describe('fromBech32()', function () {
    describe('возвращяет ошибку если передать', function () {
      const tests = [
        { desc: 'отрицательное целое число', args: -1 },
        { desc: 'положительное вещественное число', args: 0.123 },
        { desc: 'пустую строку', args: '' },
        { desc: 'пустой массив', args: [] },
        { desc: 'пустой объект', args: {} },
        { desc: 'ничего', args: undefined },
        { desc: 'Uint8Array', args: new Uint8Array(1) },
        { desc: 'ArrayBuffer', args: new ArrayBuffer(1) },
        { desc: 'DataView', args: new DataView(new ArrayBuffer(1)) },
        { desc: 'слишком короткий bech32 адрес', args: 'umi1qqqqk43xnq' },
        {
          desc: 'слишком длинный bech32 адрес',
          args: 'umi1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq63dha7'
        },
        {
          desc: 'невалидный bech32 адрес',
          args: 'umi1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqr5zcpq'
        }
      ]

      tests.forEach(function (test) {
        it(test.desc, function () {
          assert.throws(() => umi.Address.fromBech32(test.args), Error)
        })
      })
    })

    it('создает адрес из корректного bech32 адреса', function () {
      const address = 'aaa1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq48c9jj'
      const actual = umi.Address.fromBech32(address)

      assert.instanceOf(actual, umi.Address)
      assert.equal(actual.prefix, 'aaa')
      assert.deepEqual(actual.publicKey.bytes, new Uint8Array(32))
    })
  })

  describe('fromKey()', function () {
    describe('возвращяет ошибку если передать', function () {
      const tests = [
        { desc: 'отрицательное целое число', args: -1 },
        { desc: 'положительное вещественное число', args: 0.123 },
        { desc: 'пустую строку', args: '' },
        { desc: 'пустой массив', args: [] },
        { desc: 'пустой объект', args: {} },
        { desc: 'ничего', args: undefined },
        { desc: 'Uint8Array', args: new Uint8Array(1) },
        { desc: 'ArrayBuffer', args: new ArrayBuffer(1) },
        { desc: 'DataView', args: new DataView(new ArrayBuffer(1)) }
      ]

      tests.forEach(function (test) {
        it(test.desc, function () {
          assert.throws(() => umi.Address.fromKey(test.args), Error)
        })
      })
    })

    describe('создать адрес c перфиксом "umi" если передан', function () {
      it('PublicKey', function () {
        const expected = 'umi1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqr5zcpj'
        const key = new Uint8Array(32)
        const pubKey = new umi.PublicKey(key)
        const actual = umi.Address.fromKey(pubKey).bech32

        assert.equal(actual, expected)
      })

      it('SecretKey', function () {
        const expected = 'umi18d4z00xwk6jz6c4r4rgz5mcdwdjny9thrh3y8f36cpy2rz6emg5s6rxnf6'

        const seed = new Uint8Array(32)
        const secKey = umi.SecretKey.fromSeed(seed)
        const actual = umi.Address.fromKey(secKey)

        assert.equal(actual.bech32, expected)
      })
    })
  })

  describe('publicKey', function () {
    describe('возвращяет ошибку если передать', function () {
      const tests = [
        { desc: 'отрицательное целое число', args: -1 },
        { desc: 'положительное вещественное число', args: 0.123 },
        { desc: 'пустую строку', args: '' },
        { desc: 'пустой массив', args: [] },
        { desc: 'пустой объект', args: {} },
        { desc: 'ничего', args: undefined },
        { desc: 'Uint8Array', args: new Uint8Array(1) },
        { desc: 'ArrayBuffer', args: new ArrayBuffer(1) },
        { desc: 'DataView', args: new DataView(new ArrayBuffer(1)) }
      ]

      tests.forEach(function (test) {
        it(test.desc, function () {
          const adr = new umi.Address()
          assert.throws(() => { adr.publicKey = test.args }, Error)
        })
      })
    })

    it('устанавливает PublicKey не меняя префикс', function () {
      const pubKey = new umi.PublicKey(new Uint8Array(32))
      const adr = new umi.Address().setPrefix('zzz')

      const expected = 'zzz1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq0auqgp'
      const actual = adr.setPublicKey(pubKey).bech32

      assert.equal(actual, expected)
    })
  })

  describe('version', function () {
    describe('возвращяет ошибку если передать', function () {
      const tests = [
        { desc: 'отрицательное целое число', args: -1 },
        { desc: 'положительное вещественное число', args: 0.123 },
        { desc: 'пустую строку', args: '' },
        { desc: 'пустой массив', args: [] },
        { desc: 'пустой объект', args: {} },
        { desc: 'ничего', args: undefined },
        { desc: 'некорректную версию', args: 65534 },
        { desc: 'Uint8Array', args: new Uint8Array(1) },
        { desc: 'ArrayBuffer', args: new ArrayBuffer(1) },
        { desc: 'DataView', args: new DataView(new ArrayBuffer(1)) }
      ]

      tests.forEach(function (test) {
        it(test.desc, function () {
          const adr = new umi.Address()
          assert.throws(() => { adr.version = test.args }, Error)
          assert.throws(() => { adr.setVersion(test.args) }, Error)
        })
      })
    })

    describe('устанавливает версию', function () {
      const tests = [
        { desc: '0 и префикс "genesis"', args: 0, expected: 'genesis' },
        { desc: '1057 и префикс "aaa" ', args: 1057, expected: 'aaa' },
        { desc: '1091 и префикс "abc"', args: 1091, expected: 'abc' },
        { desc: '21929 и префикс "umi"', args: 21929, expected: 'umi' },
        { desc: '27482 и префикс "zzz"', args: 27482, expected: 'zzz' }
      ]

      tests.forEach(function (test) {
        it(test.desc, function () {
          const actual = new umi.Address().setVersion(test.args).prefix
          assert.equal(actual, test.expected)
        })
      })
    })
  })

  describe('prefix', function () {
    describe('возвращяет ошибку если передать', function () {
      const tests = [
        { desc: 'отрицательное целое число', args: -1 },
        { desc: 'положительное вещественное число', args: 0.123 },
        { desc: 'пустую строку', args: '' },
        { desc: 'пустой массив', args: [] },
        { desc: 'пустой объект', args: {} },
        { desc: 'ничего', args: undefined },
        { desc: 'некорректную версию', args: 65534 },
        { desc: 'Uint8Array', args: new Uint8Array(1) },
        { desc: 'ArrayBuffer', args: new ArrayBuffer(1) },
        { desc: 'DataView', args: new DataView(new ArrayBuffer(1)) },
        { desc: 'слишком короткую строку', args: 'ab' },
        { desc: 'слишком длинную строку', args: 'abcd' },
        { desc: 'некорректный первый символ (Abc)', args: 'Abc' },
        { desc: 'некорректный первый символ (0bc)', args: '0bc' },
        { desc: 'некорректный второй символ (aBc)', args: 'aBc' },
        { desc: 'некорректный второй символ (a1c)', args: 'a1c' },
        { desc: 'некорректный третий символ (abC)', args: 'abC' },
        { desc: 'некорректный третий символ (ab2)', args: 'ab2' }
      ]

      tests.forEach(function (test) {
        it(test.desc, function () {
          const adr = new umi.Address()
          assert.throws(() => { adr.prefix = test.args }, Error)
          assert.throws(() => { adr.setPrefix(test.args) }, Error)
        })
      })
    })
  })

  describe('bytes', function () {
    it('возвращяет Uint8Array длиной 34 байта', function () {
      const hash = umi.sha256(new Uint8Array(2))
      const expected = new Uint8Array(34)
      expected.set(hash, 2)
      const actual = new umi.Address(expected).bytes

      assert.deepEqual(actual, expected)
    })
  })
})
