import crypto from 'crypto'
import nacl from 'tweetnacl'
import { SecretKeyInterface } from './SecretKeyInterface'
import { SecretKey } from './ed25519/SecretKey'

export class SecretKeyFactory {
  static fromSeed (seed: Uint8Array): SecretKeyInterface {
    if (seed.byteLength === nacl.sign.seedLength) {
      return new SecretKey(nacl.sign.keyPair.fromSeed(seed).secretKey)
    }

    return new SecretKey(
      nacl.sign.keyPair.fromSeed(
        new Uint8Array(crypto.createHash('sha256').update(seed).digest().buffer,
        )).secretKey,
    )
  }
}
