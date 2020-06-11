import nacl from 'tweetnacl'
import { SecretKeyInterface } from './SecretKeyInterface'
import { SecretKey } from './ed25519/SecretKey'
import { sha256 } from '../util'

export class SecretKeyFactory {
  static fromSeed (seed: Uint8Array): SecretKeyInterface {
    if (seed.byteLength === nacl.sign.seedLength) {
      return new SecretKey(nacl.sign.keyPair.fromSeed(seed).secretKey)
    }

    return new SecretKey(
      nacl.sign.keyPair.fromSeed(sha256(seed)).secretKey,
    )
  }
}
