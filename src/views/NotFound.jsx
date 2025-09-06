import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="mt-5 w-screen h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-9xl font-extrabold text-red-600 mb-6">404</h1>
        <h2 className="text-4xl font-bold mb-4">Page Not Found</h2>
        <p className="text-lg text-gray-600 mb-8 max-w-xl mx-auto">
          Sorry, the page you’re looking for doesn’t exist or has been moved.
        </p>
        <br />
        <Link
          to="/dashboard/home"
          className="px-4 py-3 bg-blue-600 text-white text-lg font-medium rounded-lg shadow-lg hover:bg-blue-700 transition"
        >
          Go Back Home
        </Link>
      </div>
    </div>
  );
}
