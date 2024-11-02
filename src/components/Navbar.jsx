import React from 'react'
import { Home, User } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";

function Navbar() {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();
    return (
        <nav className="bg-white shadow">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link
                            to="/Dashboard"
                        >
                            <Home className="h-8 w-8 text-blue-500" />
                        </Link>
                        <h1 className="ml-2 text-xl font-bold">Tableau de bord des propriétés</h1>
                    </div>
                    <div className="flex items-center space-x-4">
                        <span className="text-gray-600">{currentUser.email}</span>
                        <Link
                            to="/profile"
                            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                        >
                            <User className="h-5 w-5 mr-1" />
                            Mon Profil
                        </Link>
                        <button
                            onClick={() => logout().then(() => navigate("/login"))}
                            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                        >
                            Déconnexion
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    )
}

export default Navbar