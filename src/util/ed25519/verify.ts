import { cryptoHash } from './sha512'
import { gf0, gf1, reduce, scalarmult, scalarbase, add, set25519, pack, fnA, fnM, fnS, fnZ, D, pack25519, par25519, I } from './common'

function verify (
  signature: Uint8Array, message: Uint8Array, publicKey: Uint8Array): boolean {
  const sm = new Uint8Array(64 + message.byteLength)
  const m = new Uint8Array(64 + message.byteLength)

  sm.set(signature)
  sm.set(message, 64)

  m.set(sm)

  return (cryptoSignOpen(m, sm, sm.byteLength, publicKey) >= 0)
}

/**
 * @param {Uint8Array} m
 * @param {Uint8Array} sm
 * @param {number} n
 * @param {Uint8Array} pk
 * @private
 * @internal
 */
function cryptoSignOpen (
  m: Uint8Array, sm: Uint8Array, n: number, pk: Uint8Array
): number {
  const t = new Uint8Array(32)
  const h = new Uint8Array(64)
  const p = [
    new Float64Array(16), new Float64Array(16),
    new Float64Array(16), new Float64Array(16)]
  const q = [
    new Float64Array(16), new Float64Array(16),
    new Float64Array(16), new Float64Array(16)]

  /** @istanbul ignore if */
  if (unpackneg(q, pk)) {
    return -1
  }

  m.set(sm)
  m.set(pk, 32)

  cryptoHash(h, m, n)
  reduce(h)
  scalarmult(p, q, h)

  scalarbase(q, sm.subarray(32))
  add(p, q)
  pack(t, p)

  if (cryptoVerify32(sm, t)) {
    return -1
  }

  return n
}

/**
 * @param {Float64Array[]} r
 * @param {Uint8Array} p
 * @private
 * @internal
 */
function unpackneg (r: Float64Array[], p: Uint8Array): number {
  const t = new Float64Array(16)
  const chk = new Float64Array(16)
  const num = new Float64Array(16)
  const den = new Float64Array(16)
  const den2 = new Float64Array(16)
  const den4 = new Float64Array(16)
  const den6 = new Float64Array(16)

  set25519(r[2], gf1)
  unpack25519(r[1], p)
  fnS(num, r[1])
  fnM(den, num, D)
  fnZ(num, num, r[2])
  fnA(den, r[2], den)

  fnS(den2, den)
  fnS(den4, den2)
  fnM(den6, den4, den2)
  fnM(t, den6, num)
  fnM(t, t, den)

  pow2523(t, t)
  fnM(t, t, num)
  fnM(t, t, den)
  fnM(t, t, den)
  fnM(r[0], t, den)

  fnS(chk, r[0])
  fnM(chk, chk, den)
  if (neq25519(chk, num)) {
    fnM(r[0], r[0], I)
  }

  fnS(chk, r[0])
  fnM(chk, chk, den)
  /** @istanbul ignore if */
  if (neq25519(chk, num)) {
    return -1
  }

  if (par25519(r[0]) === (p[31] >> 7)) {
    fnZ(r[0], gf0, r[0])
  }

  fnM(r[3], r[0], r[1])

  return 0
}

/**
 * @param {Uint8Array} x
 * @param {number} xi
 * @param {Uint8Array} y
 * @param {number} yi
 * @private
 * @internal
 */
function cryptoVerify32 (x: Uint8Array, y: Uint8Array): number {
  let d = 0
  for (let i = 0; i < 32; i++) {
    d |= x[i] ^ y[i]
  }

  return (1 & ((d - 1) >>> 8)) - 1
}

/**
 * @param {Float64Array} o
 * @param {Uint8Array} n
 * @private
 * @internal
 */
function unpack25519 (o: Float64Array, n: Uint8Array): void {
  for (let i = 0; i < 16; i++) {
    o[i] = n[2 * i] + (n[2 * i + 1] << 8)
  }
  o[15] &= 0x7fff
}

/**
 * @param {Float64Array} o
 * @param {Float64Array} i
 * @private
 * @internal
 */
function pow2523 (o: Float64Array, i: Float64Array): void {
  const c = new Float64Array(16)
  c.set(i)
  for (let a = 250; a >= 0; a--) {
    fnS(c, c)
    if (a !== 1) {
      fnM(c, c, i)
    }
  }
  o.set(c)
}

/**
 * @param {Float64Array} a
 * @param {Float64Array} b
 * @private
 * @internal
 */
function neq25519 (a: Float64Array, b: Float64Array): number {
  const c = new Uint8Array(32)
  const d = new Uint8Array(32)
  pack25519(c, a)
  pack25519(d, b)

  return cryptoVerify32(c, d)
}

export { verify }
