if (typeof window === 'undefined') {
  var umi = require('../../dist/index.js')
  var assert = require('chai').assert
}

describe('Address', function () {
  describe('new Address()', function () {
    it('ошибка если некорректная длина', function () {
      assert.throws(function () {
        return new umi.Address([0, 1, 2])
      }, Error)
    })
  })

  describe('fromBech32()', function () {
    describe('адреса', function () {
      const tests = [
        {
          desc: 'umi 0xFF',
          args: 'umi1lllllllllllllllllllllllllllllllllllllllllllllllllllsp2pfg9'
        },
        {
          desc: 'umi 0x00',
          args: 'umi1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqr5zcpj'
        },
        {
          desc: 'genesis 0xFF',
          args: 'genesis1llllllllllllllllllllllllllllllllllllllllllllllllllls5c7uy0'
        },
        {
          desc: 'genesis 0x00',
          args: 'genesis1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqkxaddc'
        },
        {
          desc: 'aaa rand',
          args: 'aaa1nfgzzgkr3nd69jes5kw87s2tuv46mhmrqpnw8ksffaujycenxx6sl48tkv'
        }
      ]

      tests.forEach(function (test) {
        it(test.desc, function () {
          const actual = umi.Address.fromBech32(test.args).bech32
          assert.equal(test.args, actual)
        })
      })
    })

    describe('ошибки', function () {
      const tests = [
        { desc: 'тип', args: new Array(62) },
        {
          desc: 'invalid prefix 1',
          args: 'geneziz1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqwa7qv0'
        },
        {
          desc: 'invalid prefix 2',
          args: '+++1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq2trd4a'
        },
        {
          desc: 'empty prefix',
          args: '1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqugay46'
        },
        {
          desc: 'invalid checksum',
          args: 'umi1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqr5zcpf'
        },
        {
          desc: 'invalid character',
          args: 'umi1iqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqr5zcpj'
        },
        {
          desc: 'no separator',
          args: 'umilqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqr5zcpj'
        },
        {
          desc: 'too short',
          args: 'umi1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqu5fmc9'
        },
        {
          desc: 'too long',
          args: 'umi1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq63dha7'
        },
        {
          desc: 'non-zero padding',
          args: 'umi1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqlfceute'
        }
      ]

      tests.forEach(function (test) {
        it(test.desc, function () {
          assert.throws(function () {
            umi.Address.fromBech32(test.args)
          }, Error)
        })
      })
    })
  })

  describe('setBech32()', function () {
    it('адрес', function () {
      const expected = 'aaa1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq48c9jj'
      const actual = umi.Address.fromBech32(expected).bech32
      assert.strictEqual(actual, expected)
    })
  })

  describe('fromKey()', function () {
    it('ошибка если некорректный тип', function () {
      assert.throws(function () { umi.Address.fromKey({}) }, Error)
    })

    it('из публичного ключа', function () {
      const pubKey = new umi.PublicKey(new Uint8Array(32))
      const expected = 'umi1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqr5zcpj'
      const actual = umi.Address.fromKey(pubKey).bech32

      assert.strictEqual(actual, expected)
    })

    it('из секретного ключа', function () {
      const secKey = umi.SecretKey.fromSeed(new Uint8Array(32))
      const expected = 'umi18d4z00xwk6jz6c4r4rgz5mcdwdjny9thrh3y8f36cpy2rz6emg5s6rxnf6'
      const actual = umi.Address.fromKey(secKey).bech32

      assert.strictEqual(actual, expected)
    })
  })

  describe('publicKey', function () {
    it('ошибка если некорректный тип', function () {
      const adr = new umi.Address()
      assert.throws(function () { adr.publicKey = {} }, Error)
    })
  })

  describe('version', function () {
    describe('ошибка', function () {
      const tests = [
        { desc: 'строка', args: '1057' },
        { desc: 'float', args: 1057.1 },
        {
          desc: 'некорректный первый символ (26)',
          args: (27 << 10) + (1 << 5) + 1
        },
        {
          desc: 'некорректный первый символ (0)',
          args: (0 << 10) + (1 << 5) + 1
        },
        {
          desc: 'некорректный второй символ (26)',
          args: (1 << 10) + (27 << 5) + 1
        },
        {
          desc: 'некорректный второй символ (0)',
          args: (1 << 10) + (0 << 5) + 1
        },
        {
          desc: 'некорректный третий символ (26)',
          args: (1 << 10) + (1 << 5) + 27
        },
        { desc: 'некорректная версию', args: 65534 }
      ]

      tests.forEach(function (test) {
        it(test.desc, function () {
          const adr = new umi.Address()
          assert.throws(function () { adr.version = test.args }, Error)
        })
      })
    })

    describe('версия', function () {
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
    describe('ошибка', function () {
      const tests = [
        { desc: 'тип', args: {} },
        { desc: 'короткий', args: 'ab' },
        { desc: 'длинный', args: 'abcd' },
        { desc: 'первый символ (Abc)', args: 'Abc' },
        { desc: 'первый символ (0bc)', args: '0bc' },
        { desc: 'второй символ (aBc)', args: 'aBc' },
        { desc: 'второй символ (a1c)', args: 'a1c' },
        { desc: 'третий символ (abC)', args: 'abC' },
        { desc: 'третий символ (ab2)', args: 'ab2' }
      ]

      tests.forEach(function (test) {
        it(test.desc, function () {
          const adr = new umi.Address()
          assert.throws(function () { adr.prefix = test.args }, Error)
        })
      })
    })

    describe('префикс', function () {
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
})
