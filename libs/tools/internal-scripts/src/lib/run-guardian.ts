/** libs/tools/internal-scripts/src/lib/run-guardian.ts */

import { SchemaGuardian } from './schema-guardian.apparatus';

async function runGuardian() {
  console.log('--- 🛡️ SCHEMA GUARDIAN AUDIT START ---');
  const report = await SchemaGuardian.auditIntegrity();
  
  if (report.missing.length > 0) {
    console.error('❌ INTEGRITY BREACH DETECTED:');
    report.missing.forEach(msg => console.error(`  - ${msg}`));
    process.exit(1);
  }
  
  console.log(`✅ ALL ${report.total} APPARATUSES ARE VALIDATED BY SCHEMAS.`);
  process.exit(0);
}

runGuardian();