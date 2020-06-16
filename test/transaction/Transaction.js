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
        assert.equal(actual, test.expected)
      })
    })
  })

  describe('new Transaction()', function () {
    describe('возвращяет ошибку если передать', function () {
      const tests = [
        { desc: 'отрицательное целое число', args: -1 },
        { desc: 'положительное вещественное число', args: 0.123 },
        { desc: 'пустую строку', args: '' },
        { desc: 'пустой массив', args: [] },
        { desc: 'пустой объект', args: {} },
        { desc: 'ArrayBuffer', args: new ArrayBuffer(1) },
        { desc: 'DataView', args: new DataView(new ArrayBuffer(1)) },
        { desc: 'транзакцию короче чем 150 байта', args: new Uint8Array(149) },
        { desc: 'транзакцию длиннее чем 150 байта', args: new Uint8Array(151) }
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

  describe('bytes', function () {
    it('возвращяет Uint8Array длиной 150 байта', function () {
      const expected = new Uint8Array(150)
      const actual = new umi.Transaction().bytes

      assert.deepEqual(actual, expected)
    })
  })

  describe('bytes', function () {
    it('возвращяет корректный хэш', function () {
      const expected = umi.sha256(new Uint8Array(150))
      const actual = new umi.Transaction().hash

      assert.deepEqual(actual, expected)
    })
  })
})
