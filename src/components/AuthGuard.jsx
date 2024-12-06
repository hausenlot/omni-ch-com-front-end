import { useEffect, useState } from "react";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { Navigate } from "react-router-dom";

const AuthGuard = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user); // Set auth state based on user presence
      setLoading(false); // Stop loading after checking auth state
    });

    return unsubscribe; // Clean up on component unmount
  }, []);

  if (loading) {
    return <div>Loading...</div>; // You can add a loading spinner here
  }

  return isAuthenticated ? children : <Navigate to="/signin" />; // Redirect if not authenticated
};

export default AuthGuard;
