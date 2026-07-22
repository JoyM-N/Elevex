/**
 * Auth Layout
 *
 * Wraps all authentication pages.
 * Centers content on the screen with a clean card design.
 * Completely separate from the dashboard layout.
 */
export default function AuthLayout({
    children,
  }: {
    children: React.ReactNode
  }) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Elevex</h1>
            <p className="text-gray-500 text-sm mt-1">Internship Management System</p>
          </div>
  
          {/* Page content */}
          {children}
        </div>
      </div>
    )
  }