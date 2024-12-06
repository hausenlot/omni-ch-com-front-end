import { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { updateEmail, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar"; // Assuming Sidebar is in components

const UserProfile = () => {
  const navigate = useNavigate();
  const user = auth.currentUser;

  // Initial state
  const [username, setUsername] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState(user?.email || "");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch user details from Firestore (assuming you store the username and phone there)
  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!user) return;
      const userDocRef = doc(db, "users", user.uid); // Get user document using uid
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUsername(userData.username || "");
        setPhoneNumber(userData.phoneNumber || "");
      }
    };
    fetchUserDetails();
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userRef = doc(db, "users", user.uid);

      // Update Firestore user profile (username, phone)
      await updateDoc(userRef, {
        username,
        phoneNumber,
      });

      // Update email if changed
      if (email !== user.email) {
        await updateEmail(user, email);
      }

      // Update password if changed
      if (newPassword) {
        const credential = EmailAuthProvider.credential(user.email, password);
        await reauthenticateWithCredential(user, credential); // Reauthenticate the user
        await updatePassword(user, newPassword);
      }

      alert("Profile updated successfully!");
      navigate("/dashboard"); // Redirect to dashboard after update

    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="flex">
      <Sidebar/>
      <div className="p-4">
        <h1 className="text-2xl font-bold">Update Profile</h1>
        <form onSubmit={handleUpdateProfile} className="flex flex-col gap-4">
          {error && <p className="text-red-500">{error}</p>}
          
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            className="p-2 border rounded"
          />
          <input
            type="text"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="Phone Number"
            className="p-2 border rounded"
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="p-2 border rounded"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Current Password"
            className="p-2 border rounded"
          />
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="New Password"
            className="p-2 border rounded"
          />
          
          <button
            type="submit"
            disabled={loading}
            className="bg-green-500 text-white p-2 rounded mt-4"
          >
            {loading ? "Updating..." : "Update Profile"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserProfile;
