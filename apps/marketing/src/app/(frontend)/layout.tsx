import type { Metadata } from 'next'
import '../globals.css'

export const metadata: Metadata = {
  title: 'sfdc-lex-out - Marketing',
  description: 'Built with Payload CMS and Next.js',
}

export default function FrontendLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
