const Address = require('../../dist/index.js').Address
const SecretKey = require('../../dist/index.js').SecretKey
const PublicKey = require('../../dist/index.js').PublicKey
const assert = require('chai').assert

describe('Address', function () {
  describe('.fromBytes()', function () {
    it('ошибка если некорректная длина', function () {
      assert.throws(function () {
        return Address.fromBytes([0, 1, 2])
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
          const actual = Address.fromBech32(test.args).getBech32()
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
            Address.fromBech32(test.args)
          }, Error)
        })
      })
    })
  })

  describe('fromKey()', function () {
    it('ошибка если некорректный тип', function () {
      assert.throws(function () { Address.fromKey({}) }, Error)
    })

    it('из публичного ключа', function () {
      const pubKey = new PublicKey(new Uint8Array(32))
      const expected = 'umi1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqr5zcpj'
      const actual = Address.fromKey(pubKey).getBech32()

      assert.strictEqual(actual, expected)
    })

    it('из секретного ключа', function () {
      const secKey = SecretKey.fromSeed(new Uint8Array(32))
      const expected = 'umi18d4z00xwk6jz6c4r4rgz5mcdwdjny9thrh3y8f36cpy2rz6emg5s6rxnf6'
      const actual = Address.fromKey(secKey).getBech32()

      assert.strictEqual(actual, expected)
    })
  })

  describe('#setPublicKey()', function () {
    it('ошибка если некорректный тип', function () {
      assert.throws(function () { new Address().setPublicKey({}) }, Error)
    })

    it('публичный ключ', function () {
      const expected = new Uint8Array(32)
      expected[0] = 128
      expected[31] = 255
      const pubKey = new PublicKey(expected)
      const actual = new Address().setPublicKey(pubKey).getPublicKey().getBytes()
      assert.deepEqual(new Uint8Array(actual), expected)
    })
  })

  describe('prefix', function () {
    describe('ошибка', function () {
      it('некорректная версия (bytes)', function () {
        const bytes = new Uint8Array(34)
        bytes[0] = 255
        bytes[1] = 255
        assert.throws(function () {
          Address.fromBytes(bytes).getPrefix()
        }, Error, 'bech32: invalid version')
      })

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
          assert.throws(function () {
            new Address().setPrefix(test.args)
          }, Error)
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
          const actual = new Address().setPrefix(test.args).getPrefix()
          assert.strictEqual(actual, test.expected)
        })
      })
    })
  })
})
