import { useState, useEffect, useMemo } from "react";
import io from "socket.io-client";
import { auth, db  } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import Sidebar from "./Sidebar"

const Chat = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [file, setFile] = useState(null);
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState("");

  const socket = useMemo(() => {
    return io("http://localhost:5000/chat", {
      query: { 
        userId: user?.uid, 
        userEmail: user?.email 
      },
    });
  }, [user]);

  useEffect(() => {
    
    const unsubscribe = auth.onAuthStateChanged(setUser);

    socket.on('receiveMessage', (newMessage) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });

    socket.on('chat message', (fileMessage) => {
      setMessages((prevMessages) => [...prevMessages, fileMessage]);
    });
    
    if (user?.uid) {
      const fetchUsername = async () => {
        try {
          const userDocRef = doc(db, 'users', user.uid); // Reference to the user's document
          const userDoc = await getDoc(userDocRef); // Get the document

          if (userDoc.exists()) {
            setUsername(userDoc.data().username); // Assuming the username is stored in Firestore under 'username'
          } else {
            console.log("No such user!");
          }
        } catch (error) {
          console.error("Error fetching user data: ", error);
        }
      };

      fetchUsername();
    }

    return () => {
      unsubscribe();
      socket.off('receiveMessage');
      socket.off('chat message');
      socket.disconnect();
    };
  }, [socket]);

  const sendMessageWithOptionalFile = async () => {
    if (!socket || (!message.trim() && !file)) return;

    // If there's a file, upload it first
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("userId", user?.uid);
      formData.append("userEmail", user?.email);
      formData.append("message", message.trim());

      try {
        await fetch("http://localhost:5000/upload", {
          method: "POST",
          body: formData,
        });
      } catch (error) {
        console.error("File upload failed:", error);
        return;
      }
    } 
    // If there's only a text message
    else if (message.trim()) {
      const newMessage = {
        type: 'text',
        text: message.trim(),
        sender: user?.email,
        senderUsername: username,
        userId: user?.uid,
      };
      socket.emit("sendMessage", newMessage);
    }

    // Reset input fields
    setMessage("");
    setFile(null);
    // Reset file input
    const fileInput = document.getElementById('fileInput');
    if (fileInput) fileInput.value = '';
  };

  return (
    <div className="flex">
      <Sidebar/>
      <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-md">
        {/* Message container */}
        <div className="h-96 overflow-y-auto border border-gray-200 rounded-lg p-4 space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`p-2 flex ${msg.sender === user.email ? 'justify-end' : 'justify-start'}`}
            >
              {msg.type === 'text' && (
                <div>
                  <p>{msg.sender === user.email ? 'You' : msg.senderUsername}</p>
                  <p
                    className={`inline-block p-3 rounded-lg max-w-xs ${
                      msg.sender === user.email
                        ? 'bg-blue-500 text-white' // Sent by me
                        : 'bg-gray-200 text-gray-900' // Sent by the other person
                    }`}
                  >
                    {msg.text}
                  </p>
                </div>
              )}
              {msg.type === 'file' && (
                <div className="flex flex-col">
                  <p>{msg.sender === user.email ? 'You' : username}</p>
                  <a
                    href={`http://localhost:5000${msg.url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-block p-3 rounded-lg max-w-xs ${
                      msg.sender === user.email
                        ? 'bg-blue-500 text-white underline' // Sent by me
                        : 'bg-gray-200 text-gray-900' // Sent by the other person
                    }`}
                  >
                    Download File: {msg.filename}
                  </a>
                  {msg.text && <p className="mt-1 text-sm text-gray-500">{msg.text}</p>}
                </div>
              )}
            </div>
          ))}
        </div>
    
        {/* Input section */}
        <div className="mt-6 flex space-x-4 items-center">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="border border-gray-300 p-3 w-full rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type a message..."
          />
          <input
            id="fileInput"
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            className="border border-gray-300 p-3 rounded-lg w-1/4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={sendMessageWithOptionalFile}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition duration-300"
            disabled={!message.trim() && !file}
          >
            {file ? "Send with File" : "Send"}
          </button>
        </div>
      </div>
    </div>
  );  
};

export default Chat;