#!/usr/bin/env node

/**
 * Generate CSP configuration from centralized RPC endpoints
 * This script automatically updates vercel.json with the correct CSP headers
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { generateCSPConnectSrc } from '../src/lib/config/rpcEndpoints.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function generateCSP() {
  try {
    // Generate the connect-src directive
    const connectSrc = generateCSPConnectSrc();
    
    // Read current vercel.json
    const vercelPath = join(__dirname, '..', 'vercel.json');
    const vercelConfig = JSON.parse(readFileSync(vercelPath, 'utf8'));
    
    // Update the CSP value
    const headers = vercelConfig.headers[0].headers;
    const cspHeader = headers.find(h => h.key === 'Content-Security-Policy');
    
    if (cspHeader) {
      // Replace the connect-src part of the CSP
      const currentCSP = cspHeader.value;
      const newCSP = currentCSP.replace(
        /connect-src [^;]+/,
        `connect-src ${connectSrc}`
      );
      cspHeader.value = newCSP;
      
      // Write back to vercel.json
      writeFileSync(vercelPath, JSON.stringify(vercelConfig, null, 2));
      
      console.log('✅ CSP configuration updated successfully!');
      console.log('📝 Updated connect-src directive:');
      console.log(`   ${connectSrc}`);
    } else {
      console.error('❌ Could not find Content-Security-Policy header in vercel.json');
    }
    
  } catch (error) {
    console.error('❌ Error generating CSP:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateCSP();
}

export { generateCSP }; 