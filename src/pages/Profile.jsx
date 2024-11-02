// import { useState, useEffect } from "react";
// import { useAuth } from "../contexts/AuthContext";
// import { firestore } from "../firebase";
// import { doc, getDoc, updateDoc } from "firebase/firestore";
// import { useNavigate } from "react-router-dom";
// import Navbar from './../components/Navbar';

// const Profile = () => {
//     const [formData, setFormData] = useState({
//         name: "",
//         email: "",
//         phone: "",
//         contactWhatsapp: "",
//     });
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState("");
//     const { currentUser } = useAuth();
//     const navigate = useNavigate();

//     useEffect(() => {
//         const fetchUserData = async () => {
//             try {
//                 const userDoc = await getDoc(doc(firestore, "users", currentUser.uid));
//                 if (userDoc.exists()) {
//                     setFormData(userDoc.data());
//                 }
//             } catch (error) {
//                 console.error("Error fetching user data:", error);
//                 setError("Failed to load user data.");
//             } finally {
//                 setLoading(false);
//             }
//         };
//         fetchUserData();
//     }, [currentUser.uid]);

//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         setFormData((prev) => ({
//             ...prev,
//             [name]: value,
//         }));
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setLoading(true);
//         try {
//             await updateDoc(doc(firestore, "users", currentUser.uid), formData);
//             alert("Profile updated successfully!");
//             navigate("/dashboard");
//         } catch (error) {
//             console.error("Error updating profile:", error);
//             setError("Failed to update profile.");
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <div className="min-h-screen bg-gray-100">
//             <Navbar />
//             <div className="mt-12 bg-gray-100 flex items-center justify-center">

//                 <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
//                     <h2 className="text-2xl font-bold mb-6">Mon Profil</h2>
//                     {error && <div className="text-red-600 mb-4">{error}</div>}
//                     {loading ? (
//                         <div className="text-center">Loading...</div>
//                     ) : (
//                         <form onSubmit={handleSubmit}>
//                             <div className="mb-4">
//                                 <label className="block text-sm font-medium text-gray-700">Nom</label>
//                                 <input
//                                     type="text"
//                                     name="name"
//                                     value={formData.name}
//                                     onChange={handleChange}
//                                     className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
//                                 />
//                             </div>
//                             <div className="mb-4">
//                                 <label className="block text-sm font-medium text-gray-700">Email</label>
//                                 <input
//                                     type="email"
//                                     name="email"
//                                     value={formData.email}
//                                     onChange={handleChange}
//                                     className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
//                                 />
//                             </div>
//                             <div className="mb-4">
//                                 <label className="block text-sm font-medium text-gray-700">Téléphone</label>
//                                 <input
//                                     type="text"
//                                     name="phone"
//                                     value={formData.phone}
//                                     onChange={handleChange}
//                                     className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
//                                 />
//                             </div>
//                             <div className="mb-4">
//                                 <label className="block text-sm font-medium text-gray-700">Contact WhatsApp</label>
//                                 <input
//                                     type="text"
//                                     name="contactWhatsapp"
//                                     value={formData.contactWhatsapp}
//                                     onChange={handleChange}
//                                     className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
//                                 />
//                             </div>
//                             <div className="flex justify-end">
//                                 <button
//                                     type="submit"
//                                     className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
//                                     disabled={loading}
//                                 >
//                                     {loading ? "Updating..." : "Mettre à jour"}
//                                 </button>
//                             </div>
//                         </form>
//                     )}
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default Profile;

// import { useState, useEffect } from "react";
// import { useAuth } from "../contexts/AuthContext";
// import { firestore } from "../firebase";
// import { doc, getDoc, updateDoc } from "firebase/firestore";
// import { useNavigate } from "react-router-dom";
// import Navbar from './../components/Navbar';
// import {
//     updateEmail,
//     EmailAuthProvider,
//     reauthenticateWithCredential,
//     verifyBeforeUpdateEmail
// } from "firebase/auth";

// const Profile = () => {
//     const [formData, setFormData] = useState({
//         name: "",
//         email: "",
//         phone: "",
//         contactWhatsapp: "",
//     });
//     const [password, setPassword] = useState("");
//     const [showPasswordModal, setShowPasswordModal] = useState(false);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState("");
//     const [message, setMessage] = useState("");
//     const { currentUser } = useAuth();
//     const navigate = useNavigate();

//     useEffect(() => {
//         const fetchUserData = async () => {
//             try {
//                 const userDoc = await getDoc(doc(firestore, "users", currentUser.uid));
//                 if (userDoc.exists()) {
//                     setFormData(userDoc.data());
//                 }
//             } catch (error) {
//                 console.error("Error fetching user data:", error);
//                 setError("Failed to load user data.");
//             } finally {
//                 setLoading(false);
//             }
//         };
//         fetchUserData();
//     }, [currentUser.uid]);

//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         setFormData((prev) => ({
//             ...prev,
//             [name]: value,
//         }));
//     };

//     const reauthenticateUser = async (password) => {
//         const credential = EmailAuthProvider.credential(
//             currentUser.email,
//             password
//         );
//         await reauthenticateWithCredential(currentUser, credential);
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setLoading(true);
//         setError("");
//         setMessage("");

//         try {
//             // Si l'email a été modifié
//             if (formData.email !== currentUser.email) {
//                 if (!password) {
//                     setShowPasswordModal(true);
//                     setLoading(false);
//                     return;
//                 }

//                 // Réauthentifier l'utilisateur
//                 await reauthenticateUser(password);

//                 // Envoyer l'email de vérification pour le nouvel email
//                 await verifyBeforeUpdateEmail(currentUser, formData.email);

//                 setMessage("Un email de vérification a été envoyé à " + formData.email + ". Veuillez vérifier votre nouvel email avant de continuer.");

//                 // Nous gardons l'ancien email dans le formulaire jusqu'à la vérification
//                 setFormData(prev => ({
//                     ...prev,
//                     email: currentUser.email // Remettre l'ancien email
//                 }));
//             }

//             // Mettre à jour les autres données dans Firestore
//             const updateData = {
//                 ...formData,
//                 email: currentUser.email // Utiliser l'email actuel
//             };

//             await updateDoc(doc(firestore, "users", currentUser.uid), updateData);

//             if (!message) { // Si nous n'avons pas déjà un message d'email
//                 setMessage("Profil mis à jour avec succès!");
//             }

//             setShowPasswordModal(false);
//             setPassword("");

//             // Ne pas rediriger si nous attendons une vérification d'email
//             if (formData.email === currentUser.email) {
//                 navigate("/dashboard");
//             }
//         } catch (error) {
//             console.error("Error updating profile:", error);
//             if (error.code === 'auth/requires-recent-login') {
//                 setError("Veuillez ré-entrer votre mot de passe pour mettre à jour votre email.");
//                 setShowPasswordModal(true);
//             } else if (error.code === 'auth/invalid-email') {
//                 setError("L'adresse email n'est pas valide.");
//             } else if (error.code === 'auth/email-already-in-use') {
//                 setError("Cette adresse email est déjà utilisée.");
//             } else {
//                 setError(error.message);
//             }
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <div className="min-h-screen bg-gray-100">
//             <Navbar />
//             <div className="mt-12 bg-gray-100 flex items-center justify-center">
//                 <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
//                     <h2 className="text-2xl font-bold mb-6">Mon Profil</h2>
//                     {error && <div className="text-red-600 mb-4">{error}</div>}
//                     {message && <div className="text-green-600 mb-4">{message}</div>}
//                     {loading ? (
//                         <div className="text-center">Loading...</div>
//                     ) : (
//                         <form onSubmit={handleSubmit}>
//                             <div className="mb-4">
//                                 <label className="block text-sm font-medium text-gray-700">Nom</label>
//                                 <input
//                                     type="text"
//                                     name="name"
//                                     value={formData.name}
//                                     onChange={handleChange}
//                                     className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
//                                 />
//                             </div>
//                             <div className="mb-4">
//                                 <label className="block text-sm font-medium text-gray-700">Email</label>
//                                 <input
//                                     type="email"
//                                     name="email"
//                                     value={formData.email}
//                                     onChange={handleChange}
//                                     className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
//                                 />
//                                 {formData.email !== currentUser.email && (
//                                     <p className="text-sm text-gray-500 mt-1">
//                                         Un email de vérification sera envoyé à cette adresse.
//                                     </p>
//                                 )}
//                             </div>
//                             {showPasswordModal && (
//                                 <div className="mb-4">
//                                     <label className="block text-sm font-medium text-gray-700">
//                                         Entrez votre mot de passe pour confirmer le changement d'email
//                                     </label>
//                                     <input
//                                         type="password"
//                                         value={password}
//                                         onChange={(e) => setPassword(e.target.value)}
//                                         className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
//                                     />
//                                 </div>
//                             )}
//                             <div className="mb-4">
//                                 <label className="block text-sm font-medium text-gray-700">Téléphone</label>
//                                 <input
//                                     type="text"
//                                     name="phone"
//                                     value={formData.phone}
//                                     onChange={handleChange}
//                                     className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
//                                 />
//                             </div>
//                             <div className="mb-4">
//                                 <label className="block text-sm font-medium text-gray-700">Contact WhatsApp</label>
//                                 <input
//                                     type="text"
//                                     name="contactWhatsapp"
//                                     value={formData.contactWhatsapp}
//                                     onChange={handleChange}
//                                     className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
//                                 />
//                             </div>
//                             <div className="flex justify-end">
//                                 <button
//                                     type="submit"
//                                     className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
//                                     disabled={loading}
//                                 >
//                                     {loading ? "Updating..." : "Mettre à jour"}
//                                 </button>
//                             </div>
//                         </form>
//                     )}
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default Profile;

import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { firestore } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import Navbar from './../components/Navbar';
import {
    EmailAuthProvider,
    reauthenticateWithCredential,
    verifyBeforeUpdateEmail
} from "firebase/auth";

const Profile = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        contactWhatsapp: "",
    });
    const [originalData, setOriginalData] = useState({});
    const [password, setPassword] = useState("");
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const userDoc = await getDoc(doc(firestore, "users", currentUser.uid));
                if (userDoc.exists()) {
                    const data = userDoc.data();
                    setFormData(data);
                    setOriginalData(data); // Enregistre les données originales pour comparaison
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
                setError("Failed to load user data.");
            } finally {
                setLoading(false);
            }
        };
        fetchUserData();
    }, [currentUser.uid]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const hasChanges = () => {
        return JSON.stringify(formData) !== JSON.stringify(originalData);
    };

    const reauthenticateUser = async (password) => {
        const credential = EmailAuthProvider.credential(
            currentUser.email,
            password
        );
        await reauthenticateWithCredential(currentUser, credential);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setMessage("");

        try {
            if (!hasChanges()) {
                setError("Aucune modification n'a été effectuée.");
                setLoading(false);
                return;
            }

            // Affiche la demande de mot de passe si des informations ont changé
            if (!password) {
                setShowPasswordModal(true);
                setLoading(false);
                return;
            }

            // Ré-authentifie l'utilisateur avec le mot de passe fourni
            await reauthenticateUser(password);

            // Si l'email a été modifié, envoie un email de vérification
            if (formData.email !== currentUser.email) {
                await verifyBeforeUpdateEmail(currentUser, formData.email);
                setMessage("Un email de vérification a été envoyé à " + formData.email + ". Veuillez vérifier votre nouvel email avant de continuer.");

                // Remet l'ancien email jusqu'à ce que l'utilisateur confirme le nouveau
                setFormData((prev) => ({
                    ...prev,
                    email: currentUser.email
                }));
            }

            // Met à jour les autres données dans Firestore
            const updateData = {
                ...formData,
                email: currentUser.email // Utilise l'email actuel si non modifié
            };

            await updateDoc(doc(firestore, "users", currentUser.uid), updateData);

            if (!message) {
                setMessage("Profil mis à jour avec succès!");
            }

            setOriginalData(formData); // Actualise les données originales
            setShowPasswordModal(false);
            setPassword("");

            // Redirige si l'email est déjà vérifié ou non modifié
            if (formData.email === currentUser.email) {
                navigate("/dashboard");
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            if (error.code === 'auth/requires-recent-login') {
                setError("Veuillez ré-entrer votre mot de passe pour mettre à jour votre email.");
                setShowPasswordModal(true);
            } else if (error.code === 'auth/invalid-email') {
                setError("L'adresse email n'est pas valide.");
            } else if (error.code === 'auth/email-already-in-use') {
                setError("Cette adresse email est déjà utilisée.");
            } else {
                setError(error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />
            <div className="mt-12 bg-gray-100 flex items-center justify-center">
                <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
                    <h2 className="text-2xl font-bold mb-6">Mon Profil</h2>
                    {error && <div className="text-red-600 mb-4">{error}</div>}
                    {message && <div className="text-green-600 mb-4">{message}</div>}
                    {loading ? (
                        <div className="text-center">Loading...</div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Nom</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                                {formData.email !== currentUser.email && (
                                    <p className="text-sm text-gray-500 mt-1">
                                        Un email de vérification sera envoyé à cette adresse.
                                    </p>
                                )}
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Téléphone</label>
                                <input
                                    type="text"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Contact WhatsApp</label>
                                <input
                                    type="text"
                                    name="contactWhatsapp"
                                    value={formData.contactWhatsapp}
                                    onChange={handleChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>
                            {showPasswordModal && (
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Entrez votre mot de passe pour confirmer les modifications
                                    </label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>
                            )}
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                                    disabled={loading || !hasChanges()}
                                >
                                    {loading ? "Updating..." : "Mettre à jour"}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
