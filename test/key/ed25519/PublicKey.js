if (typeof window === 'undefined') {
  var umi = require('../../../')
  var assert = require('chai').assert
}

describe('PublicKey', function () {
  describe('new PublicKey()', function () {
    describe('ошибки', function () {
      const tests = [
        { desc: 'тип', args: new Array(umi.PublicKey.LENGTH) },
        { desc: 'длина', args: new Uint8Array(umi.PublicKey.LENGTH - 1) }
      ]

      tests.forEach(function (test) {
        it(test.desc, function () {
          assert.throws(function () {
            return new umi.PublicKey(test.args)
          }, Error)
        })
      })
    })
  })

  describe('#verifySignature()', function () {
    describe('ошибки', function () {
      const tests = [
        {
          desc: 'некорректный тип message',
          sig: new Uint8Array(umi.PublicKey.SIGNATURE_LENGTH),
          msg: new Array(42)
        },
        {
          desc: 'некорректный тип signature',
          sig: new Array(umi.PublicKey.SIGNATURE_LENGTH),
          msg: new Uint8Array(42)
        },
        {
          desc: 'некорректная длина signature',
          sig: new Uint8Array(umi.PublicKey.SIGNATURE_LENGTH - 1),
          msg: new Uint8Array(42)
        }
      ]

      tests.forEach(function (test) {
        it(test.desc, function () {
          const pub = new umi.PublicKey(new Uint8Array(umi.PublicKey.LENGTH))
          assert.throws(function () {
            pub.verifySignature(test.sig, test.msg)
          }, Error)
        })
      })
    })

    describe('подпись', function () {
      const tests = [
        {
          desc: 'валидная',
          key: new Uint8Array([
            160, 62, 194, 204, 204, 104, 221, 70,
            35, 94, 15, 212, 70, 182, 79, 150,
            227, 146, 58, 48, 27, 205, 133, 113,
            33, 112, 242, 56, 217, 81, 230, 146
          ]),
          msg: new Uint8Array([
            43, 176, 119, 99, 211, 8, 44, 171,
            30, 2, 80, 67, 146, 59, 176, 141,
            206, 60, 53, 61, 239, 49, 106, 225,
            139, 28, 161, 237, 216, 143, 240, 239,
            1
          ]),
          sig: new Uint8Array([
            238, 101, 76, 88, 204, 234, 30, 12, 190, 35, 209,
            146, 149, 45, 23, 20, 5, 213, 212, 136, 198, 153,
            230, 97, 148, 52, 14, 4, 200, 235, 194, 230, 187,
            17, 66, 242, 128, 210, 10, 130, 72, 144, 218, 30,
            164, 73, 224, 234, 239, 171, 65, 162, 106, 26, 61,
            183, 60, 125, 161, 88, 192, 211, 180, 14
          ]),
          exp: true
        },
        {
          desc: 'невалидная',
          key: new Uint8Array([
            49, 64, 38, 69, 114, 186, 249, 129,
            225, 1, 36, 221, 88, 222, 215, 199,
            105, 30, 96, 241, 181, 87, 229, 104,
            84, 133, 205, 221, 19, 72, 5, 33
          ]),
          msg: new Uint8Array([
            80, 103, 223, 67, 26, 142, 197, 243,
            28, 77, 197, 145, 85, 164, 100, 148,
            36, 191, 48, 217, 158, 230, 61, 136,
            205, 72, 116, 39, 201, 44, 108, 244,
            221
          ]),
          sig: new Uint8Array([
            145, 14, 243, 211, 227, 195, 36, 22, 144, 122, 40,
            106, 119, 72, 69, 162, 186, 157, 5, 53, 107, 242,
            106, 192, 59, 68, 160, 233, 21, 140, 139, 113, 27,
            21, 39, 71, 49, 85, 98, 114, 164, 153, 86, 216,
            92, 175, 232, 35, 166, 120, 227, 116, 232, 138, 111,
            23, 166, 109, 192, 168, 92, 8, 158, 9
          ]),
          exp: false
        }
      ]

      tests.forEach(function (test) {
        it(test.desc, function () {
          const pub = new umi.PublicKey(test.key)
          const act = pub.verifySignature(test.sig, test.msg)
          assert.equal(test.exp, act)
        })
      })
    })
  })
})
