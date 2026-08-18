// src/app/page.tsx
export default function HomePage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold">Welcome to My SaaS</h1>
        <p className="mt-4 text-lg text-gray-600">
          Your multi‑tenant workspace is ready.
        </p>
        <div className="mt-6 space-x-4">
          <a href="/login" className="px-4 py-2 bg-blue-600 text-white rounded">
            Login
          </a>
          <a
            href="/signup"
            className="px-4 py-2 bg-green-600 text-white rounded"
          >
            Sign Up
          </a>
        </div>
      </div>
    </div>
  );
}
