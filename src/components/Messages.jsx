import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import ReceivedMessages from './ReceivedMessages'; // Import the ReceivedMessages component
import SendMessage from './SendMessage'; // Import the SendMessage component

import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const Messages = () => {
  const [showInbox, setShowInbox] = useState(true);
  const [user, setUser] = useState(null);
  const [myPhoneNumber, setMyPhoneNumber] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        setUser(null);
        setMyPhoneNumber("");
      }
    });

    return () => unsubscribe(); // Cleanup listener on component unmount
  }, []);

  // Fetch phone number when user is set
  useEffect(() => {
    const fetchPhoneNumber = async () => {
      if (user?.uid) {
        try {
          const userDocRef = doc(db, 'users', user.uid); // Reference to the user's document
          const userDoc = await getDoc(userDocRef); // Get the document

          if (userDoc.exists()) {
            setMyPhoneNumber(userDoc.data().phoneNumber || ""); // Set phone number or fallback to empty
            console.log("Phone number:", userDoc.data().phoneNumber);
          } else {
            console.log("No such user document!");
          }
        } catch (error) {
          console.error("Error fetching user data: ", error);
        }
      }
    };

    fetchPhoneNumber();
  }, [user]); // Run when user changes

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 p-6 bg-gray-100">
        <h2 className="text-2xl font-semibold mb-6">Messages</h2>
        
        {/* Toggle Button */}
        <button
          onClick={() => setShowInbox((prev) => !prev)}
          className="bg-blue-500 text-white py-2 px-4 rounded-md mb-6"
        >
          {showInbox ? 'Compose Message' : 'View Inbox'}
        </button>
        
        {/* Conditionally Render Inbox or Compose */}
        {showInbox ? (
          <ReceivedMessages myPhoneNumber={myPhoneNumber} />
        ) : (
          <SendMessage myPhoneNumber={myPhoneNumber} />
        )}
      </div>
    </div>
  );
};

export default Messages;
