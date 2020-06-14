/* eslint-disable no-undef */

// const crypto = require('crypto')
const { Transaction } = require('../../../lib')

describe('Transaction', function () {
  it('проверяем, что класс существует', function () {
    expect(Transaction).toBeDefined()
  })

  describe('конструктор', function () {
    describe('должен возвращять ошибку если', function () {
      for (const prm of [null, '', 1, 0.123, [], {}, NaN]) {
        it('передан не Uint8Array', function () {
          expect(() => new Transaction(prm)).toThrowError(Error)
        })
      }

      it('транзакция короче чем 150 байта', function () {
        const trx = new Uint8Array(149)
        expect(() => new Transaction(trx)).toThrowError(Error)
      })

      it('транзакция длиньше чем 150 байта', function () {
        const trx = new Uint8Array(151)
        expect(() => new Transaction(trx)).toThrowError(Error)
      })
    })
  })

  describe('функция setVersion должна', function () {
    describe('возвращять ошибку если', function () {
      for (const prm of [null, '', 0.1, [], {}, NaN, Infinity]) {
        it('передан не number', function () {
          const tx = new Transaction()
          expect(() => tx.setVersion(prm)).toThrowError(Error)
        })
      }

      it('передана некорректная версия', function () {
        for (const prm of [-1, 10]) {
          const tx = new Transaction()
          expect(() => tx.setVersion(prm)).toThrowError(Error)
        }
      })
    })
  })

  describe('функция setSender должна', function () {
    describe('возвращять ошибку если', function () {
      for (const prm of [null, '', 0, 1, 0.1, [], {}, NaN, new Uint8Array(1)]) {
        it('передано что-то отличное от Address', function () {
          const tx = new Transaction()
          expect(() => tx.setSender(prm)).toThrowError(Error)
          expect(() => { tx.sender = prm }).toThrowError(Error)
        })
      }
    })
  })

  describe('функция setRecipient должна', function () {
    describe('возвращять ошибку если', function () {
      for (const prm of [null, '', 0, 1, -1, 0.123, [], {}, NaN, Infinity]) {
        it('передано что-то отличное от Address', function () {
          const tx = new Transaction()
          expect(() => tx.setRecipient(prm)).toThrowError(Error)
          expect(() => { tx.recipient = prm }).toThrowError(Error)
        })
      }
    })
  })

  describe('функция setValue должна', function () {
    describe('возвращять ошибку если', function () {
      for (const prm of [null, '', 0, -1, 0.1, {}, NaN, 9007199254740992]) {
        it('передано что-то отличное от положительного integer number',
          function () {
            const tx = new Transaction()
            expect(() => tx.setValue(prm)).toThrowError(Error)
            expect(() => { tx.value = prm }).toThrowError(Error)
          })
      }
    })
  })

  describe('функция setPrefix должна', function () {
    describe('возвращять ошибку если', function () {
      for (const prm of [null, 0, 0.1, [], {}, NaN, Infinity]) {
        it('передано что-то отличное от string', function () {
          const tx = new Transaction()
          expect(() => tx.setPrefix(prm)).toThrowError(Error)
          expect(() => { tx.prefix = prm }).toThrowError(Error)
        })
      }

      for (const prm of ['', 'a', 'ab', 'Abc', 'aBc', 'abC', 'ABC', 'abcd']) {
        it('передан невалидный префикс', function () {
          const tx = new Transaction()
          expect(() => tx.setPrefix(prm)).toThrowError(Error)
          expect(() => { tx.prefix = prm }).toThrowError(Error)
        })
      }
    })
  })

  describe('функция setName должна', function () {
    describe('возвращять ошибку если', function () {
      for (const prm of [null, 0, -1, 0.1, [], {}, NaN, new Uint8Array(1)]) {
        it('передано что-то отличное от string', function () {
          const tx = new Transaction()
          expect(() => tx.setName(prm)).toThrowError(Error)
          expect(() => { tx.name = prm }).toThrowError(Error)
        })
      }
    })
  })

  describe('функция setProfitPercent должна', function () {
    describe('возвращять ошибку если', function () {
      for (const prm of [null, '', 0, -1, 99, 501, 0.1, {}, NaN, Infinity]) {
        it('передано что-то отличное от корректного значения (от 100 до 500)',
          function () {
            const tx = new Transaction()
            expect(() => tx.setProfitPercent(prm)).toThrowError(Error)
            expect(() => { tx.profitPercent = prm }).toThrowError(Error)
          })
      }
    })
  })

  describe('функция setFeePercent должна', function () {
    describe('возвращять ошибку если', function () {
      for (const prm of [null, '', -1, 2001, 0.1, {}, NaN, Infinity]) {
        it('передано что-то отличное от корректного значения (от 0 до 2000)',
          function () {
            const tx = new Transaction()
            expect(() => tx.setFeePercent(prm)).toThrowError(Error)
            expect(() => { tx.feePercent = prm }).toThrowError(Error)
          })
      }
    })
  })

  describe('функция setNonce должна', function () {
    describe('возвращять ошибку если', function () {
      for (const prm of [null, '', -1, 0.1, [], {}, NaN, Infinity]) {
        it('передано что-то отличное от положительного integer number',
          function () {
            const tx = new Transaction()
            expect(() => tx.setNonce(prm)).toThrowError(Error)
            expect(() => { tx.nonce = prm }).toThrowError(Error)
          })
      }
    })
  })

  describe('функция setSignature должна', function () {
    describe('возвращять ошибку если', function () {
      for (const prm of [null, '', 1, 0.1, [], {}, NaN, new ArrayBuffer(0)]) {
        it('передан не Uint8Array', function () {
          const tx = new Transaction()
          expect(() => tx.setSignature(prm)).toThrowError(Error)
          expect(() => { tx.signature = prm }).toThrowError(Error)
        })
      }

      it('подпись короче чем 64 байта', function () {
        const sig = new Uint8Array(63)
        const tx = new Transaction()
        expect(() => tx.setSignature(sig)).toThrowError(Error)
        expect(() => { tx.signature = sig }).toThrowError(Error)
      })

      it('подпись длиньше чем 64 байта', function () {
        const sig = new Uint8Array(65)
        const tx = new Transaction()
        expect(() => tx.setSignature(sig)).toThrowError(Error)
        expect(() => { tx.signature = sig }).toThrowError(Error)
      })
    })
  })

  describe('функция sign должна', function () {
    describe('возвращять ошибку если', function () {
      for (const prm of [null, '', 0, 1, -1, 0.1, {}, NaN, new Uint8Array(1)]) {
        it('передано что-то отличное от SecretKey', function () {
          const tx = new Transaction()
          expect(() => tx.sign(prm)).toThrowError(Error)
        })
      }
    })
  })
})
