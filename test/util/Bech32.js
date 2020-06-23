if (typeof window === 'undefined') {
  var umi = require('../../')
  var assert = require('chai').assert
}

// describe('Bech32', function () {
//   describe('encode()', function () {
//     it('создает корректный адрес', function () {
//       if (typeof window !== 'undefined') {
//         this.skip()
//       }
//
//       const exp = 'genesis1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqkxaddc'
//       const act = umi.Bech32.encode(new Uint8Array(34))
//
//       assert.strictEqual(act, exp)
//     })
//   })
//
//   describe('decode()', function () {
//     describe('возвращяет ошибку если', function () {
//       const tests = [
//         { desc: 'некорректный адрес - too short', args: 'a1qqq' },
//         { desc: 'некорректный адрес - mixed-case', args: 'Aa1qqqqqqqq' },
//         { desc: 'некорректный адрес - no separator', args: 'aqqqqqqqq' },
//         { desc: 'некорректный адрес - no prefix', args: '1qqqqqqqq' },
//         { desc: 'некорректный адрес - unknown char', args: 'a1qiqqqqqq' },
//         { desc: 'некорректный адрес - invalid prefix', args: 'я1qqqqqqqq' },
//         {
//           desc: 'некорректный адрес - non-zero padding',
//           args: 'tb1qrp33g0q5c5txsp9arysrx4k6zdkfs4nce4xj0gdcccefvpysxf3pjxtptv'
//         }
//       ]
//
//       tests.forEach(function (test) {
//         it(test.desc, function () {
//           assert.throws(() => { umi.Bech32.decode(test.args) }, Error)
//         })
//       })
//     })
//
//     it('корректно декодирует адрес', function () {
//       if (typeof window !== 'undefined') {
//         this.skip()
//       }
//
//       const adr = 'genesis1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqkxaddc'
//       const exp = new Uint8Array(34)
//       const act = umi.Bech32.decode(adr)
//
//       assert.deepEqual(act, exp)
//     })
//   })
//
//   describe('_encode()', function () {
//     it('возвращяет ошибку - non 5-bit word', function () {
//       assert.throws(() => { umi.Bech32._encode('a', [255, 255]) }, Error)
//     })
//   })
//
//   describe('_convert()', function () {
//     it('возвращяет ошибку - excess padding', function () {
//       const words = [
//         14,
//         20,
//         15,
//         7,
//         13,
//         26,
//         0,
//         25,
//         18,
//         6,
//         11,
//         13,
//         8,
//         21,
//         4,
//         20,
//         3,
//         17,
//         2,
//         29,
//         3,
//         0]
//       assert.throws(() => { umi.Bech32._convert(words, 5, 8, false) }, Error)
//     })
//
//     it('padding', function () {
//       const expected = [0, 4, 1, 0, 6, 1, 0, 5]
//       const actual = umi.Bech32._convert([1, 2, 3, 4, 5], 8, 5, true)
//       assert.deepEqual(actual, expected)
//     })
//   })
// })
