#!/usr/bin/env node

/**
 * Script per eseguire i test del backend
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

function runCommand(command, options = {}) {
  try {
    console.log(`\n🔄 Eseguendo: ${command}`);
    const result = execSync(command, { 
      stdio: 'inherit', 
      cwd: __dirname,
      ...options 
    });
    return result;
  } catch (error) {
    console.error(`❌ Errore durante l'esecuzione di: ${command}`);
    console.error(error.message);
    process.exit(1);
  }
}

function checkNodeModules() {
  const nodeModulesPath = path.join(__dirname, 'node_modules');
  return fs.existsSync(nodeModulesPath);
}

function main() {
  console.log('🧪 Setup e esecuzione test backend per PLAYED\n');
  
  // Controlla se node_modules esiste
  if (!checkNodeModules()) {
    console.log('📦 Installazione dipendenze...');
    runCommand('npm install');
  } else {
    console.log('✅ Dipendenze già installate');
  }
  
  // Mostra informazioni sui test
  console.log('\n📋 Informazioni sui test:');
  console.log('- Test per ProgressService (calcolo punti, livelli, statistiche)');
  console.log('- Test per TrophyService (sblocco trofei, obiettivi)');
  console.log('- Test per modelli (User, Progress, Trophy)');
  console.log('- Test per utilità (constraints, validazioni)');
  
  // Esegui i test
  console.log('\n🏃‍♂️ Esecuzione test...');
  
  const args = process.argv.slice(2);
  let testCommand = 'npm test';
  
  if (args.includes('--watch')) {
    testCommand = 'npm run test:watch';
  } else if (args.includes('--coverage')) {
    testCommand = 'npm run test:coverage';
  }
  
  runCommand(testCommand);
  
  console.log('\n✅ Test completati con successo!');
  console.log('\n💡 Comandi utili:');
  console.log('  node run-tests.js --watch     # Modalità watch');
  console.log('  node run-tests.js --coverage  # Con coverage report');
  console.log('  npm test                      # Test singolo');
}

if (require.main === module) {
  main();
}

module.exports = { runCommand, checkNodeModules };
