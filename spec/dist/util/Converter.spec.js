/* eslint-disable no-undef */

const { uint16ToPrefix, prefixToUint16 } = require('../../../lib')

describe('Converter', function () {
  describe('функция uint16ToPrefix', function () {
    describe('возвращяет ошибку если передать', function () {
      for (const prm of [-1, 0.123, '', [], {}]) {
        it('что-то отличное от положительного integer number', function () {
          expect(() => uint16ToPrefix(prm)).toThrowError(Error)
        })
      }

      it('некорректная первый бит', function () {
        expect(() => uint16ToPrefix(0x8000)).toThrowError(Error)
      })

      describe('некорректный первый символ', function () {
        it('(>26)', function () {
          const ver = (27 << 10) + (1 << 5) + 1
          expect(() => uint16ToPrefix(ver)).toThrowError(Error)
        })

        it('(<1)', function () {
          const ver = (0 << 10) + (1 << 5) + 1
          expect(() => uint16ToPrefix(ver)).toThrowError(Error)
        })
      })

      describe('некорректный второй символ', function () {
        it('(>26)', function () {
          const ver = (1 << 10) + (27 << 5) + 1
          expect(() => uint16ToPrefix(ver)).toThrowError(Error)
        })

        it('(<1)', function () {
          const ver = (1 << 10) + (0 << 5) + 1
          expect(() => uint16ToPrefix(ver)).toThrowError(Error)
        })
      })

      describe('некорректный третий символ', function () {
        it('(>26)', function () {
          const ver = (1 << 10) + (1 << 5) + 27
          expect(() => uint16ToPrefix(ver)).toThrowError(Error)
        })

        it('(<1)', function () {
          const ver = (1 << 10) + (1 << 5)
          expect(() => uint16ToPrefix(ver)).toThrowError(Error)
        })
      })
    })

    describe('возвращяет правильный префикс', function () {
      it('"genesis" для версии 0', function () {
        expect(uint16ToPrefix(0)).toBe('genesis')
      })

      for (let i = 0; i < 64; i++) {
        const a = 1 + Math.floor(Math.random() * Math.floor(26))
        const b = 1 + Math.floor(Math.random() * Math.floor(26))
        const c = 1 + Math.floor(Math.random() * Math.floor(26))

        const pfx = String.fromCharCode((a + 96), (b + 96), (c + 96))
        const ver = (a << 10) + (b << 5) + c

        it(pfx + ' для версии ' + ver, function () {
          expect(uint16ToPrefix(ver)).toBe(pfx)
        })
      }
    })
  })

  describe('функция prefixToUint16', function () {
    describe('возвращяет ошибку если передать', function () {
      for (const prm of [null, 1, 0.1, Infinity, [], {}, NaN]) {
        it('что-то отличное от строки', function () {
          expect(() => prefixToUint16(prm)).toThrowError(Error)
        })
      }

      it('слишком короткую строку', function () {
        expect(() => prefixToUint16('ab')).toThrowError(Error)
      })
      it('слишком длинную строку', function () {
        expect(() => prefixToUint16('abcd')).toThrowError(Error)
      })
      it('неразрешенные символы [1]', function () {
        expect(() => prefixToUint16('Abc')).toThrowError(Error)
      })
      it('неразрешенные символы [2]', function () {
        expect(() => prefixToUint16('aBc')).toThrowError(Error)
      })
      it('неразрешенные символы [3]', function () {
        expect(() => prefixToUint16('ab0')).toThrowError(Error)
      })
    })

    describe('возвращяет правильную версию', function () {
      it('0 для префикса "genesis"', function () {
        expect(prefixToUint16('genesis')).toBe(0)
      })

      for (let i = 0; i < 64; i++) {
        const a = 1 + Math.floor(Math.random() * Math.floor(26))
        const b = 1 + Math.floor(Math.random() * Math.floor(26))
        const c = 1 + Math.floor(Math.random() * Math.floor(26))

        const pfx = String.fromCharCode((a + 96), (b + 96), (c + 96))
        const ver = (a << 10) + (b << 5) + c

        it(ver + ' для префикс ' + pfx, function () {
          expect(prefixToUint16(pfx)).toBe(ver)
        })
      }
    })
  })
})
