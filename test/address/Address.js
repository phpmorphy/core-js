if (typeof window === 'undefined') {
  var umi = require('../../dist')
  var assert = require('chai').assert
}

describe('Address', function () {
  describe('константы', function () {
    const tests = [
      { args: 'LENGTH', expected: 34 },
      { args: 'Genesis', expected: 0 },
      { args: 'Umi', expected: 21929 }
    ]

    tests.forEach(function (test) {
      it(test.args, function () {
        const actual = umi.Address[test.args]
        assert.strictEqual(actual, test.expected)
      })
    })
  })

  describe('new Address()', function () {
    describe('возвращяет ошибку если передать', function () {
      const len = umi.Address.LENGTH
      const tests = [
        { desc: 'число', args: len },
        { desc: 'строку', args: 'a'.repeat(len) },
        { desc: 'массив', args: new Array(len) },
        { desc: 'объект', args: { a: 'b' } },
        { desc: 'ArrayBuffer', args: new ArrayBuffer(len) },
        { desc: 'Int8Array', args: new Int8Array(len) },
        { desc: 'DataView', args: new DataView(new ArrayBuffer(len)) },
        { desc: 'слишком короткий Uint8Array', args: new Uint8Array(len - 1) },
        { desc: 'слишком длинный Uint8Array', args: new Uint8Array(len + 1) }
      ]

      tests.forEach(function (test) {
        it(test.desc, function () {
          assert.throws(() => new umi.Address(test.args), Error)
        })
      })
    })

    describe('создает адрес', function () {
      it('с префиксом "umi" если вызвать без параметров', function () {
        const actual = new umi.Address()
        assert.strictEqual(actual.prefix, 'umi')
      })

      it('с префиксом "genesis" если передать нули', function () {
        const actual = new umi.Address(new Uint8Array(umi.Address.LENGTH))
        assert.strictEqual(actual.prefix, 'genesis')
      })
    })
  })

  describe('fromBech32()', function () {
    describe('возвращяет ошибку если передать', function () {
      const len = 62 // длина bech32 адреса
      const tests = [
        { desc: 'число', args: len },
        { desc: 'строку', args: 'a'.repeat(len) },
        { desc: 'массив', args: new Array(len) },
        { desc: 'объект', args: { a: 'b' } },
        { desc: 'undefined', args: undefined },
        { desc: 'Uint8Array', args: new Uint8Array(len) },
        { desc: 'ArrayBuffer', args: new ArrayBuffer(len) },
        { desc: 'DataView', args: new DataView(new ArrayBuffer(len)) },
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

    describe('создает адрес', function () {
      it('из корректного bech32 адреса', function () {
        const expected = 'aaa1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq48c9jj'
        const actual = umi.Address.fromBech32(expected).bech32
        assert.strictEqual(actual, expected)
      })
    })
  })

  describe('fromKey()', function () {
    describe('возвращяет ошибку если передать', function () {
      const len = umi.PublicKey.LENGTH
      const tests = [
        { desc: 'число', args: len },
        { desc: 'строку', args: 'a'.repeat(len) },
        { desc: 'массив', args: new Array(len) },
        { desc: 'объект', args: { a: 'b' } },
        { desc: 'undefined', args: undefined },
        { desc: 'Uint8Array', args: new Uint8Array(len) },
        { desc: 'ArrayBuffer', args: new ArrayBuffer(len) },
        { desc: 'DataView', args: new DataView(new ArrayBuffer(len)) }
      ]

      tests.forEach(function (test) {
        it(test.desc, function () {
          assert.throws(() => umi.Address.fromKey(test.args), Error)
        })
      })
    })

    describe('создать адрес c перфиксом "umi" если передан', function () {
      it('PublicKey', function () {
        const pubKey = new umi.PublicKey(new Uint8Array(umi.PublicKey.LENGTH))
        const expected = 'umi1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqr5zcpj'
        const actual = umi.Address.fromKey(pubKey).bech32

        assert.strictEqual(actual, expected)
      })

      it('SecretKey', function () {
        const secKey = umi.SecretKey.fromSeed(new Uint8Array(32))
        const expected = 'umi18d4z00xwk6jz6c4r4rgz5mcdwdjny9thrh3y8f36cpy2rz6emg5s6rxnf6'
        const actual = umi.Address.fromKey(secKey)

        assert.strictEqual(actual.bech32, expected)
      })
    })
  })

  describe('publicKey', function () {
    describe('возвращяет ошибку если передать', function () {
      const len = umi.PublicKey.LENGTH
      const tests = [
        { desc: 'число', args: len },
        { desc: 'строку', args: 'a'.repeat(len) },
        { desc: 'массив', args: new Array(len) },
        { desc: 'объект', args: { a: 'b' } },
        { desc: 'undefined', args: undefined },
        { desc: 'Uint8Array', args: new Uint8Array(len) },
        { desc: 'ArrayBuffer', args: new ArrayBuffer(len) },
        { desc: 'DataView', args: new DataView(new ArrayBuffer(len)) }
      ]

      tests.forEach(function (test) {
        it(test.desc, function () {
          const adr = new umi.Address()
          assert.throws(() => { adr.publicKey = test.args }, Error)
        })
      })
    })

    it('устанавливает PublicKey не меняя префикс', function () {
      const pubKey = new umi.PublicKey(new Uint8Array(umi.PublicKey.LENGTH))
      const adr = new umi.Address().setPrefix('zzz').setPublicKey(pubKey)
      assert.strictEqual(adr.prefix, 'zzz')
    })
  })

  describe('version', function () {
    describe('возвращяет ошибку если передать', function () {
      const tests = [
        { desc: 'отрицательное целое число', args: -1 },
        { desc: 'положительное вещественное число', args: 0.123 },
        { desc: 'строку', args: 'ab' },
        { desc: 'массив', args: [1, 2] },
        { desc: 'объект', args: { a: 'b' } },
        { desc: 'undefined', args: undefined },
        { desc: 'некорректную версию', args: 65534 }
      ]

      tests.forEach(function (test) {
        it(test.desc, function () {
          const adr = new umi.Address()
          assert.throws(() => { adr.version = test.args }, Error)
        })
      })
    })

    describe('устанавливает версию', function () {
      const tests = [
        { desc: '0', args: 0, expected: 0 },
        { desc: '1057', args: 1057, expected: 1057 },
        { desc: '1091', args: 1091, expected: 1091 },
        { desc: '21929', args: 21929, expected: 21929 },
        { desc: '27482', args: 27482, expected: 27482 }
      ]

      tests.forEach(function (test) {
        it(test.desc, function () {
          const actual = new umi.Address().setVersion(test.args).version
          assert.strictEqual(actual, test.expected)
        })
      })
    })
  })

  describe('prefix', function () {
    describe('возвращяет ошибку если передать', function () {
      const len = 3
      const tests = [
        { desc: 'число', args: len },
        { desc: 'пустой массив', args: new Uint8Array(len) },
        { desc: 'пустой объект', args: { a: 'b' } },
        { desc: 'undefined', args: undefined },
        { desc: 'Uint8Array', args: new Uint8Array(len) },
        { desc: 'ArrayBuffer', args: new ArrayBuffer(len) },
        { desc: 'DataView', args: new DataView(new ArrayBuffer(len)) },
        { desc: 'некорректную версию', args: 65534 },
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
        })
      })
    })

    describe('устанавливает префикс', function () {
      const tests = [
        { desc: 'genesis', args: 'genesis', expected: 'genesis' },
        { desc: 'aaa', args: 'aaa', expected: 'aaa' },
        { desc: 'abc', args: 'abc', expected: 'abc' },
        { desc: 'umi', args: 'umi', expected: 'umi' },
        { desc: 'zzz', args: 'zzz', expected: 'zzz' }
      ]

      tests.forEach(function (test) {
        it(test.desc, function () {
          const actual = new umi.Address().setPrefix(test.args).prefix
          assert.strictEqual(actual, test.expected)
        })
      })
    })
  })

  describe('bytes', function () {
    it('возвращяет Uint8Array корректной длины', function () {
      if (typeof window !== 'undefined') {
        this.skip()
      }

      const hash = umi.sha256(new Uint8Array(2))
      const expected = new Uint8Array(umi.Address.LENGTH)
      expected.set(hash, 2)
      const actual = new umi.Address(expected).bytes

      assert.deepEqual(actual, expected)
    })
  })
})
