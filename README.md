# umi-core-js
UMI Core JavaScript Library

### Install

    npm i @umi-top/umi-core-js

### Import
Import as CommonJS:
```javascript
const umi = require('@umi-top/umi-core-js')
const bip39 = require('bip39')
```
Import as ES6 / ES2015 Module
```javascript
import * as umi from '@umi-top/umi-core-js'
import * as bip39 from 'bip39'
```

Import as UMD in Browser
```html
<script src="bip39.browser.js"></script>
<script src="lib/index.min.js"></script>
```

### Addresses
Create Address from Mnemonic
```javascript
const mnemonic = 'mix tooth like stock powder emerge protect index magic'
const seed = bip39.mnemonicToSeedSync(mnemonic)
const secKey = umi.SecretKeyFactory.fromSeed(seed)
const pubKey = secKey.publicKey
const address = new umi.Address().setPublicKey(pubKey)

console.log(address.bech32) // umi1u3dam33jaf64z4s008g7su62j4za72ljqff9dthsataq8k806nfsgrhdhg

```
Change Address Prefix
```javascript
const bech32 = 'umi1kzsn227tel8aj5p5upaecz7e72k3k8w0lel3lffrnvg3d5rkh5uq3a8598'

const address = new umi.Address()
address.bech32 = bech32
address.prefix = 'sss'

console.log(address.bech32) // sss1kzsn227tel8aj5p5upaecz7e72k3k8w0lel3lffrnvg3d5rkh5uqv9z0az
```

### Transactions
Basic Transaction
```javascript
const mnemonic = 'mix tooth like stock powder emerge protect index magic'
const bech32 = 'xxx1hztcwh6rh63ftkw8y8cwt63n4256u3packsxh05wv5x5cpa79raqyf98d5'

const seed = bip39.mnemonicToSeedSync(mnemonic)
const secKey = umi.SecretKeyFactory.fromSeed(seed)
const sender = new umi.Address().setPublicKey(secKey.publicKey)
const recpient = new umi.Address().fromBech32(bech32).setPrefix('yyy')
const tx1 = new umi.Transaction()
  .setVersion(umi.TransactionVersions.Basic)
  .setSender(sender)
  .setRecipient(recpient)
  .setValue(9007199254740991)
  .sign(secKey)

const tx2 = new umi.Transaction(tx1.bytes)

console.log({
  'version': tx2.version,
  'sender': tx2.sender.bech32,
  'recipient': tx2.recipient.bech32,
  'value': tx2.value,
  'signature': Buffer.from(tx2.signature).toString('hex'),
  'verify': tx2.verify()
})
```
Create Structure
```javascript
const mnemonic = 'mix tooth like stock powder emerge protect index magic'
const seed = bip39.mnemonicToSeedSync(mnemonic)
const secKey = umi.SecretKeyFactory.fromSeed(seed)

const tx1 = new umi.Transaction().
  setVersion(umi.TransactionVersions.CreateStructure).
  setSender(new umi.Address().setPublicKey(secKey.publicKey)).
  setPrefix('www').
  setName('World Wide Web').
  setProfitPercent(456). // 4.56%
  setFeePercent(1234).  // 12.34%
  sign(secKey)

const tx2 = new umi.Transaction(tx1.bytes)

console.log({
  'version': tx2.version,
  'sender': tx2.sender.bech32,
  'prefix': tx2.prefix,
  'name': tx2.name,
  'profit': tx2.profitPercent / 100,
  'fee': tx2.feePercent / 100,
  'verify': tx2.verify(),
})
```
Create Transit Address
```javascript

const mnemonic = 'mix tooth like stock powder emerge protect index magic'
const seed = bip39.mnemonicToSeedSync(mnemonic)
const secKey = umi.SecretKeyFactory.fromSeed(seed)

const sender = new umi.Address()
sender.publicKey = secKey.publicKey

const address = new umi.Address()
address.bech32 = 'www1hztcwh6rh63ftkw8y8cwt63n4256u3packsxh05wv5x5cpa79raq9g5cvs'

const tx1 = new umi.Transaction()
tx1.version = umi.TransactionVersions.CreateTransitAddress
tx1.sender = sender
tx1.recipient = address
tx1.sign(secKey)

const tx2 = new umi.Transaction(tx1.bytes)

console.log({
  'version': tx2.version,
  'sender': tx2.sender.bech32,
  'prefix': tx2.prefix,
  'address': tx2.recipient.bech32,
  'verify': tx2.verify(),
})
```