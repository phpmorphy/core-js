if (typeof window === 'undefined') {
  var umi = require('../../../')
  var assert = require('chai').assert
}

describe('SecretKey', function () {
  describe('new SecretKey()', function () {
    describe('ошибки', function () {
      const tests = [
        { desc: 'тип', arg: new Array(umi.SecretKey.LENGTH) },
        { desc: 'длина', arg: new Uint8Array(umi.SecretKey.LENGTH - 1) }
      ]

      tests.forEach(function (test) {
        it(test.desc, function () {
          assert.throws(function () {
            return new umi.SecretKey(test.arg)
          }, Error)
        })
      })
    })

    it('ключ', function () {
      const expected = new Uint8Array([
        187, 89, 179, 188, 41, 230, 200, 134, 224, 179, 196,
        77, 51, 209, 134, 24, 115, 150, 112, 23, 76, 188,
        62, 198, 32, 160, 180, 155, 220, 211, 21, 198, 134,
        93, 160, 15, 64, 198, 238, 61, 214, 117, 160, 9,
        211, 9, 244, 127, 214, 177, 211, 200, 45, 201, 230,
        126, 241, 249, 217, 69, 138, 97, 204, 243
      ])
      const actual = new umi.SecretKey(expected).bytes
      assert.deepEqual(actual, expected)
    })
  })

  describe('fromSeed()', function () {
    describe('ошибки', function () {
      const tests = [
        { desc: 'тип', args: new Array(32) },
        { desc: 'длина', args: new Uint8Array(512) }
      ]

      tests.forEach(function (test) {
        it(test.desc, function () {
          assert.throws(function () {
            umi.SecretKey.fromSeed(test.args)
          }, Error)
        })
      })
    })
  })

  describe('pubKey', function () {
    const tests = [
      {
        desc: 'seed 31 байта',
        seed: new Uint8Array([
          65, 76, 5, 86, 213, 76, 114,
          145, 239, 39, 147, 182, 154, 23,
          46, 125, 193, 164, 79, 171, 201,
          231, 172, 61, 167, 11, 159, 127,
          210, 232, 205
        ]),
        pub: new Uint8Array([
          8, 225, 210, 150, 99, 57, 62, 160,
          59, 94, 237, 137, 201, 57, 113, 19,
          186, 111, 162, 185, 19, 156, 83, 172,
          161, 132, 255, 150, 220, 55, 100, 246
        ])
      },
      {
        desc: 'seed 32 байта',
        seed: new Uint8Array([
          229, 160, 21, 183, 131, 174, 98, 21,
          82, 109, 235, 196, 135, 23, 222, 207,
          207, 88, 212, 193, 150, 192, 171, 14,
          66, 163, 55, 210, 6, 169, 169, 84
        ]),
        pub: new Uint8Array([
          117, 176, 167, 73, 189, 76, 127,
          55, 208, 245, 100, 172, 141, 117,
          165, 225, 188, 117, 59, 223, 6,
          94, 215, 222, 49, 226, 161, 40,
          128, 46, 180, 247
        ])
      },
      {
        desc: 'seed 33 байта',
        seed: new Uint8Array([
          78, 198, 144, 170, 71, 144, 18, 86,
          147, 239, 210, 53, 213, 38, 174, 71,
          43, 216, 215, 235, 224, 18, 208, 188,
          138, 107, 118, 183, 206, 25, 60, 187,
          73
        ]),
        pub: new Uint8Array([
          43, 42, 106, 118, 167, 104, 152,
          197, 83, 224, 171, 39, 199, 224,
          200, 197, 154, 225, 135, 255, 38,
          165, 26, 157, 189, 216, 193, 196,
          212, 103, 59, 220
        ])
      }
    ]

    tests.forEach(function (test) {
      it(test.desc, function () {
        const actual = umi.SecretKey.fromSeed(test.seed).publicKey.bytes
        assert.deepEqual(actual, test.pub)
      })
    })
  })

  describe('#sign()', function () {
    describe('ошибки', function () {
      const tests = [{ desc: 'тип', msg: new Array(42) }]

      tests.forEach(function (test) {
        it(test.desc, function () {
          const sec = new umi.SecretKey(new Uint8Array(umi.SecretKey.LENGTH))
          assert.throws(function () { sec.sign(test.msg) }, Error)
        })
      })
    })

    it('подпись', function () {
      const tests = [
        {
          desc: '1st',
          key: new Uint8Array([
            187, 89, 179, 188, 41, 230, 200, 134, 224, 179, 196,
            77, 51, 209, 134, 24, 115, 150, 112, 23, 76, 188,
            62, 198, 32, 160, 180, 155, 220, 211, 21, 198, 134,
            93, 160, 15, 64, 198, 238, 61, 214, 117, 160, 9,
            211, 9, 244, 127, 214, 177, 211, 200, 45, 201, 230,
            126, 241, 249, 217, 69, 138, 97, 204, 243
          ]),
          msg: new Uint8Array([
            246, 210, 91, 58, 160, 131, 24, 101, 52,
            19, 129, 116, 133, 132, 17, 243, 195, 4,
            197, 57, 94, 34, 247, 171, 87, 136, 152,
            129, 11, 53, 111, 57, 254, 128, 169, 159,
            236, 115, 14, 220
          ]),
          sig: new Uint8Array([
            229, 175, 166, 120, 241, 9, 149, 181, 51, 78, 186,
            140, 230, 236, 109, 86, 73, 72, 224, 162, 190, 194,
            220, 65, 130, 75, 120, 142, 42, 222, 128, 242, 230,
            169, 171, 16, 251, 137, 19, 50, 237, 138, 65, 240,
            9, 119, 178, 37, 21, 134, 106, 31, 108, 140, 234,
            86, 67, 185, 245, 213, 99, 170, 40, 5
          ])
        }
      ]

      tests.forEach(function (test) {
        it(test.desc, function () {
          const actual = new umi.SecretKey(test.key).sign(test.msg)
          assert.deepEqual(actual, test.sig)
        })
      })
    })
  })
})
