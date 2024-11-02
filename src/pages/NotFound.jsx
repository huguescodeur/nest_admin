import { Link } from "react-router-dom";

const NotFound = () => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
            <h1 className="text-6xl font-bold text-blue-600 mb-4">404</h1>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Page Not Found</h2>
            <p className="text-gray-600 mb-8">
                Oups ! La page que vous recherchez n'existe pas.
            </p>
            <Link
                to="/"
                className="px-6 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium"
            >
                Aller à l'accueil
            </Link>
        </div>
    );
};

export default NotFound;