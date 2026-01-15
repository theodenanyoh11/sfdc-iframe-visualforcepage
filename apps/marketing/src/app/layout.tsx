// Root layout is minimal - each route group has its own complete layout
// This prevents nested <html>/<body> tags between frontend and Payload admin
// CSS is imported in each route group's layout to avoid style conflicts
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
