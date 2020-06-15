describe('Bech32', function () {
  describe('encode()', function () {
    it('создает корректный адрес', function () {
      const exp = 'genesis1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqkxaddc'
      const act = umi.Bech32.encode(new Uint8Array(34))

      assert.equal(act, exp)
    })
  })

  describe('decode()', function () {
    it('корректно декодирует адрес', function () {
      const adr = 'genesis1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqkxaddc'
      const exp = new Uint8Array(34)
      const act = umi.Bech32.decode(adr)

      assert.deepEqual(act, exp)
    })
  })
})
