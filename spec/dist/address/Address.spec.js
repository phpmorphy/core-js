const { Address, PublicKey, SecretKey } = require('../../../lib')

describe('Address', function () {
  it('проверяем, что класс существует', function () {
    expect(Address).toBeDefined()
  })

  describe('конструктор', function () {
    describe('должен возвращять ошибку если', function () {
      for (const prm of [null, '', 1, 0.123, [], {}, NaN]) {
        it('передан не Uint8Array', function () {
          expect(() => new Address(prm)).toThrowError(Error)
        })
      }

      it('адрес короче чем 34 байта', function () {
        const key = new Uint8Array(33)
        expect(() => new Address(key)).toThrowError(Error)
      })

      it('адрес длиньше чем 35 байта', function () {
        const key = new Uint8Array(35)
        expect(() => new Address(key)).toThrowError(Error)
      })
    })

    describe('должен создать адрес', function () {
      it('с префиксом "umi" если вызван без параметров', function () {
        const exp = new Uint8Array(34)
        exp[0] = 85
        exp[1] = 169

        const act = new Address()

        expect(act.bytes).toEqual(exp)
        expect(act.prefix).toEqual('umi')
      })

      it('с префиксом "genesis" если передать 34 нуля', function () {
        const exp = new Uint8Array(34)
        const act = new Address(exp)

        expect(act.bytes).toEqual(exp)
        expect(act.prefix).toBe('genesis')
      })
    })
  })

  describe('функция fromBech32 должна', function () {
    describe('вернуть ошибку если передать', function () {
      for (const prm of [null, new Uint8Array(1), 1, 0.123, [], {}, NaN]) {
        it('что-то отличное от string', function () {
          expect(() => Address.fromBech32(prm)).toThrowError(Error)
        })
      }

      it('валидный, но слишком короткий bech32 адрес', function () {
        const adr = 'umi1qqqqk43xnq'
        expect(() => Address.fromBech32(adr)).toThrowError(Error)
      })

      it('валидный, но слишком длинный bech32 адрес', function () {
        const adr = 'umi1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq63dha7'
        expect(() => Address.fromBech32(adr)).toThrowError(Error)
      })

      it('невалидный bech32 адрес', function () {
        const adr = 'umi1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqr5zcpq'
        expect(() => Address.fromBech32(adr)).toThrowError(Error)
      })
    })

    describe('создать адрес если передан', function () {
      it('корректный bech32 адрес', function () {
        const adr = 'aaa1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq48c9jj'
        const act = Address.fromBech32(adr)

        expect(act.prefix).toBe('aaa')
        expect(act.publicKey.bytes).toEqual(new Uint8Array(32))
      })
    })
  })

  describe('функция fromKey должна', function () {
    describe('вернуть ошибку если передать', function () {
      for (const prm of [null, new Uint8Array(1), 1, 0.123, [], {}, NaN]) {
        it('что-то отличное от PublicKey или PrivateKey', function () {
          expect(() => Address.fromKey(prm)).toThrowError(Error)
        })
      }
    })

    describe('создать адрес если передан', function () {
      it('PublicKey', function () {
        const key = new Uint8Array(32)
        const pubKey = new PublicKey(key)
        const act = Address.fromKey(pubKey)

        expect(act.prefix).toBe('umi')
        expect(act.publicKey.bytes).toEqual(key)
      })

      it('SecretKey', function () {
        const adr = 'umi18d4z00xwk6jz6c4r4rgz5mcdwdjny9thrh3y8f36cpy2rz6emg5s6rxnf6'
        const seed = new Uint8Array(32)
        const secKey = SecretKey.fromSeed(seed)
        const act = Address.fromKey(secKey)

        expect(act.bech32).toBe(adr)
      })
    })
  })

  describe('функция setPublicKey должна', function () {
    describe('вернуть ошибку если передать', function () {
      for (const prm of [null, new Uint8Array(1), 1, 0.123, [], {}, NaN]) {
        it('что-то отличное от PublicKey', function () {
          const adr = new Address()
          expect(() => adr.setPublicKey(prm)).toThrowError(Error)
          expect(() => { adr.publicKey = prm }).toThrowError(Error)
        })
      }
    })
  })

  describe('функция setVersion должна', function () {
    describe('вернуть ошибку если передать', function () {
      for (const prm of [null, new Uint8Array(1), 0.123, -1, [], {}, NaN]) {
        it('что-то отличное от положительного integer number', function () {
          const adr = new Address()
          expect(() => adr.setVersion(prm)).toThrowError(Error)
          expect(() => { adr.version = prm }).toThrowError(Error)
        })
      }

      it('некорректную версию', function () {
        const adr = new Address()
        expect(() => adr.setVersion(65534)).toThrowError(Error)
        expect(() => { adr.version = 65534 }).toThrowError(Error)
      })
    })
  })

  describe('функция setPrefix должна', function () {
    describe('вернуть ошибку если передать', function () {
      for (const prm of [null, new Uint8Array(1), -1, 42, 0.123, [], {}, NaN, 'Abc', 'aBc', 'aaaa', 'abC', 'ABC']) {
        it('что-то отличное от корректной string', function () {
          const adr = new Address()
          expect(() => adr.setPrefix(prm)).toThrowError(Error)
          expect(() => { adr.prefix = prm }).toThrowError(Error)
        })
      }
    })
  })
})
