const { Bech32 } = require('../../../lib')

describe('Bech32', function () {
  describe('функция encode', function () {
    it('создает правильный адрес', function () {
      const exp = 'genesis1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqkxaddc'
      const act = Bech32.encode(new Uint8Array(34))

      expect(exp).toBe(act)
    })
  })

  describe('функция decode', function () {
    it('правильно декодирует адрес', function () {
      const adr = 'genesis1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqkxaddc'
      const exp = new Uint8Array(34)
      const act = Bech32.decode(adr)

      expect(exp).toEqual(act)
    })
  })
})
