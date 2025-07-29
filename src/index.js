import { ethers } from 'ethers'
import BasicSafeWallet from './safe-basic.js'

async function runBasicDemo() {
  console.log('🚀 Starting Basic Safe Demo...\n')
  
  const safeWallet = new BasicSafeWallet()
  
  try {
    // Setup
    const { signers } = await safeWallet.setup()
    
    console.log('📍 Signer addresses:')
    signers.forEach((signer, i) => {
      console.log(`  Owner ${i + 1}: ${signer.address}`)
    })
    
    // Create new Safe (comment out if you have an existing one)
    const safeAddress = await safeWallet.createSafeWallet(signers[0])
    
    // Or connect to existing Safe (uncomment and add your address)
    // const safeAddress = 'YOUR_EXISTING_SAFE_ADDRESS'
    // await safeWallet.connectToExistingSafe(signers[0], safeAddress)
    
    console.log('\n💡 Safe wallet setup complete!')
    console.log('🔗 Safe address:', safeAddress)
    console.log('\n📝 Next steps:')
    console.log('1. Send some Sepolia ETH to the Safe address')
    console.log('2. Uncomment the transaction creation code below')
    console.log('3. Run the demo again to test transactions')
    
    // Uncomment below to test transactions (after funding the Safe)
    // Create and execute a transaction
    // const transaction = await safeWallet.createTransaction(
    //   '0x1234567890123456789012345678901234567890', // recipient
    //   ethers.utils.parseEther('0.001').toString(), // 0.001 ETH
    //   '0x' // no data
    // )
    
    // // Sign and execute
    // await safeWallet.signAndExecuteTransaction(transaction, signers)
    
    // // Get transaction history
    // await safeWallet.getTransactionHistory()
    
  } catch (error) {
    console.error('❌ Error in basic demo:', error.message)
    console.error('Stack:', error.stack)
  }
}

// Test imports first
async function testImports() {
  console.log('🔍 Testing imports...')
  
  try {
    console.log('✅ Ethers:', ethers.version)
    console.log('✅ BasicSafeWallet imported successfully')
    
    // Test if we can create a basic wallet
    const wallet = ethers.Wallet.createRandom()
    console.log('✅ Can create wallet:', wallet.address)
    
    return true
  } catch (error) {
    console.error('❌ Import test failed:', error.message)
    return false
  }
}

// Main function
async function main() {
  console.log('🎯 Safe Protocol Kit Demo\n')
  
  // Test imports first
  const importsOk = await testImports()
  if (!importsOk) {
    console.log('❌ Please fix imports before continuing')
    return
  }
  
  console.log('\n' + '='.repeat(50) + '\n')
  
  // Run the actual demo
  await runBasicDemo()
}

main().catch(console.error)