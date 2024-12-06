import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import Modal from './Modal'; // Assuming Modal is in the same directory
import { Device } from '@twilio/voice-sdk';

import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

const CallPage = () => {
  const [incomingCall, setIncomingCall] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState(''); // State to hold the dialed number
  const [isCalling, setIsCalling] = useState(false);

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
  
  useEffect(() => {
    const socket = io('http://localhost:5000');

    // Listen for incoming call notification
    socket.on('incomingCall', (data) => {
      setIncomingCall(true);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    // Check if the Twilio Voice SDK is available
    if (Device) {
      console.log('Twilio Voice SDK is loaded');
    } else {
      console.error('Twilio Voice SDK is not loaded properly');
    }
  }, []);




  const handleAcceptCall = async () => {
    // Step 1: Request the Twilio token
    const tokenResponse = await fetch('http://localhost:5000/token');
    const tokenData = await tokenResponse.json();
    const token = tokenData.token;

    // Step 2: Initialize the Twilio Device with the token
    const device = new Device(token);

    device.on('ready', () => {
      console.log('Twilio Device is ready');
    });

    device.on('error', (error) => {
      console.error('Twilio Device error:', error);
    });

    // Step 3: Accept the call
    const response = await fetch('http://localhost:5000/accept-call', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'accepted' }),
    });

    if (response.ok) {
      console.log('Call accepted');
      setIncomingCall(false); // Close the modal after accepting the call
    }
  };

  const handleRejectCall = () => {
    // Handle the call rejection logic here
    setIncomingCall(false);
    console.log('Call rejected');
  };

  const handleDialNumber = (digit) => {
    // Add digit to the phone number input
    setPhoneNumber((prev) => prev + digit);
  };

  const handleClearNumber = () => {
    // Clear the phone number input
    setPhoneNumber('');
  };

  const handleCall = async () => {
    if (phoneNumber.length === 0) {
      alert('Please enter a phone number to dial!');
      return;
    }

    setIsCalling(true);

    // Step 1: Request the Twilio token
    const tokenResponse = await fetch('http://localhost:5000/token');
    const tokenData = await tokenResponse.json();
    const token = tokenData.token;

    // Step 2: Initialize the Twilio Device with the token
    const device = new Device(token);

    device.on('ready', () => {
      console.log('Twilio Device is ready');
    });

    device.on('error', (error) => {
      console.error('Twilio Device error:', error);
    });

    // Step 3: Initiate the call to the entered phone number
    const response = await fetch('http://localhost:5000/make-call', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to: phoneNumber, from: myPhoneNumber }),
    });

    if (response.ok) {
      console.log('Call initiated to ' + phoneNumber);
      setPhoneNumber('');
      setIsCalling(false); // Reset calling state
    } else {
      alert('Failed to make the call');
      setIsCalling(false);
    }
  };

  return (
    <div>
      <h1>Call Page</h1>

      {/* Display number input */}
      <div>
        <input
          type="text"
          value={phoneNumber}
          readOnly
          placeholder="Enter phone number"
          style={{ width: '200px', margin: '10px 0' }}
        />
      </div>

      {/* Display numpad */}
      <div className="numpad">
        {['+', '1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((digit) => (
          <button
            key={digit}
            onClick={() => handleDialNumber(digit)}
            className="p-4"
          >
            {digit}
          </button>
        ))}
        <button onClick={handleClearNumber} className="numpad-button">
          Clear
        </button>
      </div>

      <div>
        <button onClick={handleCall} disabled={isCalling}>
          {isCalling ? 'Calling...' : 'Call'}
        </button>
      </div>

      {/* Show Modal on incoming call */}
      <Modal
        isOpen={incomingCall}
        onClose={handleRejectCall}
        onAccept={handleAcceptCall}
      />
    </div>
  );
};

export default CallPage;
