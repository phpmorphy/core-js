const Transaction = require('../../dist/index.js').Transaction
const Address = require('../../dist/index.js').Address
const SecretKey = require('../../dist/index.js').SecretKey
const assert = require('chai').assert

describe('Transaction', function () {
  describe('константы', function () {
    const tests = [
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
        const actual = Transaction[test.args]
        assert.strictEqual(actual, test.expected)
      })
    })
  })

  describe('new Transaction()', function () {
    it('ошибка если некорректная длина', function () {
      assert.throws(function () {
        return Transaction.fromBytes([0, 1, 2])
      }, Error)
    })

    describe('создает транзакцию', function () {
      it('если вызвать без параметров', function () {
        const expected = new Uint8Array(150)
        expected[0] = 1
        const actual = new Uint8Array(new Transaction().toBytes())
        assert.deepEqual(actual, expected)
      })

      it('передать Uint8Array длиной 150 байт', function () {
        const expected = new Uint8Array(150)
        expected[0] = 7
        const actual = new Uint8Array(Transaction.fromBytes(expected).toBytes())
        assert.deepEqual(actual, expected)
      })
    })
  })

  it('#getHash()', function () {
    const bytes = new Uint8Array(150)
    const expected = [
      29, 131, 81, 139, 137, 123, 20, 226, 148, 57, 144, 239, 246, 85, 131,
      130, 70, 204, 2, 7, 167, 201, 90, 95, 61, 252, 204, 46, 57, 95, 139, 191]
    const actual = Transaction.fromBytes(bytes).getHash()

    assert.deepEqual(actual, expected)
  })

  describe('version', function () {
    it('устанавливает версию', function () {
      const expected = Transaction.CreateTransitAddress
      const actual = new Transaction().setVersion(expected).getVersion()
      assert.strictEqual(actual, expected)
    })

    it('возвращает ошибку для некорректной версии', function () {
      assert.throws(function () {
        return new Transaction().setVersion(255)
      }, Error)
    })
  })

  describe('sender', function () {
    it('ошибка если некорректный тип', function () {
      assert.throws(function () {
        return new Transaction().setSender([0, 1, 2])
      }, Error)
    })

    it('устанавливает отправителя', function () {
      const expected = new Address().setPrefix('zzz')
      const actual = new Transaction().setSender(expected).getSender()
      assert.deepEqual(actual.toBytes(), expected.toBytes())
    })
  })

  describe('recipient', function () {
    it('ошибка если некорректный тип', function () {
      assert.throws(function () {
        return new Transaction().setRecipient([0, 1, 2])
      }, Error)
    })

    it('устанавливает получателя', function () {
      const expected = new Address().setPrefix('yyy')
      const actual = new Transaction().setRecipient(expected).getRecipient()
      assert.deepEqual(actual, expected)
    })
  })

  describe('value', function () {
    it('ошибка если некорректный тип', function () {
      assert.throws(function () {
        return new Transaction().setValue(1.23)
      }, Error, 'not integer')
    })

    it('устанавливает сумму', function () {
      const expected = 9007199254740991
      const actual = new Transaction().setValue(expected).getValue()
      assert.strictEqual(actual, expected)
    })
  })

  it('prefix', function () {
    const trx = new Transaction().setVersion(Transaction.CreateStructure)
    const expected = 'lll'
    const actual = trx.setPrefix(expected).getPrefix()
    assert.strictEqual(actual, expected)
  })

  describe('name', function () {
    it('устанавливает имя', function () {
      const trx = new Transaction().setVersion(Transaction.CreateStructure)
      const expected = 'ab-Пр-小篆-😭😰🥰'
      const actual = trx.setName(expected).getName()
      assert.strictEqual(actual, expected)
    })

    it('ошибка если некорректная длина', function () {
      const trx = new Transaction().setVersion(Transaction.CreateStructure)
      assert.throws(function () {
        return trx.setName('a'.repeat(36))
      }, Error, 'name is too long')
    })

    it('ошибка если некорректная длина (bytes)', function () {
      const bytes = new Uint8Array(150)
      bytes[0] = 2
      bytes[41] = 36
      assert.throws(function () {
        return Transaction.fromBytes(bytes).getName()
      }, Error, 'invalid length')
    })
  })

  describe('profitPercent', function () {
    it('устанавливает profitPercent', function () {
      const trx = new Transaction().setVersion(Transaction.CreateStructure)
      const expected = 321
      const actual = trx.setProfitPercent(expected).getProfitPercent()
      assert.strictEqual(actual, expected)
    })

    it('ошибка, если некорректный тип', function () {
      const trx = new Transaction().setVersion(Transaction.CreateStructure)
      assert.throws(function () {
        return trx.setProfitPercent('100')
      }, Error, 'incorrect type')
    })
  })

  it('feePercent', function () {
    const trx = new Transaction().setVersion(Transaction.CreateStructure)
    const expected = 1234
    const actual = trx.setFeePercent(expected).getFeePercent()
    assert.strictEqual(actual, expected)
  })

  it('nonce', function () {
    const expected = 9007199254740991
    const actual = new Transaction().setNonce(expected).getNonce()
    assert.strictEqual(actual, expected)
  })

  it('#toBase64()', function () {
    const expected = '' +
      'AQQhBNO+JWxYyqg/hwCNNTf+OSi4FPLvb+CdCgDNCQp0z6EIQk7qqt8TASDt45OWqVpIpGN34agVA7EWGndxFuVsnIF0AB//////' +
      '//8CAAAAAAAAAH9el6Akogt7CM0d1L8VBf2n436itp8C/lrd+4aksXn+XqGWBSCVxRVJSrICcuhwaO/xRaYwr4xAUyu0/5MYVQsA'
    const actual = Transaction.fromBase64(expected).toBase64()
    assert.strictEqual(actual, expected)
  })

  describe('.fromBase64()', function () {
    it('ошибка если некорректная длина', function () {
      assert.throws(function () {
        return Transaction.fromBase64('A'.repeat(199))
      }, Error)
    })

    it('ошибка если некорректные символы', function () {
      assert.throws(function () {
        return Transaction.fromBase64('('.repeat(200))
      }, Error)
    })
  })

  describe('signature', function () {
    it('ошибка если некорректная длина', function () {
      assert.throws(function () {
        return new Transaction().setSignature([1, 2, 3])
      }, Error)
    })
  })

  describe('sign()', function () {
    it('ошибка если некорректный тип', function () {
      assert.throws(function () {
        return new Transaction().sign({})
      }, Error)
    })

    it('verify()', function () {
      const key = SecretKey.fromSeed([1, 2, 3])
      const tx = new Transaction().setSender(Address.fromKey(key)).sign(key)
      assert.isTrue(tx.verify())
    })
  })

  it('checkVersion()', function () {
    assert.throws(function () {
      return new Transaction().setPrefix('aaa')
    }, Error)
  })
})
