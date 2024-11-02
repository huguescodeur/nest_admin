import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { firestore, storage } from "../firebase";
import {
  collection,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  getDocs
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";

const AddProperty = () => {
  const [formData, setFormData] = useState({
    address: "",
    location: "",
    price: "",
    bedrooms: "",
    bathrooms: "",
    sqft: "",
    description: "",
    propertyType: "",
    amenities: [],
    yearBuilt: "",
    isNewConstruction: false,
    phone: "",
    contactWhatsapp: "",
  });

  const [propertyTypes, setPropertyTypes] = useState([]);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [newAmenity, setNewAmenity] = useState("");
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleAddAmenity = (e) => {
    e.preventDefault();
    if (newAmenity.trim() && !formData.amenities.includes(newAmenity.trim())) {
      setFormData(prev => ({
        ...prev,
        amenities: [...prev.amenities, newAmenity.trim()]
      }));
      setNewAmenity("");
    }
  };

  const handleRemoveAmenity = (amenityToRemove) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.filter(amenity => amenity !== amenityToRemove)
    }));
  };

  const [userFirestoreData, setUserFirestoreData] = useState(null);

  // Fetch property types from Firestore
  useEffect(() => {
    const fetchPropertyTypes = async () => {
      try {
        const propertyTypesRef = doc(firestore, "propertieType", "YRGF5mJNfFbgjotFzWph");
        const propertyTypesDoc = await getDoc(propertyTypesRef);

        if (propertyTypesDoc.exists()) {
          // Convert the document data into an array of property types
          const types = Object.values(propertyTypesDoc.data());
          setPropertyTypes(types);

          // Set the default value to the first property type if available
          if (types.length > 0) {
            setFormData(prev => ({ ...prev, propertyType: types[0] }));
          }
        }
      } catch (error) {
        console.error("Error fetching property types:", error);
        setError("Failed to load property types");
      }
    };

    fetchPropertyTypes();
  }, []);

  useEffect(() => {
    const fetchUserFirestoreData = async () => {
      if (currentUser) {
        const userDocRef = doc(firestore, "users", currentUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          setUserFirestoreData(userDoc.data());
        }
      }
    };

    fetchUserFirestoreData();
  }, [currentUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const imageUrls = await Promise.all(
        Array.from(images).map(async (image) => {
          const storageRef = ref(
            storage,
            `properties/${Date.now()}_${image.name}`
          );
          await uploadBytes(storageRef, image);
          return getDownloadURL(storageRef);
        })
      );

      const propertyData = {
        ...formData,
        price: parseFloat(formData.price),
        bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : 0,
        bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : 0,
        // sqft: parseFloat(formData.sqft),
        // ---------------
        sqft: formData.sqft ? parseFloat(formData.sqft) : 0.0,
        images: imageUrls,
        ownerId: currentUser.uid,
        createdAt: new Date().toISOString(),
        phone: userFirestoreData?.phone || "",
        contactWhatsapp: userFirestoreData?.contactWhatsapp || "",
      };

      const propertyRef = await addDoc(collection(firestore, "properties"), propertyData);

      await updateDoc(propertyRef, {
        id: propertyRef.id,
      });

      navigate("/dashboard");
    } catch (error) {
      setError("Failed to add property");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">Ajoutez Nouvelle Propriété</h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-6 bg-white p-6 rounded-lg shadow"
        >
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Type de propriété *
              </label>
              <select
                name="propertyType"
                value={formData.propertyType}
                onChange={(e) =>
                  setFormData({ ...formData, propertyType: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              >
                <option value="">Sélectionnez un type</option>
                {propertyTypes.map((type, index) => (
                  <option key={index} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Prix (FCFA) *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Lieu *
              </label>
              <input
                type="text"
                name="lieu"
                placeholder="Codody"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Address *
              </label>
              <input
                type="text"
                name="address"
                placeholder="Cocody Palmeraie"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Chambres *
              </label>
              <input
                type="number"
                name="bedrooms"
                value={formData.bedrooms}
                onChange={(e) =>
                  setFormData({ ...formData, bedrooms: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                douches *
              </label>
              <input
                type="number"
                name="bathrooms"
                value={formData.bathrooms}
                onChange={(e) =>
                  setFormData({ ...formData, bathrooms: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Superficie
              </label>
              <input
                type="number"
                name="sqft"
                value={formData.sqft}
                onChange={(e) =>
                  setFormData({ ...formData, sqft: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              // required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Année de construction
              </label>
              <input
                type="number"
                name="yearBuilt"
                value={formData.yearBuilt}
                onChange={(e) =>
                  setFormData({ ...formData, yearBuilt: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Description *
              </label>
              <textarea
                required
                name="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nouvelle construction *
              </label>
              <div className="flex items-center space-x-4 mt-1">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="isNewConstruction"
                    value="yes"
                    checked={formData.isNewConstruction === true}
                    onChange={() => setFormData({ ...formData, isNewConstruction: true })}
                    className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="ml-2">Oui</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="isNewConstruction"
                    value="no"
                    checked={formData.isNewConstruction === false}
                    onChange={() => setFormData({ ...formData, isNewConstruction: false })}
                    className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="ml-2">Non</span>
                </label>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Commodités (ex: jardin, piscine, garage...)
              </label>

              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newAmenity}
                  onChange={(e) => setNewAmenity(e.target.value)}
                  placeholder="Ajouter une commodité"
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={handleAddAmenity}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Ajouter
                </button>
              </div>

              {/* Display added amenities */}
              <div className="mt-4 flex flex-wrap gap-2">
                {formData.amenities.map((amenity) => (
                  <span
                    key={amenity}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-700"
                  >
                    {amenity}
                    <button
                      type="button"
                      onClick={() => handleRemoveAmenity(amenity)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Images
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => setImages(e.target.files)}
                className="mt-1 block w-full"
                required
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Adding..." : "Add Property"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProperty;