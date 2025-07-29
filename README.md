# Safe Protocol Kit v6 - Same Address Bug

This repo shows a bug in `@safe-global/protocol-kit` v6.1.0 where different `saltNonce` values always return the same Safe address.

## The Problem

No matter what `saltNonce` or owners you use, the SDK always returns: `0xfb1bffC9d739B8D520DaF37dF666da4C687191EA`

This breaks deterministic Safe deployment.

## Quick Test

```bash
npm install
npm start
```

## Expected vs Actual

**Expected** (different salt = different address):
```
Salt: 123 → Address: 0xAAA...
Salt: 456 → Address: 0xBBB...
Salt: 789 → Address: 0xCCC...
```

**Actual** (all return same address):
```
Salt: 123 → Address: 0xfb1bffC9d739B8D520DaF37dF666da4C687191EA
Salt: 456 → Address: 0xfb1bffC9d739B8D520DaF37dF666da4C687191EA  
Salt: 789 → Address: 0xfb1bffC9d739B8D520DaF37dF666da4C687191EA
```

## Setup

1. Create `.env` file:
```env
ETHEREUM_RPC_URL=https://sepolia.drpc.org
SAFE_SERVICE_URL=https://safe-transaction-sepolia.safe.global
PRIVATE_KEY_1=0xa2a8b53ac0eb3b5d8ddd98ac41bb6ffb785f6350fb8f7c5c68a92c3f91ac8256
PRIVATE_KEY_2=0xa01ce7985a1554105df39d7ec9418792343647d7372255dc1e61aef0b2454673
PRIVATE_KEY_3=0xce330e938b8523299b6beff3a790360f306900b782dea6652fac3683efd6bed1
```

2. Run test:
```bash
npm start
```

## Generate Your Own Test Keys

```bash
node -e "
const ethers = require('ethers');
const crypto = require('crypto');

for(let i = 0; i < 3; i++) {
  const randomBytes = crypto.randomBytes(32);
  const wallet = new ethers.Wallet(randomBytes);
  console.log(\`PRIVATE_KEY_\${i+1}=\${wallet.privateKey}\`);
  console.log(\`# Address \${i+1}: \${wallet.address}\`);
}
"
```

## Test Results

✅ Tested with different `saltNonce` values  
✅ Tested with different owners  
✅ Tested with different thresholds  
✅ All return the same address: `0xfb1bffC9d739B8D520DaF37dF666da4C687191EA`

## Environment

- Protocol Kit: `v6.1.0`
- Network: Sepolia Testnet
- Ethers: `v5.7.2`

---

**This is a bug reproduction case for GitHub issue submission.**