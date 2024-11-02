import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { firestore, storage } from "../firebase";
import { collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore";
import { ref, deleteObject } from "firebase/storage";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Edit2, Trash2 } from "lucide-react";

import Navbar from "../components/Navbar";

const Dashboard = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const q = query(
          collection(firestore, "properties"),
          where("ownerId", "==", currentUser.uid)
        );
        const querySnapshot = await getDocs(q);
        const propertiesData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProperties(propertiesData);
      } catch (error) {
        console.error("Error fetching properties:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [currentUser.uid]);

  const handleDeleteProperty = async (propertyId) => {
    // Confirmation de suppression
    if (!window.confirm("Etes-vous sûr de vouloir supprimer cette propriété?")) {
      return;
    }

    setDeleteLoading(true);
    try {
      // Trouver la propriété à supprimer
      const propertyToDelete = properties.find(p => p.id === propertyId);

      // Supprimer les images du Storage
      if (propertyToDelete.images && propertyToDelete.images.length > 0) {
        await Promise.all(propertyToDelete.images.map(async (imageUrl) => {
          // Extraire le chemin de l'image à partir de l'URL
          const imagePath = imageUrl.split('properties%2F')[1].split('?')[0];
          const imageRef = ref(storage, `properties/${decodeURIComponent(imagePath)}`);
          try {
            await deleteObject(imageRef);
          } catch (error) {
            console.error("Error deleting image:", error);
            // Continue même si une image ne peut pas être supprimée
          }
        }));
      }

      // Supprimer le document de Firestore
      await deleteDoc(doc(firestore, "properties", propertyId));

      // Mettre à jour l'état local
      setProperties(properties.filter(property => property.id !== propertyId));

    } catch (error) {
      console.error("Error deleting property:", error);
      alert("Failed to delete property. Please try again.");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">

      <Navbar />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Mes Propréités</h2>
            <Link
              to="/add-property"
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              <Plus className="h-5 w-5 mr-2" />
              Ajouter Propriété
            </Link>
          </div>

          {loading ? (
            <div className="text-center">Loading...</div>
          ) : properties.length === 0 ? (
            <div className="text-center text-gray-500">
              Aucune propriété trouvée. Ajoutez votre première propriété!
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {properties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  onDelete={() => handleDeleteProperty(property.id)}
                  deleteLoading={deleteLoading}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

const PropertyCard = ({ property, onDelete, deleteLoading }) => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden">
    <img
      src={property.images[0] || "/placeholder.jpg"}
      alt={property.address}
      className="h-48 w-full object-cover"
    />
    <div className="p-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            {property.address}
          </h3>
          <p className="text-sm text-gray-500">{property.location}</p>
        </div>
        <span className="text-blue-600 font-semibold">
          {property.price.toLocaleString()} FCFA
        </span>
      </div>

      <div className="mt-4 flex justify-between">
        <Link
          to={`/edit-property/${property.id}`}
          className="flex items-center text-sm text-blue-600 hover:text-blue-800"
        >
          <Edit2 className="h-4 w-4 mr-1" />
          Modifier
        </Link>
        <button
          onClick={onDelete}
          disabled={deleteLoading}
          className="flex items-center text-sm text-red-600 hover:text-red-800 disabled:opacity-50"
        >
          <Trash2 className="h-4 w-4 mr-1" />
          {deleteLoading ? "Suppression..." : "Supprimer"}
        </button>
      </div>
    </div>
  </div>
);

export default Dashboard;