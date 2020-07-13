import { sha512 } from '../sha512'
import { arrayConcat, arraySet, arraySlice } from '../array'
import { gf0, gf1, reduce, modL, scalarbase, pack, scalarmult, add, fnA, fnM, fnZ, pack25519, par25519 } from './common'

const D: number[] = [
  0x78a3, 0x1359, 0x4dca, 0x75eb, 0xd8ab, 0x4141, 0x0a4d, 0x0070,
  0xe898, 0x7779, 0x4079, 0x8cc7, 0xfe73, 0x2b6f, 0x6cee, 0x5203]

const I: number[] = [
  0xa0b0, 0x4a0e, 0x1b27, 0xc4ee, 0xe478, 0xad2f, 0x1806, 0x2f43,
  0xd7a7, 0x3dfb, 0x0099, 0x2b4d, 0xdf0b, 0x4fc1, 0x2480, 0x2b83]

/**
 * @param {ArrayLike<number>} seed
 * @returns {number[]}
 * @private
 * @internal
 */
function secretKeyFromSeed (seed: ArrayLike<number>): number[] {
  const pk: number[] = []
  const p: number[][] = [[], [], [], []]

  const d = sha512(seed)
  d[0] &= 248
  d[31] &= 127
  d[31] |= 64

  scalarbase(p, d)
  pack(pk, p)

  return arrayConcat(seed, pk)
}

/**
 * @param {ArrayLike<number>} message
 * @param {ArrayLike<number>} secretKey
 * @returns {number[]}
 * @private
 * @internal
 */
function sign (message: ArrayLike<number>, secretKey: ArrayLike<number>): number[] {
  const d = sha512(arraySlice(secretKey, 0, 32))
  d[0] &= 248
  d[31] &= 127
  d[31] |= 64

  const sm = d.slice(0)
  arraySet(sm, message, 64)

  const r = sha512(sm.slice(32))
  reduce(r)

  const p: number[][] = [[], [], [], []]
  scalarbase(p, r)
  pack(sm, p)

  arraySet(sm, arraySlice(secretKey, 32), 32)

  const h = sha512(sm)
  reduce(h)

  for (let i = 0; i < 32; i++) {
    for (let j = 0; j < 32; j++) {
      r[i + j] += h[i] * d[j]
    }
  }

  return arrayConcat(sm.slice(0, 32), modL(sm.slice(32), r).slice(0, 32))
}

/**
 * @param {ArrayLike<number>} signature
 * @param {ArrayLike<number>} message
 * @param {ArrayLike<number>} pubKey
 * @returns {boolean}
 * @private
 * @internal
 */
function verify (signature: ArrayLike<number>, message: ArrayLike<number>, pubKey: ArrayLike<number>): boolean {
  const sm: number[] = []
  const t: number[] = []
  const p: number[][] = [[], [], [], []]
  const q: number[][] = [[], [], [], []]

  /** @istanbul ignore if */
  if (!unpackneg(q, arraySlice(pubKey))) {
    return false
  }

  arraySet(sm, signature, 0)
  arraySet(sm, message, 64)

  const m = sm.slice(0)
  arraySet(m, pubKey, 32)

  const h = sha512(m)
  reduce(h)

  scalarmult(p, q, h)
  scalarbase(q, sm.slice(32))
  add(p, q)
  pack(t, p)

  return cryptoVerify32(sm, t)
}

/**
 * @param {number[][]} r
 * @param {number[]} p
 * @returns {boolean}
 * @private
 * @internal
 */
function unpackneg (r: number[][], p: number[]): boolean {
  const t: number[] = []
  const chk: number[] = []
  const num: number[] = []
  const den: number[] = []
  const den2: number[] = []
  const den4: number[] = []
  const den6: number[] = []

  arraySet(r[2], gf1)
  unpack25519(r[1], p)
  fnM(num, r[1], r[1])
  fnM(den, num, D)
  fnZ(num, num, r[2])
  fnA(den, r[2], den)

  fnM(den2, den, den)
  fnM(den4, den2, den2)
  fnM(den6, den4, den2)
  fnM(t, den6, num)
  fnM(t, t, den)

  pow2523(t, t)
  fnM(t, t, num)
  fnM(t, t, den)
  fnM(t, t, den)
  fnM(r[0], t, den)
  fnM(chk, r[0], r[0])
  fnM(chk, chk, den)

  if (!neq25519(chk, num)) {
    fnM(r[0], r[0], I)
  }

  fnM(chk, r[0], r[0])
  fnM(chk, chk, den)

  /** @istanbul ignore if */
  if (!neq25519(chk, num)) {
    return false
  }

  if (par25519(r[0]) === (p[31] >> 7)) {
    fnZ(r[0], gf0, r[0])
  }

  fnM(r[3], r[0], r[1])

  return true
}

/**
 * @param {number[]} x
 * @param {number[]} y
 * @returns {boolean}
 * @private
 * @internal
 */
function cryptoVerify32 (x: number[], y: number[]): boolean {
  let d = 0
  for (let i = 0; i < 32; i++) {
    d |= x[i] ^ y[i]
  }

  return (1 & ((d - 1) >>> 8)) === 1
}

/**
 * @param {number[]} o
 * @param {number[]} n
 * @private
 * @internal
 */
function unpack25519 (o: number[], n: number[]): void {
  for (let i = 0; i < 16; i++) {
    o[i] = n[2 * i] + (n[2 * i + 1] << 8)
  }
  o[15] &= 0x7fff
}

/**
 * @param {number[]} o
 * @param {number[]} i
 * @private
 * @internal
 */
function pow2523 (o: number[], i: number[]): void {
  const c: number[] = []
  let a

  for (a = 0; a < 16; a++) {
    c[a] = i[a]
  }

  for (a = 250; a >= 0; a--) {
    fnM(c, c, c)
    if (a !== 1) {
      fnM(c, c, i)
    }
  }

  for (a = 0; a < 16; a++) {
    o[a] = c[a]
  }
}

/**
 * @param {number[]} a
 * @param {number[]} b
 * @throws {boolean}
 * @private
 * @internal
 */
function neq25519 (a: number[], b: number[]): boolean {
  const c: number[] = []
  const d: number[] = []
  pack25519(c, a)
  pack25519(d, b)

  return cryptoVerify32(c, d)
}

export { sign, verify, secretKeyFromSeed }
