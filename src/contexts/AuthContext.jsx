import { createContext, useContext, useState, useEffect } from "react";
import { auth, firestore } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  // onAuthStateChanged,
} from "firebase/auth";
// import { doc, setDoc } from "firebase/firestore";
import { doc, setDoc, collection, query, where, getDocs } from "firebase/firestore";


// const AuthContext = createContext();

// export function useAuth() {
//   return useContext(AuthContext);
// }

// export function AuthProvider({ children }) {
//   const [currentUser, setCurrentUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   async function register(email, password, name, phone, contactWhatsapp) {
//     try {
//       const { user } = await createUserWithEmailAndPassword(
//         auth,
//         email,
//         password
//       );
//       await setDoc(doc(firestore, "users", user.uid), {
//         name,
//         phone,
//         contactWhatsapp,
//         email,
//         role: "owner",
//       });
//       return user;
//     } catch (error) {
//       throw error;
//     }
//   }

//   // function login(email, password) {
//   //   return signInWithEmailAndPassword(auth, email, password);
//   // }

//   async function login(email, password) {
//     // Vérifier si c'est un username plutôt qu'un email
//     let loginEmail = email;
//     if (!email.includes('@')) {
//       const usersRef = collection(firestore, "users");
//       const q = query(usersRef, where("username", "==", email.toLowerCase()));
//       const querySnapshot = await getDocs(q);

//       if (querySnapshot.empty) {
//         throw new Error("Nom d'utilisateur non trouvé");
//       }
//       loginEmail = querySnapshot.docs[0].data().email;
//     }

//     // Vérifier le rôle de l'utilisateur
//     const usersRef = collection(firestore, "users");
//     const q = query(usersRef, where("email", "==", loginEmail));
//     const querySnapshot = await getDocs(q);

//     if (!querySnapshot.empty) {
//       const userRole = querySnapshot.docs[0].data().role;
//       if (userRole !== 'owner') {
//         throw new Error("Ce compte n'est pas autorisé sur cette application");
//       }
//     }

//     // Si tout est bon, procéder à la connexion
//     return signInWithEmailAndPassword(auth, loginEmail, password);
//   }

//   function logout() {
//     return signOut(auth);
//   }

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (user) => {
//       setCurrentUser(user);
//       setLoading(false);
//     });

//     return unsubscribe;
//   }, []);

//   const value = {
//     currentUser,
//     login,
//     register,
//     logout,
//     loading,
//   };

//   return (
//     <AuthContext.Provider value={value}>
//       {!loading && children}
//     </AuthContext.Provider>
//   );
// }

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function login(email, password) {
    // Vérifier si c'est un username plutôt qu'un email
    let loginEmail = email;
    if (!email.includes('@')) {
      const usersRef = collection(firestore, "users");
      const q = query(usersRef, where("username", "==", email.toLowerCase()));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        throw new Error("Nom d'utilisateur non trouvé");
      }
      loginEmail = querySnapshot.docs[0].data().email;
    }

    // Vérifier le rôle de l'utilisateur
    const usersRef = collection(firestore, "users");
    const q = query(usersRef, where("email", "==", loginEmail));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const userRole = querySnapshot.docs[0].data().role;
      if (userRole !== 'owner') {
        throw new Error("Ce compte n'est pas autorisé sur cette application");
      }
    }

    // Si tout est bon, procéder à la connexion
    return signInWithEmailAndPassword(auth, loginEmail, password);
  }

  function logout() {
    return signOut(auth);
  }

  function resetPassword(email) {
    return sendPasswordResetEmail(auth, email);
  }

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    login,
    logout,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}