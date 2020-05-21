import nacl from 'tweetnacl'
import { SecretKeyInterface } from '../SecretKeyInterface'
import { PublicKeyInterface } from '../PublicKeyInterface'
import { PublicKey } from './PublicKey'

export class SecretKey implements SecretKeyInterface {
  private readonly _bytes: Uint8Array = new Uint8Array(
    nacl.sign.secretKeyLength)

  constructor (bytes: Uint8Array) {
    this._bytes.set(bytes)
  }

  get bytes (): Uint8Array {
    const b = new Uint8Array(this._bytes.byteLength)
    b.set(this._bytes)
    return b
  }

  get publicKey (): PublicKeyInterface {
    return new PublicKey(nacl.sign.keyPair.fromSecretKey(this._bytes).publicKey)
  }

  sign (message: Uint8Array): Uint8Array {
    return nacl.sign.detached(message, this._bytes)
  }
}