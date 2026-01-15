#!/usr/bin/env node
/**
 * Setup Convex - Interactive setup wizard for Convex
 */

import { execSync, spawnSync } from 'child_process'
import { existsSync, readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import * as readline from 'readline'

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectDir = resolve(__dirname, '..')
const backendDir = resolve(projectDir, '../packages/backend')

function loadEnvFile(dir) {
  const envPath = resolve(dir, '.env.local')
  if (!existsSync(envPath)) return {}

  const content = readFileSync(envPath, 'utf-8')
  const env = {}

  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIndex = trimmed.indexOf('=')
    if (eqIndex === -1) continue
    const key = trimmed.slice(0, eqIndex)
    let value = trimmed.slice(eqIndex + 1)
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }
    if (value) env[key] = value
  }
  return env
}

function syncEnvToConvex(envVars) {
  // Required env vars that Better Auth needs in Convex cloud
  const requiredVars = ['BETTER_AUTH_SECRET', 'SITE_URL']

  for (const varName of requiredVars) {
    if (envVars[varName]) {
      try {
        console.log(`   Setting ${varName} in Convex...`)
        execSync(`npx convex env set ${varName} "${envVars[varName]}"`, {
          cwd: backendDir,
          stdio: 'pipe'
        })
      } catch (error) {
        console.warn(`   ⚠️  Could not set ${varName}: ${error.message}`)
      }
    }
  }

  // Optional OAuth env vars - only sync if they have values
  const optionalVars = [
    'GITHUB_CLIENT_ID', 'GITHUB_CLIENT_SECRET',
    'GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET',
    'RESEND_API_KEY', 'RESEND_FROM_EMAIL'
  ]

  for (const varName of optionalVars) {
    if (envVars[varName]) {
      try {
        execSync(`npx convex env set ${varName} "${envVars[varName]}"`, {
          cwd: backendDir,
          stdio: 'pipe'
        })
      } catch (error) {
        // Silent fail for optional vars
      }
    }
  }
}

async function main() {
  console.log('\n🔧 Convex Setup Wizard\n')

  // Check if already configured
  const envPath = resolve(backendDir, '.env.local')
  if (existsSync(envPath)) {
    const content = readFileSync(envPath, 'utf-8')
    if (content.includes('CONVEX_DEPLOYMENT=') && !content.includes('CONVEX_DEPLOYMENT=\n')) {
      console.log('✅ Convex deployment already configured!')

      // Sync env vars even if deployment exists
      console.log('\n📤 Syncing environment variables to Convex cloud...')
      const envVars = loadEnvFile(backendDir)
      syncEnvToConvex(envVars)

      console.log('\n✅ Setup complete!')
      console.log('   Run "pnpm dev" to start development.\n')
      return
    }
  }

  console.log('This wizard will help you set up Convex for your project.\n')

  // Run convex dev to trigger authentication and project creation
  console.log('Running Convex setup (this will open your browser if needed)...\n')

  try {
    spawnSync('npx', ['convex', 'dev', '--once'], {
      cwd: backendDir,
      stdio: 'inherit',
      shell: true
    })

    // After setup, sync env vars to Convex cloud
    console.log('\n📤 Syncing environment variables to Convex cloud...')
    const envVars = loadEnvFile(backendDir)
    syncEnvToConvex(envVars)

    console.log('\n✅ Convex setup complete!')
    console.log('   Run "pnpm dev" to start development.\n')
  } catch (error) {
    console.error('\n❌ Convex setup failed:', error.message)
    console.error('   Try running "npx convex dev" manually.\n')
    process.exit(1)
  }
}

main()
