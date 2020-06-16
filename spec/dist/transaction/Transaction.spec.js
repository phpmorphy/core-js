// const crypto = require('crypto')
const { Transaction, Address, SecretKey } = require('../../../lib')

describe('Transaction', function () {

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

  describe('поле version должно', function () {
    describe('возвращять ошибку если', function () {
      it('не установлена версия', function () {
        const tx = new Transaction()
        expect(() => tx.version).toThrowError(Error)
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

  describe('поле sender должно', function () {
    describe('возвращять ошибку если', function () {
      it('не установлена версия', function () {
        const tx = new Transaction()
        expect(() => tx.sender).toThrowError(Error)
      })

      for (const ver of [0, 1, 2, 3, 4, 5, 6, 7]) {
        it('sender не установлен', function () {
          const tx = new Transaction().setVersion(ver)
          expect(() => tx.sender).toThrowError(Error)
        })
      }
    })
  })

  describe('функция setSender должна', function () {
    describe('возвращять ошибку если', function () {
      it('не установлена версия', function () {
        const tx = new Transaction()
        const adr = new Address()
        expect(() => tx.setSender(adr)).toThrowError(Error)
      })

      it('передан не genesis-адрес для genesis-транзакции', function () {
        const tx = new Transaction().setVersion(Transaction.Genesis)
        const adr = new Address().setPrefix('umi')
        expect(() => tx.setSender(adr)).toThrowError(Error)
      })

      it('передан genesis-адрес для не genesis-транзакции', function () {
        const tx = new Transaction().setVersion(Transaction.Basic)
        const adr = new Address().setPrefix('genesis')
        expect(() => tx.setSender(adr)).toThrowError(Error)
      })

      for (const prm of [null, '', 0, 1, 0.1, [], {}, NaN, new Uint8Array(1)]) {
        it('передано что-то отличное от Address', function () {
          const tx = new Transaction().setVersion(Transaction.Basic)
          expect(() => tx.setSender(prm)).toThrowError(Error)
          expect(() => { tx.sender = prm }).toThrowError(Error)
        })
      }
    })
  })

  describe('поле recipient должно', function () {
    describe('возвращять ошибку если', function () {
      it('не установлена версия', function () {
        const tx = new Transaction()
        expect(() => tx.recipient).toThrowError(Error)
      })

      for (const ver of [0, 1, 4, 5, 6, 7]) {
        it('recipient не установлен', function () {
          const tx = new Transaction().setVersion(ver)
          expect(() => tx.recipient).toThrowError(Error)
        })
      }

      for (const ver of [2, 3]) {
        it('транзакция имеет несоответсвующий тип', function () {
          const tx = new Transaction().setVersion(ver)
          expect(() => tx.recipient).toThrowError(Error)
        })
      }
    })
  })

  describe('функция setRecipient должна', function () {
    describe('возвращять ошибку если', function () {
      it('не установлена версия', function () {
        const tx = new Transaction()
        const adr = new Address()
        expect(() => tx.setRecipient(adr)).toThrowError(Error)
      })

      it('транзакция имеет тип CreateStructure', function () {
        const tx = new Transaction().setVersion(Transaction.CreateStructure)
        const adr = new Address().setPrefix('umi')
        expect(() => tx.setRecipient(adr)).toThrowError(Error)
      })

      it('транзакция имеет тип UpdateStructure', function () {
        const tx = new Transaction().setVersion(Transaction.UpdateStructure)
        const adr = new Address().setPrefix('umi')
        expect(() => tx.setRecipient(adr)).toThrowError(Error)
      })

      it('передан genesis-адрес', function () {
        const tx = new Transaction().setVersion(Transaction.Basic)
        const adr = new Address().setPrefix('genesis')
        expect(() => tx.setRecipient(adr)).toThrowError(Error)
      })

      for (const prm of [null, '', 0, 1, -1, 0.123, [], {}, NaN, Infinity]) {
        it('передано что-то отличное от Address', function () {
          const tx = new Transaction()
          expect(() => tx.setRecipient(prm)).toThrowError(Error)
          expect(() => { tx.recipient = prm }).toThrowError(Error)
        })
      }
    })
  })

  describe('поле value должно', function () {
    describe('возвращять ошибку если', function () {
      it('не установлена версия', function () {
        const tx = new Transaction()
        expect(() => tx.value).toThrowError(Error)
      })

      for (const ver of [0, 1]) {
        it('value не установлен', function () {
          const tx = new Transaction().setVersion(ver)
          expect(() => tx.value).toThrowError(Error)
        })
      }

      for (const ver of [2, 3, 4, 5, 6, 7]) {
        it('транзакция имеет несоответсвующий тип', function () {
          const tx = new Transaction().setVersion(ver)
          expect(() => tx.value).toThrowError(Error)
        })
      }
    })
  })

  describe('функция setValue должна', function () {
    describe('возвращять ошибку если', function () {
      it('не установлена версия', function () {
        const tx = new Transaction()
        const adr = new Address()
        expect(() => tx.setValue(adr)).toThrowError(Error)
      })

      for (let ver = 2; ver < 8; ver++) {
        it('транзакция имеет тип не Genesis и не Basic', function () {
          const tx = new Transaction().setVersion(ver)
          expect(() => tx.setValue(1)).toThrowError(Error)
        })
      }

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

  describe('поле prefix должно', function () {
    describe('возвращять ошибку если', function () {
      it('не установлена версия', function () {
        const tx = new Transaction()
        expect(() => tx.prefix).toThrowError(Error)
      })

      for (const ver of [2, 3]) {
        it('prefix не установлен', function () {
          const tx = new Transaction().setVersion(ver)
          expect(() => tx.prefix).toThrowError(Error)
        })
      }

      for (const ver of [0, 1, 4, 5, 6, 7]) {
        it('транзакция имеет несоответсвующий тип', function () {
          const tx = new Transaction().setVersion(ver)
          expect(() => tx.prefix).toThrowError(Error)
        })
      }
    })
  })

  describe('функция setPrefix должна', function () {
    describe('возвращять ошибку если', function () {
      it('не установлена версия', function () {
        const tx = new Transaction()
        expect(() => tx.setPrefix('aaa')).toThrowError(Error)
      })

      for (const ver of [0, 1, 4, 5, 6, 7]) {
        it('транзакция имеет несоответсвующий тип', function () {
          const tx = new Transaction().setVersion(ver)
          expect(() => tx.setPrefix('aaa')).toThrowError(Error)
        })
      }

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

  describe('поле name должно', function () {
    describe('возвращять ошибку если', function () {
      it('не установлена версия', function () {
        const tx = new Transaction()
        expect(() => tx.name).toThrowError(Error)
      })

      for (const ver of [2, 3]) {
        it('name не установлен', function () {
          const tx = new Transaction().setVersion(ver)
          expect(() => tx.name).toThrowError(Error)
        })
      }

      for (const ver of [0, 1, 4, 5, 6, 7]) {
        it('транзакция имеет несоответсвующий тип', function () {
          const tx = new Transaction().setVersion(ver)
          expect(() => tx.name).toThrowError(Error)
        })
      }
    })
  })

  describe('функция setName должна', function () {
    describe('возвращять ошибку если', function () {
      it('не установлена версия', function () {
        const tx = new Transaction()
        expect(() => tx.setName('a')).toThrowError(Error)
      })

      for (const ver of [0, 1, 4, 5, 6, 7]) {
        it('транзакция имеет несоответсвующий тип', function () {
          const tx = new Transaction().setVersion(ver)
          expect(() => tx.setName('a')).toThrowError(Error)
        })
      }

      for (const prm of [null, 0, -1, 0.1, [], {}, NaN, new Uint8Array(1)]) {
        it('передано что-то отличное от string', function () {
          const tx = new Transaction()
          expect(() => tx.setName(prm)).toThrowError(Error)
          expect(() => { tx.name = prm }).toThrowError(Error)
        })
      }
    })
  })

  describe('поле profitPercent должно', function () {
    describe('возвращять ошибку если', function () {
      it('не установлена версия', function () {
        const tx = new Transaction()
        expect(() => tx.profitPercent).toThrowError(Error)
      })

      for (const ver of [2, 3]) {
        it('profitPercent не установлен', function () {
          const tx = new Transaction().setVersion(ver)
          expect(() => tx.profitPercent).toThrowError(Error)
        })
      }

      for (const ver of [0, 1, 4, 5, 6, 7]) {
        it('транзакция имеет несоответсвующий тип', function () {
          const tx = new Transaction().setVersion(ver)
          expect(() => tx.profitPercent).toThrowError(Error)
        })
      }
    })
  })

  describe('функция setProfitPercent должна', function () {
    describe('возвращять ошибку если', function () {
      it('не установлена версия', function () {
        const tx = new Transaction()
        expect(() => tx.setProfitPercent(100)).toThrowError(Error)
      })

      for (const ver of [0, 1, 4, 5, 6, 7]) {
        it('транзакция имеет несоответсвующий тип', function () {
          const tx = new Transaction().setVersion(ver)
          expect(() => tx.setProfitPercent(100)).toThrowError(Error)
        })
      }

      for (const prm of [null, '', 0, -1, 99, 501, 0.1, {}, NaN, Infinity]) {
        it('передано некорректое значения (от 100 до 500)', function () {
          const tx = new Transaction()
          expect(() => tx.setProfitPercent(prm)).toThrowError(Error)
          expect(() => { tx.profitPercent = prm }).toThrowError(Error)
        })
      }
    })
  })

  describe('поле feePercent должно', function () {
    describe('возвращять ошибку если', function () {
      it('не установлена версия', function () {
        const tx = new Transaction()
        expect(() => tx.feePercent).toThrowError(Error)
      })

      for (const ver of [2, 3]) {
        it('feePercent не установлен', function () {
          const tx = new Transaction().setVersion(ver)
          expect(() => tx.feePercent).toThrowError(Error)
        })
      }

      for (const ver of [0, 1, 4, 5, 6, 7]) {
        it('транзакция имеет несоответсвующий тип', function () {
          const tx = new Transaction().setVersion(ver)
          expect(() => tx.feePercent).toThrowError(Error)
        })
      }
    })
  })

  describe('функция setFeePercent должна', function () {
    describe('возвращять ошибку если', function () {
      it('не установлена версия', function () {
        const tx = new Transaction()
        expect(() => tx.setFeePercent(1)).toThrowError(Error)
      })

      for (const ver of [0, 1, 4, 5, 6, 7]) {
        it('транзакция имеет несоответсвующий тип', function () {
          const tx = new Transaction().setVersion(ver)
          expect(() => tx.setFeePercent(1)).toThrowError(Error)
        })
      }

      for (const prm of [null, '', -1, 2001, 0.1, {}, NaN, Infinity]) {
        it('передано некорректное значение (от 0 до 2000)', function () {
          const tx = new Transaction()
          expect(() => tx.setFeePercent(prm)).toThrowError(Error)
          expect(() => { tx.feePercent = prm }).toThrowError(Error)
        })
      }
    })
  })

  describe('поле nonce должно', function () {
    describe('возвращять ошибку если', function () {
      it('не установлена версия', function () {
        const tx = new Transaction()
        expect(() => tx.nonce).toThrowError(Error)
      })

      for (const ver of [1, 2, 3, 4, 5, 6, 7]) {
        it('nonce не установлен', function () {
          const tx = new Transaction().setVersion(ver)
          expect(() => tx.nonce).toThrowError(Error)
        })
      }
    })
  })

  describe('функция setNonce должна', function () {
    describe('возвращять ошибку если', function () {
      it('не установлена версия', function () {
        const tx = new Transaction()
        expect(() => tx.setNonce(1)).toThrowError(Error)
      })

      for (const prm of [null, '', -1, 0.1, [], {}, NaN, Infinity]) {
        it('передано некорректное значение', function () {
          const tx = new Transaction()
          expect(() => tx.setNonce(prm)).toThrowError(Error)
          expect(() => { tx.nonce = prm }).toThrowError(Error)
        })
      }
    })
  })

  describe('поле signature должно', function () {
    describe('возвращять ошибку если', function () {
      it('не установлена версия', function () {
        const tx = new Transaction()
        expect(() => tx.signature).toThrowError(Error)
      })

      for (const ver of [1, 2, 3, 4, 5, 6, 7]) {
        it('signature не установлен', function () {
          const tx = new Transaction().setVersion(ver)
          expect(() => tx.signature).toThrowError(Error)
        })
      }
    })
  })

  describe('функция setSignature должна', function () {
    describe('возвращять ошибку если', function () {
      it('не установлена версия', function () {
        const tx = new Transaction()
        expect(() => tx.setSignature(new Uint8Array(64))).toThrowError(Error)
      })

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
      it('не установлена версия', function () {
        const tx = new Transaction()
        const key = SecretKey.fromSeed(new Uint8Array(32))
        expect(() => tx.sign(key)).toThrowError(Error)
      })

      for (const prm of [null, '', 0, 1, -1, 0.1, {}, NaN, new Uint8Array(1)]) {
        it('передано что-то отличное от SecretKey', function () {
          const tx = new Transaction()
          expect(() => tx.sign(prm)).toThrowError(Error)
        })
      }
    })
  })
})
