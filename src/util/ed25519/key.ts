import { sha512 } from '../sha512'
import { pack, scalarbase } from './common'

function secretKeyFromSeed (seed: Uint8Array): Uint8Array {
  const pk = new Uint8Array(32)
  const sk = new Uint8Array(64)

  sk.set(seed)

  cryptoSignKeypair(pk, sk)

  return sk
}

function publicKeyFromSecretKey (secretKey: Uint8Array): Uint8Array {
  const b = new Uint8Array(32)
  b.set(new Uint8Array(secretKey.buffer, 32, 32))
  return b
}

/**
 * @param {Uint8Array} pk
 * @param {Uint8Array} sk
 * @private
 * @internal
 */
function cryptoSignKeypair (pk: Uint8Array, sk: Uint8Array): number {
  const p = [
    new Float64Array(16), new Float64Array(16),
    new Float64Array(16), new Float64Array(16)]

  const d = new Uint8Array(sha512(sk.slice(0, 32)))
  d[0] &= 248
  d[31] &= 127
  d[31] |= 64

  scalarbase(p, d)
  pack(pk, p)
  sk.set(pk, 32)

  return 0
}

export { secretKeyFromSeed, publicKeyFromSecretKey }
