if (typeof window === 'undefined') {
  var umi = require('../../dist/index.js')
  var assert = require('chai').assert
}

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
        const actual = umi.Transaction[test.args]
        assert.strictEqual(actual, test.expected)
      })
    })
  })

  describe('new Transaction()', function () {
    it('ошибка если некорректная длина', function () {
      assert.throws(function () {
        return new umi.Transaction([0, 1, 2])
      }, Error)
    })

    describe('создает транзакцию', function () {
      it('если вызвать без параметров', function () {
        const expected = new Uint8Array(150)
        const actual = new Uint8Array(new umi.Transaction().bytes)
        assert.deepEqual(actual, expected)
      })

      it('передать Uint8Array длиной 150 байт', function () {
        const expected = new Uint8Array(150)
        expected[0] = 7
        const actual = new Uint8Array(new umi.Transaction(expected).bytes)
        assert.deepEqual(actual, expected)
      })
    })
  })

  it('hash', function () {
    const bytes = new Uint8Array(150)
    const expected = [
      29, 131, 81, 139, 137, 123, 20, 226, 148, 57, 144, 239, 246, 85, 131,
      130, 70, 204, 2, 7, 167, 201, 90, 95, 61, 252, 204, 46, 57, 95, 139, 191]
    const actual = new umi.Transaction(bytes).hash

    assert.deepEqual(actual, expected)
  })

  describe('version', function () {
    it('устанавливает версию', function () {
      const expected = umi.Transaction.CreateTransitAddress
      const actual = new umi.Transaction().setVersion(expected).version
      assert.strictEqual(actual, expected)
    })

    it('возвращает ошибку для некорректной версии', function () {
      assert.throws(function () {
        return new umi.Transaction().setVersion(255)
      }, Error)
    })
  })

  describe('sender', function () {
    it('ошибка если некорректный тип', function () {
      assert.throws(function () {
        return new umi.Transaction().setSender([0, 1, 2])
      }, Error)
    })

    it('устанавливает отправителя', function () {
      const expected = new umi.Address().setPrefix('zzz')
      const actual = new umi.Transaction().setSender(expected).sender
      assert.deepEqual(actual, expected)
    })
  })

  describe('recipient', function () {
    it('ошибка если некорректный тип', function () {
      assert.throws(function () {
        return new umi.Transaction().setRecipient([0, 1, 2])
      }, Error)
    })

    it('устанавливает получателя', function () {
      const expected = new umi.Address().setPrefix('yyy')
      const actual = new umi.Transaction().setRecipient(expected).recipient
      assert.deepEqual(actual, expected)
    })
  })

  it('value', function () {
    const expected = 9007199254740991
    const actual = new umi.Transaction().setValue(expected).value
    assert.strictEqual(actual, expected)
  })

  it('prefix', function () {
    const expected = 'lll'
    const actual = new umi.Transaction().setPrefix(expected).prefix
    assert.strictEqual(actual, expected)
  })

  describe('name', function () {
    it('устанваливает имя', function () {
      const expected = 'ab-Пр-小篆-😭😰🥰'
      const actual = new umi.Transaction().setName(expected).name
      assert.strictEqual(actual, expected)
    })

    it('ошибка если некорректная длина', function () {
      assert.throws(function () {
        return new umi.Transaction().setName('a'.repeat(36))
      }, Error)
    })

    it('ошибка если некорректная длина (bytes)', function () {
      const bytes = new Uint8Array(150)
      bytes[41] = 36
      assert.throws(function () {
        return new umi.Transaction(bytes).name
      }, Error)
    })
  })

  it('profitPercent', function () {
    const expected = 321
    const actual = new umi.Transaction().setProfitPercent(expected).profitPercent
    assert.strictEqual(actual, expected)
  })

  it('feePercent', function () {
    const expected = 1234
    const actual = new umi.Transaction().setFeePercent(expected).feePercent
    assert.strictEqual(actual, expected)
  })

  it('nonce', function () {
    const expected = 9007199254740991
    const actual = new umi.Transaction().setNonce(expected).nonce
    assert.strictEqual(actual, expected)
  })

  it('base64', function () {
    const expected = '' +
      'AQQhBNO+JWxYyqg/hwCNNTf+OSi4FPLvb+CdCgDNCQp0z6EIQk7qqt8TASDt45OWqVpIpGN34agVA7EWGndxFuVsnIF0AB//////' +
      '//8CAAAAAAAAAH9el6Akogt7CM0d1L8VBf2n436itp8C/lrd+4aksXn+XqGWBSCVxRVJSrICcuhwaO/xRaYwr4xAUyu0/5MYVQsA'
    const actual = umi.Transaction.fromBase64(expected).base64
    assert.strictEqual(actual, expected)
  })

  describe('.fromBase64()', function () {
    it('ошибка если некорректная длина', function () {
      assert.throws(function () {
        return umi.Transaction.fromBase64('A'.repeat(199))
      }, Error)
    })

    it('ошибка если некорректные символы', function () {
      assert.throws(function () {
        return umi.Transaction.fromBase64('('.repeat(200))
      }, Error)
    })
  })

  describe('signature', function () {
    it('ошибка если некорректная длина', function () {
      assert.throws(function () {
        return new umi.Transaction().setSignature([1, 2, 3])
      }, Error)
    })
  })

  describe('sign()', function () {
    it('ошибка если некорректный тип', function () {
      assert.throws(function () {
        return new umi.Transaction().sign({})
      }, Error)
    })

    it('verify()', function () {
      const key = umi.SecretKey.fromSeed([1, 2, 3])
      const tx = new umi.Transaction().setSender(umi.Address.fromKey(key)).sign(key)
      assert.isTrue(tx.verify())
    })
  })
})
