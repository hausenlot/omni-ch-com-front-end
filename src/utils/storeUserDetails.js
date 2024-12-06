// utils/storeUserDetails.js
import { createUserWithEmailAndPassword } from "firebase/auth"; // getAuth, 
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase"; // Importing Firebase auth and Firestore

export const storeUserDetails = async (email, password, username, phoneNumber) => {
  try {
    // Create a user with Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;  // Firebase user object

    // Store additional details in Firestore (like username and phone number)
    await setDoc(doc(db, "users", user.uid), {
      email: user.email,
      username: username,
      phoneNumber: phoneNumber,
    });

    alert("User signed up and data stored!");
  } catch (error) {
    console.error("Error signing up:", error);
    alert(error.message);
  }
};