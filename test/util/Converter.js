describe('Converter', function () {
  describe('uint16ToPrefix()', function () {
    describe('возвращяет ошибку если передать', function () {
      const tests = [
        { desc: 'отрицательное целое число', args: -1 },
        { desc: 'положительное вещественное число', args: 0.123 },
        { desc: 'пустую строку', args: '' },
        { desc: 'пустой массив', args: [] },
        { desc: 'пустой объект', args: {} },
        { desc: 'ненулевой первый бит', args: 0x8000 },
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
        { desc: 'некорректный третий символ (0)', args: (1 << 10) + (1 << 5) }
      ]

      tests.forEach(function (test) {
        it(test.desc, function () {
          assert.throws(() => umi.uint16ToPrefix(test.args), Error)
        })
      })
    })

    describe('возвращяет правильный префикс', function () {
      const tests = [
        { desc: '"genesis" для версии 0', args: 0, expected: 'genesis' },
        { desc: '"aaa" для версии 0', args: 1057, expected: 'aaa' },
        { desc: '"abc" для версии 0', args: 1091, expected: 'abc' },
        { desc: '"umi" для версии 0', args: 21929, expected: 'umi' },
        { desc: '"zzz" для версии 0', args: 27482, expected: 'zzz' }
      ]

      tests.forEach(function (test) {
        it(test.desc, function () {
          const actual = umi.uint16ToPrefix(test.args)
          assert.equal(actual, test.expected)
        })
      })
    })
  })

  describe('prefixToUint16()', function () {
    describe('возвращяет ошибку если передать', function () {
      const tests = [
        { desc: 'отрицательное целое число', args: -1 },
        { desc: 'положительное вещественное число', args: 0.123 },
        { desc: 'пустую строку', args: '' },
        { desc: 'пустой массив', args: [] },
        { desc: 'пустой объект', args: {} },
        { desc: 'слишком короткую строку', args: 'ab' },
        { desc: 'слишком длинную строку', args: 'abcd' },
        { desc: 'некорректный первый символ (Abc)', args: 'Abc' },
        { desc: 'некорректный первый символ (0bc)', args: '0bc' },
        { desc: 'некорректный второй символ (aBc)', args: 'aBc' },
        { desc: 'некорректный второй символ (a1c)', args: 'a1c' },
        { desc: 'некорректный третий символ (abC)', args: 'abC' },
        { desc: 'некорректный третий символ (ab2)', args: 'ab2' }
      ]

      tests.forEach(function (test) {
        it(test.desc, function () {
          assert.throws(() => umi.prefixToUint16(test.args), Error)
        })
      })
    })

    describe('возвращяет правильную версию', function () {
      const tests = [
        { desc: '0 для префикса "genesis"', args: 'genesis', expected: 0 },
        { desc: '1057 для префикса "aaa" ', args: 'aaa', expected: 1057 },
        { desc: '1091 для префикса "abc"', args: 'abc', expected: 1091 },
        { desc: '21929 для префикса "umi"', args: 'umi', expected: 21929 },
        { desc: '27482 для префикса "zzz"', args: 'zzz', expected: 27482 }
      ]

      tests.forEach(function (test) {
        it(test.desc, function () {
          const actual = umi.prefixToUint16(test.args)
          assert.equal(actual, test.expected)
        })
      })
    })
  })
})
