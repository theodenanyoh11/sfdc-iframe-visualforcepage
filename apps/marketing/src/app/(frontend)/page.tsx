import { getPayload } from 'payload'
import config from '@/payload.config'

export default async function HomePage() {
  // Check if DATABASE_URL is configured
  if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('[PASSWORD]')) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Welcome to Your Marketing Site
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Built with Payload CMS and Next.js
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-left">
              <h2 className="text-lg font-semibold text-amber-800 mb-2">
                Database Setup Required
              </h2>
              <p className="text-amber-700 mb-4">
                To get started, configure your PostgreSQL database:
              </p>
              <ol className="list-decimal list-inside text-amber-700 space-y-2">
                <li>Create a Supabase project at <a href="https://supabase.com" className="underline" target="_blank" rel="noopener noreferrer">supabase.com</a></li>
                <li>Copy your database connection string</li>
                <li>Update <code className="bg-amber-100 px-1 rounded">DATABASE_URL</code> in <code className="bg-amber-100 px-1 rounded">apps/marketing/.env.local</code></li>
                <li>Restart the development server</li>
              </ol>
            </div>
            <div className="mt-8">
              <a
                href="/admin"
                className="inline-flex items-center px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                Go to Admin Panel
              </a>
            </div>
          </div>
        </div>
      </main>
    )
  }

  try {
    const payload = await getPayload({ config })

    const settings = await payload.findGlobal({
      slug: 'site-settings',
    })

    return (
      <main className="min-h-screen">
        <div className="container mx-auto px-4 py-16">
          <h1 className="text-4xl font-bold">{settings.siteName || 'Marketing Site'}</h1>
          <p className="mt-4 text-lg text-gray-600">{settings.siteDescription || 'Built with Payload CMS'}</p>
        </div>
      </main>
    )
  } catch (error) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-red-50 to-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Database Connection Error
            </h1>
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-left">
              <p className="text-red-700 mb-4">
                Could not connect to the database. Please check your configuration:
              </p>
              <ul className="list-disc list-inside text-red-700 space-y-2">
                <li>Verify <code className="bg-red-100 px-1 rounded">DATABASE_URL</code> is correct</li>
                <li>Ensure your database is running and accessible</li>
                <li>Check that the database credentials are valid</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    )
  }
}
