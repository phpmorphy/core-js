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
            244, 186, 139, 82, 99, 250, 152, 226,
            27, 252, 62, 9, 75, 171, 115, 195,
            95, 116, 96, 227, 166, 67, 238, 71,
            174, 60, 16, 179, 219, 108, 110, 11
          ]),
          msg: new Uint8Array([
            215, 246, 4, 135, 34, 1, 79, 197, 241,
            159, 247, 94, 86, 233, 61, 83, 4, 135,
            90, 209, 201, 129, 83, 165, 172, 83, 8,
            254, 4, 78, 106, 133, 79, 37, 249, 37,
            14, 85, 149, 86
          ]),
          sig: new Uint8Array([
            111, 6, 187, 146, 229, 205, 89, 54, 73, 37, 69,
            212, 39, 37, 210, 71, 79, 48, 149, 168, 37, 213,
            124, 64, 227, 64, 197, 157, 50, 53, 161, 139, 9,
            26, 159, 244, 189, 206, 116, 129, 87, 147, 175, 169,
            154, 244, 236, 232, 246, 67, 107, 157, 47, 210, 27,
            30, 166, 26, 165, 14, 100, 13, 101, 12
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
