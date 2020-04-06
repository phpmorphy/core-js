'use strict'

const { mnemonicToSeedSync } = require('bip39')
const { SHA3 } = require('sha3')
const nacl = require('tweetnacl')
const bech32 = require('bech32')

Object.defineProperty(exports, '__esModule', { value: true })

const TYPE_GENESIS = 0x00
const TYPE_UMI = 0x01
const TYPE_ROY = 0x02
const DEFAULT_TYPE = TYPE_UMI
const AVAILABLE_TYPES = [TYPE_UMI, TYPE_ROY]

const TAG_GENESIS = 'genesis'
const TAG_UMI = 'umi'
const TAG_ROY = 'roy'
const DEFAULT_TAG = TAG_UMI
const AVAILABLE_TAGS = [TAG_UMI, TAG_ROY]

/**
 * @param {string} address
 * @returns {Buffer}
 */
function addressToBuffer (address) {
  return Buffer.from(bech32.fromWords(bech32.decode(address).words))
}

/**
 * @param {string} sender
 * @param {string} recipient
 * @param {BigInt} value
 * @param {Uint8Array} secretKey
 * @returns {Buffer}
 */
function createTransaction (sender, recipient, value, secretKey) {
  let tx = Buffer.alloc(149)

  // tx type: 0..1
  tx.writeUInt8(TYPE_UMI, 0)

  // sender: 1..35
  addressToBuffer(sender).copy(tx, 1)

  // recipient: 35..69
  addressToBuffer(recipient).copy(tx, 35)

  // value: 69..77
  // tx.writeBigUInt64BE(BigInt(value), 69)
  Buffer.from(value.toString(16).padStart(16, '0'), 'hex').copy(tx, 69)

  // nonce: 77..85
  // tx.writeBigUInt64BE(BigInt(Date.now()), 77)
  Buffer.from(Date.now().toString(16).padStart(16, '0'), 'hex').copy(tx, 77)

  // signature: 85..149
  Buffer.from(nacl.sign.detached(tx.slice(0, 85), secretKey)).copy(tx, 85)

  return tx
}

/**
 * @param {string} mnemonic
 * @param {number} [type=0x1]
 * @param {string} [tag=umi]
 * @returns {string}
 */
function mnemonicToAddress (mnemonic, type, tag) {
  type = type || DEFAULT_TYPE
  tag = tag || DEFAULT_TAG

  let address = Buffer.alloc(34)
  // address type - 2 bytes
  address.writeUInt16BE(type, 0)

  let seed = mnemonicToSeed(mnemonic)
  let pubKey = seedToPublicKey(seed)

  // pubKey - 32 bytes
  Buffer.from(pubKey).copy(address, 2, 0, 34)

  return bech32.encode(tag, bech32.toWords(address))
}

/**
 * @param {string} mnemonic
 * @param {string} [password]
 * @returns {Uint8Array}
 */
function mnemonicToPublicKey (mnemonic, password) {
  return seedToPublicKey(mnemonicToSeed(mnemonic, password))
}

/**
 * @param {string} mnemonic
 * @param {string} [password]
 * @returns {Uint8Array}
 */
function mnemonicToSecretKey (mnemonic, password) {
  return seedToSecretKey(mnemonicToSeed(mnemonic, password))
}

/**
 * @param {string} mnemonic
 * @param {string} [password]
 * @returns {Buffer}
 */
function mnemonicToSeed (mnemonic, password) {
  return new SHA3(256)
    .update(mnemonicToSeedSync(mnemonic, password))
    .digest()
}

/**
 * @param {Buffer} seed
 * @returns {Uint8Array}
 */
function seedToPublicKey (seed) {
  return nacl.sign.keyPair.fromSeed(seed).publicKey
}

/**
 * @param {Buffer} seed
 * @returns {Uint8Array}
 */
function seedToSecretKey (seed) {
  return nacl.sign.keyPair.fromSeed(seed).secretKey
}

/**
 * @param {Buffer} message
 * @param {Uint8Array} secretKey
 * @returns {Buffer}
 */
function sign (message, secretKey) {
  return Buffer.from(nacl.sign.detached(message, secretKey))
}

/**
 * @param address
 * @returns {boolean}
 */
function validateAddress (address) {
  try {
    let adr = addressToBuffer(address)
    if (AVAILABLE_TYPES.indexOf(adr.readUInt16BE(0)) === -1 || adr.length !== 34) {
      return false
    }
  } catch (e) {
    return false
  }

  return true
}

/**
 * @param {Buffer} message
 * @param {Buffer} signature
 * @param {Uint8Array} publicKey
 * @returns {boolean}
 */
function verify (message, signature, publicKey) {
  return nacl.sign.detached.verify(message, signature, publicKey)
}

module.exports = {
  createTransaction: createTransaction,
  mnemonicToAddress: mnemonicToAddress,
  mnemonicToPublicKey: mnemonicToPublicKey,
  mnemonicToSecretKey: mnemonicToSecretKey,
  sign: sign,
  validateAddress: validateAddress,
  verify: verify
}
