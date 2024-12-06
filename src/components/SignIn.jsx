import { useState } from "react";
import { auth } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { query, where, getDocs, collection } from "firebase/firestore"; // doc, getDoc, 
import { Link, useNavigate } from "react-router-dom";
import { db } from "../firebase"; // Import Firestore

const SignIn = () => {
  const [input, setInput] = useState(""); // Unified input for email/phone/username
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate(); // Hook to navigate programmatically

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError(""); // Reset error on submit

    try {
      let userEmail = "";
      // let userUid = "";
      
      // Check if input is an email
      const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (emailRegex.test(input)) {
        userEmail = input; // Use input as email
      } else {
        // If it's not an email, try to look it up in Firestore (phone number or username)
        const usersRef = collection(db, "users");
        
        // Check by phone number or username
        const phoneQuery = query(usersRef, where("phoneNumber", "==", input));
        const usernameQuery = query(usersRef, where("username", "==", input));
        
        // Fetch the user data by phone number
        let userDoc;
        const phoneSnapshot = await getDocs(phoneQuery);
        if (!phoneSnapshot.empty) {
          userDoc = phoneSnapshot.docs[0]; // Get the first matching document
        } else {
          // Fetch by username if phone number not found
          const usernameSnapshot = await getDocs(usernameQuery);
          if (!usernameSnapshot.empty) {
            userDoc = usernameSnapshot.docs[0]; // Get the first matching document
          }
        }

        if (userDoc) {
          const userData = userDoc.data();
          userEmail = userData.email; // Get email associated with username or phone number
          // userUid = userDoc.id; // Get the UID of the user
        } else {
          throw new Error("No user found with the provided information.");
        }
      }

      // Sign in with email and password
      await signInWithEmailAndPassword(auth, userEmail, password);
      alert("User signed in successfully!");
      
      // Redirect to the dashboard after successful sign-in
      navigate("/dashboard"); 
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSignIn} className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Sign In</h1>

      {/* Input for email, phone number, or username */}
      <input
        type="text"
        placeholder="Email, Phone Number, or Username"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="p-2 border rounded"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="p-2 border rounded"
      />
      <button type="submit" className="bg-green-500 text-white p-2 rounded">
        Sign In
      </button>
      {error && <p className="text-red-500">{error}</p>}
      <p className="text-sm">
        Don`t have an account?{" "}
        <Link to="/signup" className="text-blue-500 underline">
          Sign Up
        </Link>
      </p>
    </form>
  );
};

export default SignIn;
