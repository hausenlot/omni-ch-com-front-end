import { auth } from "../firebase"; // Firebase authentication
import Sidebar from "../components/Sidebar";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const user = auth.currentUser; // Get current user

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigate("/signin");
    } catch (err) {
      console.error("Sign-out error:", err);
    }
  };

  return (
    <div className="flex">
      {/* Sidebar */}
      <Sidebar/>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <h1 className="text-2xl font-bold">Welcome to your Dashboard</h1>
        <p>Welcome {user ? user.email : "User"}!</p>
        <button
          onClick={handleSignOut}
          className="bg-red-500 text-white p-2 rounded mt-4"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
