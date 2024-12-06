import { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import SignUp from "./components/SignUp";
import SignIn from "./components/SignIn";
import Dashboard from "./components/Dashboard";
import AuthGuard from "./components/AuthGuard";
import Email from "./components/EmailPage";
import Chat from "./components/Chat";
import EditProfile from "./components/UserProfile";
import EmailAuth from "./components/EmailAuth";
import Messages from "./components/Messages";
import Calls from "./components/CallHandler";

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true); // Loading state

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user); // Set authentication state
      setLoading(false); // Once done, set loading to false
    });

    return unsubscribe; // Clean up the listener on unmount
  }, []);

  // If loading is true, display loading state (or nothing)
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <div className="p-4">
        <Routes>
          {/* Root route logic */}
          <Route
            path="/"
            element={isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/signin" />}
          />
          
          {/* Routes for sign in, sign up, and dashboard */}
          <Route path="/signup" element={<SignUp />} />
          <Route path="/signin" element={<SignIn />} />
          <Route
            path="/dashboard"
            element={
              <AuthGuard>
                <Dashboard />
              </AuthGuard>
            }
          />
          <Route
            path="/edit-profile"
            element={
              <AuthGuard>
                <EditProfile />
              </AuthGuard>
            }
          />
          <Route
            path="/email-auth"
            element={
              <AuthGuard>
                <EmailAuth />
              </AuthGuard>
            }
          />
          <Route
            path="/email"
            element={
              <AuthGuard>
                <Email />
              </AuthGuard>
            }
          />
          <Route
            path="/chat"
            element={
              <AuthGuard>
                <Chat />
              </AuthGuard>
            }
          />
          <Route
            path="/sms"
            element={
              <AuthGuard>
                <Messages />
              </AuthGuard>
            }
          />
          <Route
            path="/call"
            element={
              <AuthGuard>
                <Calls />
              </AuthGuard>
            }
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
