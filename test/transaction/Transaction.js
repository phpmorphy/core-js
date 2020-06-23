if (typeof window === 'undefined') {
  var umi = require('../../')
  var assert = require('chai').assert
}

describe('Transaction', function () {
  describe('константы', function () {
    const tests = [
      { args: 'LENGTH', expected: 150 },
      { args: 'Genesis', expected: 0 },
      { args: 'Basic', expected: 1 },
      { args: 'CreateStructure', expected: 2 },
      { args: 'UpdateStructure', expected: 3 },
      { args: 'UpdateProfitAddress', expected: 4 },
      { args: 'UpdateFeeAddress', expected: 5 },
      { args: 'CreateTransitAddress', expected: 6 },
      { args: 'DeleteTransitAddress', expected: 7 }
    ]

    tests.forEach(function (test) {
      it(test.args, function () {
        const actual = umi.Transaction[test.args]
        assert.strictEqual(actual, test.expected)
      })
    })
  })

  describe('new Transaction()', function () {
    describe('возвращяет ошибку если передать', function () {
      const len = umi.Transaction.LENGTH
      const tests = [
        { desc: 'число', args: len },
        { desc: 'строку', args: 'a'.repeat(len) },
        { desc: 'массив', args: new Array(len) },
        { desc: 'объект', args: { a: 'b' } },
        { desc: 'ArrayBuffer', args: new ArrayBuffer(len) },
        { desc: 'DataView', args: new DataView(new ArrayBuffer(len)) },
        { desc: 'слишком короткий Uint8Array', args: new Uint8Array(len - 1) },
        { desc: 'слишком длинный Uint8Array', args: new Uint8Array(len + 2) }
      ]

      tests.forEach(function (test) {
        it(test.desc, function () {
          assert.throws(() => new umi.Transaction(test.args), Error)
        })
      })
    })

    describe('создает транзакцию', function () {
      it('если вызвать без параметров', function () {
        assert.doesNotThrow(() => new umi.Transaction())
      })

      it('передать Uint8Array длиной 150 байт', function () {
        assert.doesNotThrow(() => new umi.Transaction(new Uint8Array(150)))
      })
    })
  })

  describe('hash', function () {
    it('возвращяет Uint8Array длиной 150 байта', function () {
      const expected = new Uint8Array(150)
      const actual = new umi.Transaction().bytes

      assert.deepEqual(actual, expected)
    })
  })

  xdescribe('bytes', function () {
    it('возвращяет корректный хэш', function () {
      if (typeof window !== 'undefined') {
        this.skip()
      }

      const expected = umi.sha256(new Uint8Array(150))
      const actual = new umi.Transaction().hash

      assert.deepEqual(actual, expected)
    })
  })

  describe('version', function () {
    describe('возвращяет ошибку если', function () {
      it('запросить значение не установив его перед этим', function () {
        const tx = new umi.Transaction()
        assert.throws(() => { tx.version }, Error) // eslint-disable-line
      })

      it('попытаться изменить уже установленное версию', function () {
        const tx = new umi.Transaction().setVersion(umi.Transaction.Basic)
        assert.throws(() => { tx.version = umi.Transaction.Genesis }, Error)
      })
    })

    describe('возвращяет ошибку если передать', function () {
      const tests = [
        { desc: 'строку', args: 'a' },
        { desc: 'массив', args: [1, 2] },
        { desc: 'объект', args: { a: 'b' } },
        { desc: 'Uint8Array', args: new Uint8Array(1) },
        { desc: 'ArrayBuffer', args: new ArrayBuffer(1) },
        { desc: 'DataView', args: new DataView(new ArrayBuffer(1)) },
        { desc: 'NaN', args: NaN },
        { desc: 'Infinity', args: Infinity },
        { desc: 'float', args: 0.13 },
        { desc: 'неподдерживаемую версию', args: 10 }
      ]

      tests.forEach(function (test) {
        it(test.desc, function () {
          const tx = new umi.Transaction()
          assert.throws(() => tx.setVersion(test.args), Error)
        })
      })
    })

    describe('устанавливает версию если передать', function () {
      it('поддерживаемую версию', function () {
        const tx = new umi.Transaction()
        const expected = umi.Transaction.Basic
        const actual = tx.setVersion(expected).version
        assert.strictEqual(actual, expected)
      })
    })
  })

  describe('sender', function () {
    describe('возвращяет ошибку если', function () {
      it('запросить отправителя не установив версию', function () {
        const tx = new umi.Transaction()
        assert.throws(() => { tx.sender }, Error) // eslint-disable-line
      })

      it('установить отправителя не установив версию', function () {
        const tx = new umi.Transaction()
        const sender = new umi.Address().setVersion(umi.Address.Umi)
        assert.throws(() => { tx.sender = sender }, Error) // eslint-disable-line
      })

      it('запросить отправителя не установив его перед этим', function () {
        const tx = new umi.Transaction().setVersion(umi.Transaction.Genesis)
        assert.throws(() => { tx.sender }, Error) // eslint-disable-line
      })

      it('передать genesis адрес в basic транзакцию', function () {
        const tx = new umi.Transaction().setVersion(umi.Transaction.Basic)
        const sender = new umi.Address().setVersion(umi.Address.Genesis)
        assert.throws(() => { tx.sender = sender }, Error)
      })

      it('передать не genesis адрес в genesis транзакцию', function () {
        const tx = new umi.Transaction().setVersion(umi.Transaction.Genesis)
        const sender = new umi.Address().setVersion(umi.Address.Umi)
        assert.throws(() => { tx.sender = sender }, Error)
      })
    })

    describe('возвращяет ошибку если передать', function () {
      const tests = [
        { desc: 'строку', args: 'a' },
        { desc: 'массив', args: [1, 2] },
        { desc: 'объект', args: { a: 'b' } },
        { desc: 'Uint8Array', args: new Uint8Array(1) },
        { desc: 'ArrayBuffer', args: new ArrayBuffer(1) },
        { desc: 'DataView', args: new DataView(new ArrayBuffer(1)) },
        { desc: 'NaN', args: NaN },
        { desc: 'Infinity', args: Infinity },
        { desc: 'float', args: 0.13 },
        { desc: 'неподдерживаемую версию', args: 10 }
      ]

      tests.forEach(function (test) {
        it(test.desc, function () {
          const tx = new umi.Transaction().setVersion(umi.Transaction.Basic)
          assert.throws(() => tx.setSender(test.args), Error)
        })
      })
    })

    describe('устанавливает отправителя если установить', function () {
      it('genesis версию и передать genesis адрес', function () {
        const tx = new umi.Transaction().setVersion(umi.Transaction.Genesis)
        const expected = new umi.Address().setVersion(umi.Address.Genesis)
        const actual = tx.setSender(expected).sender
        assert.deepEqual(actual, expected)
      })

      it('basic версию и передать umi адрес', function () {
        const tx = new umi.Transaction().setVersion(umi.Transaction.Basic)
        const expected = new umi.Address().setVersion(umi.Address.Umi)
        const actual = tx.setSender(expected).sender
        assert.deepEqual(actual, expected)
      })
    })
  })

  describe('recipient', function () {
    describe('возвращяет ошибку если', function () {
      describe('передать', function () {
        const tests = [
          { desc: 'строку', args: 'a' },
          { desc: 'массив', args: [1, 2] },
          { desc: 'объект', args: { a: 'b' } },
          { desc: 'Uint8Array', args: new Uint8Array(1) },
          { desc: 'ArrayBuffer', args: new ArrayBuffer(1) },
          { desc: 'DataView', args: new DataView(new ArrayBuffer(1)) },
          { desc: 'NaN', args: NaN },
          { desc: 'Infinity', args: Infinity },
          { desc: 'float', args: 0.13 }
        ]

        tests.forEach(function (test) {
          it(test.desc, function () {
            const tx = new umi.Transaction().setVersion(umi.Transaction.Basic)
            assert.throws(() => tx.setRecipient(test.args), Error)
          })
        })
      })

      it('запросить получателя не установив версию', function () {
        const tx = new umi.Transaction()
        assert.throws(() => { tx.recipient }, Error) // eslint-disable-line
      })

      it('установить получателя не установив версию', function () {
        const tx = new umi.Transaction()
        const recipient = new umi.Address().setVersion(umi.Address.Umi)
        assert.throws(() => { tx.recipient = recipient }, Error) // eslint-disable-line
      })

      it('запросить получателя не установив его перед этим', function () {
        const tx = new umi.Transaction().setVersion(umi.Transaction.Genesis)
        assert.throws(() => { tx.recipient }, Error) // eslint-disable-line
      })

      it('передать genesis адрес в basic транзакцию', function () {
        const tx = new umi.Transaction().setVersion(umi.Transaction.Basic)
        const recipient = new umi.Address().setVersion(umi.Address.Genesis)
        assert.throws(() => { tx.recipient = recipient }, Error)
      })

      it('передать не umi адрес в genesis транзакцию', function () {
        const tx = new umi.Transaction().setVersion(umi.Transaction.Genesis)
        const recipient = new umi.Address().setPrefix('aaa')
        assert.throws(() => { tx.recipient = recipient }, Error)
      })

      describe('версия транзакции равна', function () {
        const tests = [
          { desc: 'CreateStructure', args: umi.Transaction.CreateStructure },
          { desc: 'UpdateStructure', args: umi.Transaction.UpdateStructure }
        ]

        tests.forEach(function (test) {
          it(test.desc + ' (set)', function () {
            const tx = new umi.Transaction().setVersion(test.args)
            const recipient = new umi.Address().setVersion(umi.Address.Umi)
            assert.throws(() => { tx.recipient = recipient }, Error)
          })
        })

        tests.forEach(function (test) {
          it(test.desc + ' (get)', function () {
            const tx = new umi.Transaction().setVersion(test.args)
            assert.throws(() => { tx.recipient }, Error) // eslint-disable-line
          })
        })
      })

      describe('передать umi адрес в транзакцию типа', function () {
        const tests = [
          {
            desc: 'UpdateProfitAddress',
            args: umi.Transaction.UpdateProfitAddress
          },
          { desc: 'UpdateFeeAddress', args: umi.Transaction.UpdateFeeAddress },
          {
            desc: 'CreateTransitAddress',
            args: umi.Transaction.CreateTransitAddress
          },
          {
            desc: 'DeleteTransitAddress',
            args: umi.Transaction.DeleteTransitAddress
          }
        ]

        tests.forEach(function (test) {
          it(test.desc, function () {
            const tx = new umi.Transaction().setVersion(test.args)
            const recipient = new umi.Address().setVersion(umi.Address.Umi)
            assert.throws(() => { tx.recipient = recipient }, Error)
          })
        })
      })
    })

    describe('устанавливает получателя если передать', function () {
      it('umi адрес в genesis транзакцию', function () {
        const tx = new umi.Transaction().setVersion(umi.Transaction.Genesis)
        const expected = new umi.Address().setVersion(umi.Address.Umi)
        const actual = tx.setRecipient(expected).recipient
        assert.deepEqual(actual, expected)
      })

      describe('структурный адрес в транзакцию типа', function () {
        const tests = [
          { desc: 'Basic', args: umi.Transaction.Basic },
          {
            desc: 'UpdateProfitAddress',
            args: umi.Transaction.UpdateProfitAddress
          },
          { desc: 'UpdateFeeAddress', args: umi.Transaction.UpdateFeeAddress },
          {
            desc: 'CreateTransitAddress',
            args: umi.Transaction.CreateTransitAddress
          },
          {
            desc: 'DeleteTransitAddress',
            args: umi.Transaction.DeleteTransitAddress
          }
        ]

        tests.forEach(function (test) {
          it(test.desc, function () {
            const tx = new umi.Transaction().setVersion(test.args)
            const expected = new umi.Address().setPrefix('zzz')
            const actual = tx.setRecipient(expected).recipient
            assert.deepEqual(actual, expected)
          })
        })
      })
    })
  })

  describe('value', function () {
    describe('возвращяет ошибку если', function () {
      describe('передать', function () {
        const tests = [
          { desc: 'строку', args: 'a' },
          { desc: 'массив', args: [1, 2] },
          { desc: 'объект', args: { a: 'b' } },
          { desc: 'Uint8Array', args: new Uint8Array(1) },
          { desc: 'ArrayBuffer', args: new ArrayBuffer(1) },
          { desc: 'DataView', args: new DataView(new ArrayBuffer(1)) },
          { desc: 'NaN', args: NaN },
          { desc: 'Infinity', args: Infinity },
          { desc: 'float', args: 0.13 },
          { desc: '0', args: 0 }
        ]

        tests.forEach(function (test) {
          it(test.desc, function () {
            const tx = new umi.Transaction().setVersion(umi.Transaction.Basic)
            assert.throws(() => tx.setValue(test.args), Error)
          })
        })
      })

      it('запросить сумму не установив версию', function () {
        const tx = new umi.Transaction()
        assert.throws(() => { tx.value }, Error) // eslint-disable-line
      })

      it('установить сумму не установив версию', function () {
        const tx = new umi.Transaction()
        assert.throws(() => { tx.value = 42 }, Error) // eslint-disable-line
      })

      it('запросить сумму не установив ее перед этим', function () {
        const tx = new umi.Transaction().setVersion(umi.Transaction.Genesis)
        assert.throws(() => { tx.value }, Error) // eslint-disable-line
      })

      describe('версия транзакции равна', function () {
        const tests = [
          { desc: 'CreateStructure', args: umi.Transaction.CreateStructure },
          { desc: 'UpdateStructure', args: umi.Transaction.UpdateStructure },
          {
            desc: 'UpdateProfitAddress',
            args: umi.Transaction.UpdateProfitAddress
          },
          { desc: 'UpdateFeeAddress', args: umi.Transaction.UpdateFeeAddress },
          {
            desc: 'CreateTransitAddress',
            args: umi.Transaction.CreateTransitAddress
          },
          {
            desc: 'DeleteTransitAddress',
            args: umi.Transaction.DeleteTransitAddress
          }
        ]

        tests.forEach(function (test) {
          it(test.desc + ' (set)', function () {
            const tx = new umi.Transaction().setVersion(test.args)
            assert.throws(() => { tx.value = 42 }, Error)
          })
        })

        tests.forEach(function (test) {
          it(test.desc + ' (get)', function () {
            const tx = new umi.Transaction().setVersion(test.args)
            assert.throws(() => { tx.value }, Error) // eslint-disable-line
          })
        })
      })

      it('сумма больше 9007199254740991', function () {
        const tx = new umi.Transaction().setVersion(umi.Transaction.Genesis)
        tx._bytes[70] = 0x80
        tx._isValueSet = true
        assert.throws(() => { tx.value }, Error) // eslint-disable-line
      })
    })

    describe('устанавливает сумму', function () {
      describe('в транзакции типа', function () {
        const tests = [
          { desc: 'Genesis', args: umi.Transaction.Genesis },
          { desc: 'Basic', args: umi.Transaction.Basic }
        ]

        tests.forEach(function (test) {
          it(test.desc, function () {
            const tx = new umi.Transaction().setVersion(test.args)
            const expected = 9007199254740991
            const actual = tx.setValue(expected).value
            assert.strictEqual(actual, expected)
          })
        })
      })
    })
  })

  describe('prefix', function () {
    describe('возвращяет ошибку если', function () {
      it('запросить префикс не установив версию', function () {
        const tx = new umi.Transaction()
        assert.throws(() => { tx.prefix }, Error) // eslint-disable-line
      })

      it('установить префикс не установив версию', function () {
        const tx = new umi.Transaction()
        assert.throws(() => { tx.prefix = 'aaa' }, Error) // eslint-disable-line
      })

      it('запросить префикс не установив его перед этим', function () {
        const tx = new umi.Transaction().setVersion(
          umi.Transaction.CreateStructure)
        assert.throws(() => { tx.prefix }, Error) // eslint-disable-line
      })

      describe('версия транзакции равна', function () {
        const tests = [
          { desc: 'Genesis', args: umi.Transaction.Genesis },
          { desc: 'Basic', args: umi.Transaction.Basic },
          {
            desc: 'UpdateProfitAddress',
            args: umi.Transaction.UpdateProfitAddress
          },
          { desc: 'UpdateFeeAddress', args: umi.Transaction.UpdateFeeAddress },
          {
            desc: 'CreateTransitAddress',
            args: umi.Transaction.CreateTransitAddress
          },
          {
            desc: 'DeleteTransitAddress',
            args: umi.Transaction.DeleteTransitAddress
          }
        ]

        tests.forEach(function (test) {
          it(test.desc + ' (set)', function () {
            const tx = new umi.Transaction().setVersion(test.args)
            assert.throws(() => { tx.prefix = 'aaa' }, Error)
          })
        })

        tests.forEach(function (test) {
          it(test.desc + ' (get)', function () {
            const tx = new umi.Transaction().setVersion(test.args)
            assert.throws(() => { tx.prefix }, Error) // eslint-disable-line
          })
        })
      })
    })

    describe('устанавливает префикс', function () {
      describe('в транзакции типа', function () {
        const tests = [
          { desc: 'CreateStructure', args: umi.Transaction.CreateStructure },
          { desc: 'UpdateStructure', args: umi.Transaction.UpdateStructure }
        ]

        tests.forEach(function (test) {
          it(test.desc, function () {
            const tx = new umi.Transaction().setVersion(test.args)
            const expected = 'aaa'
            const actual = tx.setPrefix(expected).prefix
            assert.strictEqual(actual, expected)
          })
        })
      })
    })
  })

  describe('name', function () {
    describe('возвращяет ошибку если', function () {
      describe('передать', function () {
        const tests = [
          { desc: 'число', args: 1 },
          { desc: 'массив', args: [1, 2] },
          { desc: 'объект', args: { a: 'b' } },
          { desc: 'Uint8Array', args: new Uint8Array(1) },
          { desc: 'ArrayBuffer', args: new ArrayBuffer(1) },
          { desc: 'DataView', args: new DataView(new ArrayBuffer(1)) },
          { desc: 'NaN', args: NaN },
          { desc: 'Infinity', args: Infinity },
          { desc: 'float', args: 0.13 },
          { desc: 'строку длиннее 35 символов', args: 'a'.repeat(36) }
        ]

        tests.forEach(function (test) {
          it(test.desc, function () {
            const tx = new umi.Transaction().setVersion(
              umi.Transaction.CreateStructure)
            assert.throws(() => tx.setName(test.args), Error)
          })
        })
      })

      it('запросить название не установив версию', function () {
        const tx = new umi.Transaction()
        assert.throws(() => { tx.name }, Error) // eslint-disable-line
      })

      it('установить название не установив версию', function () {
        const tx = new umi.Transaction()
        assert.throws(() => { tx.name = 'name' }, Error) // eslint-disable-line
      })

      it('запросить название не установив его перед этим', function () {
        const tx = new umi.Transaction().setVersion(
          umi.Transaction.CreateStructure)
        assert.throws(() => { tx.name }, Error) // eslint-disable-line
      })

      describe('версия транзакции равна', function () {
        const tests = [
          { desc: 'Genesis', args: umi.Transaction.Genesis },
          { desc: 'Basic', args: umi.Transaction.Basic },
          {
            desc: 'UpdateProfitAddress',
            args: umi.Transaction.UpdateProfitAddress
          },
          { desc: 'UpdateFeeAddress', args: umi.Transaction.UpdateFeeAddress },
          {
            desc: 'CreateTransitAddress',
            args: umi.Transaction.CreateTransitAddress
          },
          {
            desc: 'DeleteTransitAddress',
            args: umi.Transaction.DeleteTransitAddress
          }
        ]

        tests.forEach(function (test) {
          it(test.desc + ' (set)', function () {
            const tx = new umi.Transaction().setVersion(test.args)
            assert.throws(() => { tx.name = 'aaa' }, Error)
          })
        })

        tests.forEach(function (test) {
          it(test.desc + ' (get)', function () {
            const tx = new umi.Transaction().setVersion(test.args)
            assert.throws(() => { tx.name }, Error) // eslint-disable-line
          })
        })
      })
    })

    describe('устанавливает название', function () {
      describe('в транзакции типа', function () {
        const tests = [
          { desc: 'CreateStructure', args: umi.Transaction.CreateStructure },
          { desc: 'UpdateStructure', args: umi.Transaction.UpdateStructure }
        ]

        tests.forEach(function (test) {
          it(test.desc, function () {
            const tx = new umi.Transaction().setVersion(test.args)
            const expected = 'aaa'
            const actual = tx.setName(expected).name
            assert.strictEqual(actual, expected)
          })
        })
      })
    })
  })

  describe('profitPercent', function () {
    describe('возвращяет ошибку если', function () {
      describe('передать', function () {
        const tests = [
          { desc: 'число меньше 100', args: 99 },
          { desc: 'число больше 500', args: 501 },
          { desc: 'массив', args: [1, 2] },
          { desc: 'объект', args: { a: 'b' } },
          { desc: 'Uint8Array', args: new Uint8Array(1) },
          { desc: 'ArrayBuffer', args: new ArrayBuffer(1) },
          { desc: 'DataView', args: new DataView(new ArrayBuffer(1)) },
          { desc: 'NaN', args: NaN },
          { desc: 'Infinity', args: Infinity },
          { desc: 'float', args: 0.13 }
        ]

        tests.forEach(function (test) {
          it(test.desc, function () {
            const tx = new umi.Transaction().setVersion(
              umi.Transaction.CreateStructure)
            assert.throws(() => tx.setProfitPercent(test.args), Error)
          })
        })
      })

      it('запросить профит не установив версию', function () {
        const tx = new umi.Transaction()
        assert.throws(() => { tx.profitPercent }, Error) // eslint-disable-line
      })

      it('установить профит не установив версию', function () {
        const tx = new umi.Transaction()
        assert.throws(() => { tx.profitPercent = 250 }, Error) // eslint-disable-line
      })

      it('запросить профит не установив его перед этим', function () {
        const tx = new umi.Transaction().setVersion(
          umi.Transaction.CreateStructure)
        assert.throws(() => { tx.profitPercent }, Error) // eslint-disable-line
      })

      describe('версия транзакции равна', function () {
        const tests = [
          { desc: 'Genesis', args: umi.Transaction.Genesis },
          { desc: 'Basic', args: umi.Transaction.Basic },
          {
            desc: 'UpdateProfitAddress',
            args: umi.Transaction.UpdateProfitAddress
          },
          { desc: 'UpdateFeeAddress', args: umi.Transaction.UpdateFeeAddress },
          {
            desc: 'CreateTransitAddress',
            args: umi.Transaction.CreateTransitAddress
          },
          {
            desc: 'DeleteTransitAddress',
            args: umi.Transaction.DeleteTransitAddress
          }
        ]

        tests.forEach(function (test) {
          it(test.desc + ' (set)', function () {
            const tx = new umi.Transaction().setVersion(test.args)
            assert.throws(() => { tx.profitPercent = 250 }, Error)
          })
        })

        tests.forEach(function (test) {
          it(test.desc + ' (get)', function () {
            const tx = new umi.Transaction().setVersion(test.args)
            assert.throws(() => { tx.profitPercent }, Error) // eslint-disable-line
          })
        })
      })
    })

    describe('устанавливает профит', function () {
      describe('в транзакции типа', function () {
        const tests = [
          { desc: 'CreateStructure', args: umi.Transaction.CreateStructure },
          { desc: 'UpdateStructure', args: umi.Transaction.UpdateStructure }
        ]

        tests.forEach(function (test) {
          it(test.desc, function () {
            const tx = new umi.Transaction().setVersion(test.args)
            const expected = 500
            const actual = tx.setProfitPercent(expected).profitPercent
            assert.strictEqual(actual, expected)
          })
        })
      })
    })
  })

  describe('feePercent', function () {
    describe('возвращяет ошибку если', function () {
      describe('передать', function () {
        const tests = [
          { desc: 'число меньше 0', args: -1 },
          { desc: 'число больше 2000', args: 2001 },
          { desc: 'массив', args: [1, 2] },
          { desc: 'объект', args: { a: 'b' } },
          { desc: 'Uint8Array', args: new Uint8Array(1) },
          { desc: 'ArrayBuffer', args: new ArrayBuffer(1) },
          { desc: 'DataView', args: new DataView(new ArrayBuffer(1)) },
          { desc: 'NaN', args: NaN },
          { desc: 'Infinity', args: Infinity },
          { desc: 'float', args: 0.13 }
        ]

        tests.forEach(function (test) {
          it(test.desc, function () {
            const tx = new umi.Transaction().setVersion(
              umi.Transaction.CreateStructure)
            assert.throws(() => tx.setFeePercent(test.args), Error)
          })
        })
      })

      it('запросить комиссию не установив версию', function () {
        const tx = new umi.Transaction()
        assert.throws(() => { tx.feePercent }, Error) // eslint-disable-line
      })

      it('установить комиссию не установив версию', function () {
        const tx = new umi.Transaction()
        assert.throws(() => { tx.feePercent = 250 }, Error) // eslint-disable-line
      })

      it('запросить комиссию не установив его перед этим', function () {
        const tx = new umi.Transaction().setVersion(
          umi.Transaction.CreateStructure)
        assert.throws(() => { tx.feePercent }, Error) // eslint-disable-line
      })

      describe('версия транзакции равна', function () {
        const tests = [
          { desc: 'Genesis', args: umi.Transaction.Genesis },
          { desc: 'Basic', args: umi.Transaction.Basic },
          {
            desc: 'UpdateProfitAddress',
            args: umi.Transaction.UpdateProfitAddress
          },
          { desc: 'UpdateFeeAddress', args: umi.Transaction.UpdateFeeAddress },
          {
            desc: 'CreateTransitAddress',
            args: umi.Transaction.CreateTransitAddress
          },
          {
            desc: 'DeleteTransitAddress',
            args: umi.Transaction.DeleteTransitAddress
          }
        ]

        tests.forEach(function (test) {
          it(test.desc + ' (set)', function () {
            const tx = new umi.Transaction().setVersion(test.args)
            assert.throws(() => { tx.feePercent = 250 }, Error)
          })
        })

        tests.forEach(function (test) {
          it(test.desc + ' (get)', function () {
            const tx = new umi.Transaction().setVersion(test.args)
            assert.throws(() => { tx.feePercent }, Error) // eslint-disable-line
          })
        })
      })
    })

    describe('устанавливает комиссию', function () {
      describe('в транзакции типа', function () {
        const tests = [
          { desc: 'CreateStructure', args: umi.Transaction.CreateStructure },
          { desc: 'UpdateStructure', args: umi.Transaction.UpdateStructure }
        ]

        tests.forEach(function (test) {
          it(test.desc, function () {
            const tx = new umi.Transaction().setVersion(test.args)
            const expected = 500
            const actual = tx.setFeePercent(expected).feePercent
            assert.strictEqual(actual, expected)
          })
        })
      })
    })
  })

  describe('nonce', function () {
    describe('возвращяет ошибку если', function () {
      describe('передать', function () {
        const tests = [
          { desc: 'число меньше 0', args: -1 },
          { desc: 'массив', args: [1, 2] },
          { desc: 'объект', args: { a: 'b' } },
          { desc: 'Uint8Array', args: new Uint8Array(1) },
          { desc: 'ArrayBuffer', args: new ArrayBuffer(1) },
          { desc: 'DataView', args: new DataView(new ArrayBuffer(1)) },
          { desc: 'NaN', args: NaN },
          { desc: 'Infinity', args: Infinity },
          { desc: 'float', args: 0.13 }
        ]

        tests.forEach(function (test) {
          it(test.desc, function () {
            const tx = new umi.Transaction()
            assert.throws(() => tx.setNonce(test.args), Error)
          })
        })
      })

      it('запросить nonce не установив его перед этим', function () {
        const tx = new umi.Transaction()
        assert.throws(() => { tx.nonce }, Error) // eslint-disable-line
      })

      it('nonce больше 9007199254740991', function () {
        const tx = new umi.Transaction()
        tx._bytes[77] = 0x80
        tx._isNonceSet = true
        assert.throws(() => { tx.nonce }, Error) // eslint-disable-line
      })
    })

    it('устанавливае nonce в любой транзакции', function () {
      const tx = new umi.Transaction()
      const expected = 9007199254740991
      const actual = tx.setNonce(expected).nonce
      assert.strictEqual(actual, expected)
    })
  })

  describe('signature', function () {
    describe('возвращяет ошибку если', function () {
      describe('передать', function () {
        const len = 64
        const tests = [
          { desc: 'число', args: len },
          { desc: 'массив', args: new Array(len) },
          { desc: 'объект', args: { a: 'b' } },
          { desc: 'ArrayBuffer', args: new ArrayBuffer(1) },
          { desc: 'DataView', args: new DataView(new ArrayBuffer(len)) },
          { desc: 'DataView', args: new DataView(new ArrayBuffer(len)) },
          { desc: 'короткий Uint8Array', args: new Uint8Array(len - 1) },
          { desc: 'длинный Uint8Array', args: new Uint8Array(len + 2) },
          { desc: 'NaN', args: NaN },
          { desc: 'Infinity', args: Infinity },
          { desc: 'float', args: 0.13 }
        ]

        tests.forEach(function (test) {
          it(test.desc, function () {
            const tx = new umi.Transaction()
            tx.version = umi.Transaction.Basic
            tx.sender = new umi.Address()
            assert.throws(() => tx.setSignature(test.args), Error)
          })
        })
      })

      it('запросить подпись не установив версию', function () {
        const tx = new umi.Transaction()
        assert.throws(() => { tx.name }, Error) // eslint-disable-line
      })

      it('запросить подпись не установив отправителя', function () {
        const tx = new umi.Transaction().setVersion(umi.Transaction.Basic)
        assert.throws(() => { tx.signature }, Error) // eslint-disable-line
      })

      it('установить подпись не установив версию', function () {
        const tx = new umi.Transaction()
        assert.throws(() => { tx.signature = new Uint8Array(64) }, Error)
      })

      it('установить подпись не установив отправителя', function () {
        const tx = new umi.Transaction().setVersion(umi.Transaction.Basic)
        assert.throws(() => { tx.signature = new Uint8Array(64) }, Error)
      })

      it('запросить подпись не установив ее перед этим', function () {
        const tx = new umi.Transaction()
        tx.version = umi.Transaction.Basic
        tx.sender = new umi.Address()
        assert.throws(() => { tx.signature }, Error) // eslint-disable-line
      })
    })

    it('устанавливает подпись в любой транзакции', function () {
      const tx = new umi.Transaction()
      tx.version = umi.Transaction.Basic
      tx.sender = new umi.Address()
      const expected = new Uint8Array(64)
      const actual = tx.setSignature(expected).signature
      assert.deepEqual(actual, expected)
    })
  })

  describe('sign', function () {
    describe('возвращяет ошибку если', function () {
      describe('передать', function () {
        const len = 64
        const tests = [
          { desc: 'число', args: len },
          { desc: 'массив', args: new Array(len) },
          { desc: 'объект', args: { a: 'b' } },
          { desc: 'ArrayBuffer', args: new ArrayBuffer(1) },
          { desc: 'DataView', args: new DataView(new ArrayBuffer(len)) },
          { desc: 'DataView', args: new DataView(new ArrayBuffer(len)) },
          { desc: 'Uint8Array', args: new Uint8Array(len) },
          { desc: 'NaN', args: NaN },
          { desc: 'Infinity', args: Infinity },
          { desc: 'float', args: 0.13 }
        ]

        tests.forEach(function (test) {
          it(test.desc, function () {
            const tx = new umi.Transaction()
            tx.version = umi.Transaction.Basic
            tx.sender = new umi.Address()
            assert.throws(() => tx.sign(test.args), Error)
          })
        })
      })

      it('подписать не установив версию', function () {
        const key = umi.SecretKey.fromSeed(new Uint8Array(32))
        const tx = new umi.Transaction()
        assert.throws(() => { tx.sign(key) }, Error)
      })
    })

    it('подписывает любую транзакцию', function () {
      const key = umi.SecretKey.fromSeed(new Uint8Array(32))
      const tx = new umi.Transaction()
      tx.version = umi.Transaction.Basic
      tx.sender = umi.Address.fromKey(key)
      assert.doesNotThrow(() => tx.sign(key))
    })
  })

  describe('verify', function () {
    describe('возвращяет ошибку если', function () {
      it('не установлена версию', function () {
        const tx = new umi.Transaction()
        assert.throws(() => { tx.verify() }, Error)
      })

      it('не установлен отправитель', function () {
        const tx = new umi.Transaction().setVersion(umi.Transaction.Basic)
        assert.throws(() => { tx.verify() }, Error)
      })

      it('не установлена подпись', function () {
        const tx = new umi.Transaction()
        tx.version = umi.Transaction.Basic
        tx.sender = new umi.Address()
        assert.throws(() => { tx.verify() }, Error)
      })
    })

    it('возвращает true если все ОК', function () {
      const key = umi.SecretKey.fromSeed(new Uint8Array(32))
      const tx = new umi.Transaction()
      tx.version = umi.Transaction.Basic
      tx.sender = umi.Address.fromKey(key)
      tx.sign(key)

      assert.isTrue(tx.verify())
    })
  })
})
