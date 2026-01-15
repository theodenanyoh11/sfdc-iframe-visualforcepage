#!/usr/bin/env node
/**
 * Dev Script - Starts Next.js and Convex dev servers
 */

import { spawn, execSync } from 'child_process'
import { existsSync, readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = resolve(__dirname, '..')
const webAppDir = resolve(rootDir, 'apps/web')
const backendDir = resolve(rootDir, 'packages/backend')

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

function syncEnvToWebApp() {
  // In monorepo, Convex creates .env.local in backend package
  // Web app needs NEXT_PUBLIC_CONVEX_URL and NEXT_PUBLIC_CONVEX_SITE_URL
  const backendEnv = loadEnvFile(backendDir)
  const webEnvPath = resolve(webAppDir, '.env.local')

  if (backendEnv.NEXT_PUBLIC_CONVEX_URL) {
    const webEnv = loadEnvFile(webAppDir)
    // Derive site URL from cloud URL (.convex.cloud -> .convex.site)
    const convexSiteUrl = backendEnv.NEXT_PUBLIC_CONVEX_URL.replace('.convex.cloud', '.convex.site')

    // Check if sync is needed
    const needsSync = webEnv.NEXT_PUBLIC_CONVEX_URL !== backendEnv.NEXT_PUBLIC_CONVEX_URL ||
                      webEnv.NEXT_PUBLIC_CONVEX_SITE_URL !== convexSiteUrl

    if (needsSync) {
      let content = ''
      if (existsSync(webEnvPath)) {
        content = readFileSync(webEnvPath, 'utf-8')
        // Remove existing lines
        content = content.split('\n')
          .filter(line => !line.startsWith('NEXT_PUBLIC_CONVEX_URL=') && !line.startsWith('NEXT_PUBLIC_CONVEX_SITE_URL='))
          .join('\n')
        if (content && !content.endsWith('\n')) content += '\n'
      }
      content += `NEXT_PUBLIC_CONVEX_URL=${backendEnv.NEXT_PUBLIC_CONVEX_URL}\n`
      content += `NEXT_PUBLIC_CONVEX_SITE_URL=${convexSiteUrl}\n`
      writeFileSync(webEnvPath, content)
      console.log('✓ Synced Convex URLs to web app\n')
    }
  }

  return backendEnv
}

async function checkAndInstall() {
  if (!existsSync(resolve(rootDir, 'node_modules'))) {
    console.log('📦 Installing dependencies...\n')
    execSync('pnpm install', { cwd: rootDir, stdio: 'inherit' })
  }
}

function syncEnvToConvex(envVars) {
  // Sync required env vars to Convex cloud (only if not already synced)
  const requiredVars = ['BETTER_AUTH_SECRET', 'SITE_URL']
  let needsSync = false

  // Check if env vars need syncing by trying to list them
  try {
    const result = execSync('npx convex env list', { cwd: backendDir, stdio: 'pipe' }).toString()
    for (const varName of requiredVars) {
      if (envVars[varName] && !result.includes(varName + '=')) {
        needsSync = true
        break
      }
    }
  } catch {
    needsSync = true
  }

  if (needsSync) {
    console.log('📤 Syncing environment variables to Convex cloud...\n')
    for (const varName of requiredVars) {
      if (envVars[varName]) {
        try {
          execSync(`npx convex env set ${varName} "${envVars[varName]}"`, {
            cwd: backendDir,
            stdio: 'pipe'
          })
          console.log(`   ✓ ${varName}\n`)
        } catch (error) {
          console.warn(`   ⚠️  Could not set ${varName}\n`)
        }
      }
    }
  }
}

function startDevServers() {
  const backendEnv = syncEnvToWebApp()

  if (!backendEnv.CONVEX_DEPLOYMENT) {
    console.log('⚠️  Convex not configured. Run: pnpm dev:setup\n')
    console.log('Starting Next.js only...\n')
    spawn('pnpm', ['dev:web'], {
      cwd: rootDir, stdio: 'inherit', shell: true
    })
    return
  }

  // Sync env vars to Convex cloud if needed
  syncEnvToConvex(backendEnv)

  console.log('🚀 Starting development servers...\n')
  spawn('pnpm', ['dev:all'], {
    cwd: rootDir, stdio: 'inherit', shell: true
  })
}

async function main() {
  await checkAndInstall()
  startDevServers()
}

main()
