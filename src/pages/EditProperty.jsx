import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { firestore, storage } from "../firebase";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useNavigate, useParams } from "react-router-dom";
import { X } from "lucide-react";

const EditProperty = () => {
  const { id } = useParams();
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
  });
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [newAmenity, setNewAmenity] = useState("");
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Fetch property types from Firestore
  useEffect(() => {
    const fetchPropertyTypes = async () => {
      try {
        const propertyTypesRef = doc(firestore, "propertieType", "YRGF5mJNfFbgjotFzWph");
        const propertyTypesDoc = await getDoc(propertyTypesRef);

        if (propertyTypesDoc.exists()) {
          const types = Object.values(propertyTypesDoc.data());
          setPropertyTypes(types);
        }
      } catch (error) {
        console.error("Error fetching property types:", error);
        setError("Failed to load property types");
      }
    };

    fetchPropertyTypes();
  }, []);

  // Load existing property data
  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const docRef = doc(firestore, "properties", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setFormData({
            address: data.address || "",
            location: data.location || "",
            price: data.price?.toString() || "",
            bedrooms: data.bedrooms?.toString() || "",
            bathrooms: data.bathrooms?.toString() || "",
            sqft: data.sqft?.toString() || "",
            description: data.description || "",
            propertyType: data.propertyType || "",
            amenities: data.amenities || [],
            yearBuilt: data.yearBuilt || "",
            isNewConstruction: data.isNewConstruction || false,
          });
          setExistingImages(data.images || []);
        } else {
          setError("Property not found");
          navigate("/dashboard");
        }
      } catch (error) {
        console.error("Error fetching property:", error);
        setError("Failed to load property");
      }
    };

    fetchProperty();
  }, [id, navigate]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let imageUrls = [...existingImages];

      // Upload new images if any
      if (images.length > 0) {
        const newImageUrls = await Promise.all(
          Array.from(images).map(async (image) => {
            const storageRef = ref(
              storage,
              `properties/${Date.now()}_${image.name}`
            );
            await uploadBytes(storageRef, image);
            return getDownloadURL(storageRef);
          })
        );
        imageUrls = [...imageUrls, ...newImageUrls];
      }

      // Update property in Firestore
      const propertyRef = doc(firestore, "properties", id);
      await updateDoc(propertyRef, {
        ...formData,
        price: parseFloat(formData.price),
        bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
        bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : null,
        sqft: formData.sqft ? parseFloat(formData.sqft) : null,
        images: imageUrls,
        updatedAt: new Date().toISOString(),
      });

      navigate("/dashboard");
    } catch (error) {
      setError("Failed to update property");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">Modifiez la propriété</h2>

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
                Type de propriété
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
                Price (FCFA)
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
                Lieu
              </label>
              <input
                type="text"
                name="location"
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
                Addresse (Quartier ou autre)
              </label>
              <input
                type="text"
                name="address"
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
                Chambres
              </label>
              <input
                type="number"
                name="bedrooms"
                value={formData.bedrooms}
                onChange={(e) =>
                  setFormData({ ...formData, bedrooms: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              // required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Douches
              </label>
              <input
                type="number"
                name="bathrooms"
                value={formData.bathrooms}
                onChange={(e) =>
                  setFormData({ ...formData, bathrooms: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              // required
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
                Description
              </label>
              <textarea
                required
                name="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                rows="4"
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nouvelle Construction
              </label>
              <input
                type="checkbox"
                checked={formData.isNewConstruction}
                onChange={(e) =>
                  setFormData({ ...formData, isNewConstruction: e.target.checked })
                }
                className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
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
              <div className="grid grid-cols-3 gap-2 mt-2">
                {existingImages.map((url, index) => (
                  <img
                    key={index}
                    src={url}
                    alt={`Property ${index + 1}`}
                    className="w-full h-24 object-cover rounded"
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Ajouter Nouvelles Images
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => setImages(e.target.files)}
                className="mt-1 block w-full"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Retour
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Mise à jour..." : "Mettre à jour"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProperty;


// import { useState, useEffect } from "react";
// import { useAuth } from "../contexts/AuthContext";
// import { firestore, storage } from "../firebase";
// import { doc, updateDoc, getDoc } from "firebase/firestore";
// import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
// import { useNavigate, useParams } from "react-router-dom";
// import { X } from "lucide-react";

// const EditProperty = () => {
//   const { id } = useParams();
//   const [formData, setFormData] = useState({
//     address: "",
//     location: "",
//     price: "",
//     bedrooms: "",
//     bathrooms: "",
//     sqft: "",
//     description: "",
//     propertyType: "",
//     amenities: [],
//     yearBuilt: "",
//     isNewConstruction: false,
//   });
//   const [propertyTypes, setPropertyTypes] = useState([]);
//   const [newAmenity, setNewAmenity] = useState("");
//   const [images, setImages] = useState([]);
//   const [existingImages, setExistingImages] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const { currentUser } = useAuth();
//   const navigate = useNavigate();

//   // Fetch property types from Firestore
//   useEffect(() => {
//     const fetchPropertyTypes = async () => {
//       try {
//         const propertyTypesRef = doc(firestore, "propertieType", "YRGF5mJNfFbgjotFzWph");
//         const propertyTypesDoc = await getDoc(propertyTypesRef);

//         if (propertyTypesDoc.exists()) {
//           const types = Object.values(propertyTypesDoc.data());
//           setPropertyTypes(types);
//         }
//       } catch (error) {
//         console.error("Error fetching property types:", error);
//         setError("Failed to load property types");
//       }
//     };

//     fetchPropertyTypes();
//   }, []);

//   // Load existing property data
//   useEffect(() => {
//     const fetchProperty = async () => {
//       try {
//         const docRef = doc(firestore, "properties", id);
//         const docSnap = await getDoc(docRef);

//         if (docSnap.exists()) {
//           const data = docSnap.data();
//           setFormData({
//             address: data.address || "",
//             location: data.location || "",
//             price: data.price?.toString() || "",
//             bedrooms: data.bedrooms?.toString() || "",
//             bathrooms: data.bathrooms?.toString() || "",
//             sqft: data.sqft?.toString() || "",
//             description: data.description || "",
//             propertyType: data.propertyType || "",
//             amenities: data.amenities || [],
//             yearBuilt: data.yearBuilt || "",
//             isNewConstruction: data.isNewConstruction || false,
//           });
//           setExistingImages(data.images || []);
//         } else {
//           setError("Property not found");
//           navigate("/dashboard");
//         }
//       } catch (error) {
//         console.error("Error fetching property:", error);
//         setError("Failed to load property");
//       }
//     };

//     fetchProperty();
//   }, [id, navigate]);

//   const handleAddAmenity = (e) => {
//     e.preventDefault();
//     if (newAmenity.trim() && !formData.amenities.includes(newAmenity.trim())) {
//       setFormData(prev => ({
//         ...prev,
//         amenities: [...prev.amenities, newAmenity.trim()]
//       }));
//       setNewAmenity("");
//     }
//   };

//   const handleRemoveAmenity = (amenityToRemove) => {
//     setFormData(prev => ({
//       ...prev,
//       amenities: prev.amenities.filter(amenity => amenity !== amenityToRemove)
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError("");

//     try {
//       let imageUrls = [...existingImages];

//       // Upload new images if any
//       if (images.length > 0) {
//         const newImageUrls = await Promise.all(
//           Array.from(images).map(async (image) => {
//             const storageRef = ref(
//               storage,
//               `properties/${Date.now()}_${image.name}`
//             );
//             await uploadBytes(storageRef, image);
//             return getDownloadURL(storageRef);
//           })
//         );
//         imageUrls = [...imageUrls, ...newImageUrls];
//       }

//       // Update property in Firestore
//       const propertyRef = doc(firestore, "properties", id);
//       await updateDoc(propertyRef, {
//         ...formData,
//         price: parseFloat(formData.price),
//         bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
//         bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : null,
//         sqft: formData.sqft ? parseFloat(formData.sqft) : null,
//         images: imageUrls,
//         updatedAt: new Date().toISOString(),
//       });

//       navigate("/dashboard");
//     } catch (error) {
//       setError("Failed to update property");
//       console.error(error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const inputClassName = "appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm";
//   const labelClassName = "sr-only";
//   const buttonClassName = "group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500";

//   return (
//     <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-3xl w-full space-y-8">
//         <div>
//           <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
//             Modifiez la propriété
//           </h2>
//         </div>

//         {error && (
//           <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
//             {error}
//           </div>
//         )}

//         <form onSubmit={handleSubmit} className="mt-8 space-y-6">
//           <div className="rounded-md shadow-sm -space-y-px">
//             <div>
//               <label htmlFor="propertyType" className={labelClassName}>
//                 Type de propriété
//               </label>
//               <select
//                 name="propertyType"
//                 value={formData.propertyType}
//                 onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
//                 className={`${inputClassName} rounded-t-md`}
//                 required
//               >
//                 <option value="">Sélectionnez un type</option>
//                 {propertyTypes.map((type, index) => (
//                   <option key={index} value={type}>{type}</option>
//                 ))}
//               </select>
//             </div>

//             <div>
//               <label htmlFor="price" className={labelClassName}>Prix (FCFA)</label>
//               <input
//                 type="number"
//                 name="price"
//                 placeholder="Prix (FCFA)"
//                 value={formData.price}
//                 onChange={(e) => setFormData({ ...formData, price: e.target.value })}
//                 className={inputClassName}
//                 required
//               />
//             </div>

//             <div>
//               <label htmlFor="location" className={labelClassName}>Lieu</label>
//               <input
//                 type="text"
//                 name="location"
//                 placeholder="Lieu"
//                 value={formData.location}
//                 onChange={(e) => setFormData({ ...formData, location: e.target.value })}
//                 className={inputClassName}
//                 required
//               />
//             </div>

//             <div>
//               <label htmlFor="address" className={labelClassName}>Adresse</label>
//               <input
//                 type="text"
//                 name="address"
//                 placeholder="Adresse (Quartier ou autre)"
//                 value={formData.address}
//                 onChange={(e) => setFormData({ ...formData, address: e.target.value })}
//                 className={inputClassName}
//                 required
//               />
//             </div>

//             <div>
//               <label htmlFor="bedrooms" className={labelClassName}>Chambres</label>
//               <input
//                 type="number"
//                 name="bedrooms"
//                 placeholder="Nombre de chambres"
//                 value={formData.bedrooms}
//                 onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
//                 className={inputClassName}
//               />
//             </div>

//             <div>
//               <label htmlFor="bathrooms" className={labelClassName}>Douches</label>
//               <input
//                 type="number"
//                 name="bathrooms"
//                 placeholder="Nombre de douches"
//                 value={formData.bathrooms}
//                 onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
//                 className={inputClassName}
//               />
//             </div>

//             <div>
//               <label htmlFor="sqft" className={labelClassName}>Superficie</label>
//               <input
//                 type="number"
//                 name="sqft"
//                 placeholder="Superficie"
//                 value={formData.sqft}
//                 onChange={(e) => setFormData({ ...formData, sqft: e.target.value })}
//                 className={inputClassName}
//               />
//             </div>

//             <div>
//               <label htmlFor="yearBuilt" className={labelClassName}>Année de construction</label>
//               <input
//                 type="number"
//                 name="yearBuilt"
//                 placeholder="Année de construction"
//                 value={formData.yearBuilt}
//                 onChange={(e) => setFormData({ ...formData, yearBuilt: e.target.value })}
//                 className={inputClassName}
//               />
//             </div>

//             <div>
//               <label htmlFor="description" className={labelClassName}>Description</label>
//               <textarea
//                 name="description"
//                 placeholder="Description"
//                 value={formData.description}
//                 onChange={(e) => setFormData({ ...formData, description: e.target.value })}
//                 className={`${inputClassName} resize-none`}
//                 rows="4"
//                 required
//               ></textarea>
//             </div>

//             <div className="flex items-center px-3 py-2">
//               <input
//                 type="checkbox"
//                 checked={formData.isNewConstruction}
//                 onChange={(e) => setFormData({ ...formData, isNewConstruction: e.target.checked })}
//                 className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
//               />
//               <label className="ml-2 block text-sm text-gray-900">
//                 Nouvelle Construction
//               </label>
//             </div>
//           </div>

//           <div className="space-y-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700">Commodités</label>
//               <div className="flex space-x-2 mt-1">
//                 <input
//                   type="text"
//                   value={newAmenity}
//                   onChange={(e) => setNewAmenity(e.target.value)}
//                   placeholder="Ajouter une commodité"
//                   className={`${inputClassName} rounded-md`}
//                 />
//                 <button
//                   type="button"
//                   onClick={handleAddAmenity}
//                   className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
//                 >
//                   Ajouter
//                 </button>
//               </div>

//               <div className="mt-2 flex flex-wrap gap-2">
//                 {formData.amenities.map((amenity) => (
//                   <span
//                     key={amenity}
//                     className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-700"
//                   >
//                     {amenity}
//                     <button
//                       type="button"
//                       onClick={() => handleRemoveAmenity(amenity)}
//                       className="ml-2 text-blue-600 hover:text-blue-800"
//                     >
//                       <X size={14} />
//                     </button>
//                   </span>
//                 ))}
//               </div>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700">Images existantes</label>
//               <div className="grid grid-cols-3 gap-2 mt-2">
//                 {existingImages.map((url, index) => (
//                   <img
//                     key={index}
//                     src={url}
//                     alt={`Property ${index + 1}`}
//                     className="w-full h-24 object-cover rounded"
//                   />
//                 ))}
//               </div>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700">Nouvelles images</label>
//               <input
//                 type="file"
//                 multiple
//                 accept="image/*"
//                 onChange={(e) => setImages(e.target.files)}
//                 className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
//               />
//             </div>
//           </div>

//           <div className="flex justify-end space-x-4">
//             <button
//               type="button"
//               onClick={() => navigate("/dashboard")}
//               className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
//             >
//               Retour
//             </button>
//             <button
//               type="submit"
//               disabled={loading}
//               className={buttonClassName}
//             >
//               {loading ? "Mise à jour..." : "Mettre à jour"}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default EditProperty;