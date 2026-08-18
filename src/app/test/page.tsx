export default function TestPage() {
  return (
    <div className="min-h-screen bg-blue-500 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-2xl">
        <h1 className="text-3xl font-bold text-gray-800">
          Tailwind is Working! 🎉
        </h1>
        <p className="text-gray-600 mt-2">
          If you see this with a blue background, CSS is loaded.
        </p>
      </div>
    </div>
  );
}
