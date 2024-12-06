// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";

// const Email = () => {
//   const [messages, setMessages] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const accessToken = localStorage.getItem("google_access_token");
//   const navigate = useNavigate();

//   // Fetch emails from Gmail API
//   const fetchEmails = async () => {
//     if (!accessToken) {
//       setError("User not authenticated");
//       setLoading(false);
//       return;
//     }

//     try {
//       const response = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages", {
//         headers: {
//           Authorization: `Bearer ${accessToken}`,
//         },
//       });
//       const data = await response.json();

//       if (data.messages) {
//         const messageDetails = await Promise.all(
//           data.messages.map(async (message) => {
//             const messageRes = await fetch(
//               `https://gmail.googleapis.com/gmail/v1/users/me/messages/${message.id}`,
//               {
//                 headers: {
//                   Authorization: `Bearer ${accessToken}`,
//                 },
//               }
//             );
//             return messageRes.json();
//           })
//         );
//         setMessages(messageDetails);
//       } else {
//         setMessages([]);
//       }
//       setLoading(false);
//     } catch (err) {
//       console.error("Error fetching emails:", err);
//       setError("Failed to load emails");
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchEmails();
//   }, [accessToken]);

//   const handleEmailClick = (messageId) => {
//     // Navigate to the email details page with messageId
//     navigate("/email", { state: { messageId } });
//   };

//   if (loading) {
//     return <div>Loading emails...</div>;
//   }

//   if (error) {
//     return <div>{error}</div>;
//   }

//   return (
//     <div>
//       <h2>Inbox</h2>
//       {messages.length === 0 ? (
//         <p>No emails found.</p>
//       ) : (
//         <ul>
//           {messages.map((message, index) => (
//             <li key={index}>
//               <button
//                 onClick={() => handleEmailClick(message.id)}
//                 className="text-blue-500"
//               >
//                 {message.snippet || "No Subject"}
//               </button>
//             </li>
//           ))}
//         </ul>
//       )}
//     </div>
//   );
// };

// export default Email;
