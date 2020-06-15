const crypto = require('crypto')
const { sha256 } = require('../../../lib')

describe('Sha256', function () {
  it('проверяем, что функция сущестует', function () {
    expect(sha256).toBeDefined()
  })

  describe('проверяем, что функция возвращяет ошибку если', function () {
    it('вызвать без параметров', function () {
      expect(() => sha256()).toThrowError(Error)
    })

    for (const prm of [null, '', 1, NaN, 0.123, [], {}]) {
      it('передать не Uint8Array', function () {
        expect(() => sha256(prm)).toThrowError(Error)
      })
    }

    it('сообщение длиннее чем 247 байи', function () {
      expect(() => sha256(new Uint8Array(248))).toThrowError(Error)
    })
  })

  describe('проверяем, что хэш пустой строки', function () {
    const hash = sha256(new Uint8Array(0))

    it('возвращяет Uint8Array', function () {
      expect(hash).toBeInstanceOf(Uint8Array)
    })

    it('имеет длину 32 байта', function () {
      expect(hash.byteLength).toBe(32)
    })

    it('равен e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      function () {
        expect(hash).toEqual(new Uint8Array([
          0xe3,
          0xb0,
          0xc4,
          0x42,
          0x98,
          0xfc,
          0x1c,
          0x14,
          0x9a,
          0xfb,
          0xf4,
          0xc8,
          0x99,
          0x6f,
          0xb9,
          0x24,
          0x27,
          0xae,
          0x41,
          0xe4,
          0x64,
          0x9b,
          0x93,
          0x4c,
          0xa4,
          0x95,
          0x99,
          0x1b,
          0x78,
          0x52,
          0xb8,
          0x55]))
      })
  })

  describe('проверяем, хэш рандомной строки длиной', function () {
    for (let l = 1; l < 248; l++) {
      it(l + ' байт', function () {
        const msg = new Uint8Array(l)
        for (let i = 0; i < 8; i++) {
          crypto.randomFillSync(msg)
          const exp = new Uint8Array(
            crypto.createHash('sha256').update(msg).digest().buffer)
          const act = sha256(msg)
          expect(act).toEqual(exp)
        }
      })
    }
  })
})
