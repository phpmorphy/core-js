describe('PublicKey', function () {
  describe('new PublicKey()', function () {
    describe('возвращяет ошибку если передать', function () {
      const tests = [
        { desc: 'отрицательное целое число', args: -1 },
        { desc: 'положительное вещественное число', args: 0.123 },
        { desc: 'пустую строку', args: '' },
        { desc: 'пустой массив', args: [] },
        { desc: 'пустой объект', args: {} },
        { desc: 'ничего', args: undefined },
        { desc: 'ArrayBuffer', args: new ArrayBuffer(1) },
        { desc: 'DataView', args: new DataView(new ArrayBuffer(1)) },
        { desc: 'ключ короче чем 32 байта', args: new Uint8Array(31) },
        { desc: 'ключ длиннее чем 32 байта', args: new Uint8Array(33) }
      ]

      tests.forEach(function (test) {
        it(test.desc, function () {
          assert.throws(() => new umi.PublicKey(test.args), Error)
        })
      })
    })

    it('создает публичный ключ', function () {
      const expected = umi.sha256(new Uint8Array(200))
      const actual = new umi.PublicKey(expected).bytes

      assert.deepEqual(actual, expected)
    })
  })

  describe('verifySignature()', function () {
    const tests = [
      { desc: 'отрицательное целое число', args: -1 },
      { desc: 'положительное вещественное число', args: 0.123 },
      { desc: 'пустую строку', args: '' },
      { desc: 'пустой массив', args: [] },
      { desc: 'пустой объект', args: {} },
      { desc: 'ArrayBuffer', args: new ArrayBuffer(1) },
      { desc: 'DataView', args: new DataView(new ArrayBuffer(1)) }
    ]

    describe('возвращяет ошибку если передать в message', function () {
      tests.forEach(function (test) {
        it(test.desc, function () {
          const key = new umi.PublicKey(new Uint8Array(32))
          const sig = new Uint8Array(64)
          assert.throws(() => key.verifySignature(test.args, sig), Error)
        })
      })
    })

    describe('возвращяет ошибку если передать в signature', function () {
      tests.push(
        { desc: 'подпись короче чем 64 байта', args: new Uint8Array(63) },
        { desc: 'подпись длиньше чем 64 байта', args: new Uint8Array(65) }
      )

      tests.forEach(function (test) {
        it(test.desc, function () {
          const key = new umi.PublicKey(new Uint8Array(32))
          const msg = new Uint8Array(1)
          assert.throws(() => key.verifySignature(msg, test.args), Error)
        })
      })
    })

    it('возрвщяет false для некорректной подписи', function () {
      const msg = new Uint8Array(0)
      const key = new Uint8Array(32)
      const sig = new Uint8Array(64)

      const actual = new umi.PublicKey(key).verifySignature(msg, sig)
      assert.isFalse(actual)
    })
  })
})
