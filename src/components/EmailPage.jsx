import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Inbox from "./Inbox";
import ComposeEmail from "./ComposeEmail";

const EmailPage = () => {
  const [accessToken, setAccessToken] = useState(null);
  const [emails, setEmails] = useState([]);
  const [emailDetails, setEmailDetails] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const [isComposing, setIsComposing] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (emailDetails) {
      console.log("Full Email Details:", emailDetails);
    }
  }, [emailDetails]);

  useEffect(() => {
    const storedToken = localStorage.getItem("google_access_token");
    if (!storedToken) {
      setError("You need to authenticate to access your emails.");
      navigate("/email-auth");
      return;
    }
    setAccessToken(storedToken);
  }, [navigate]);

  useEffect(() => {
    if (accessToken) fetchEmails();
  }, [accessToken]);

  const fetchEmails = async () => {
    setLoading(true);
    try {
      // Fetch the list of emails
      const response = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=10&q=label:inbox", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!response.ok) throw new Error("Failed to fetch emails");
  
      const data = await response.json();
      const messages = data.messages || [];
  
      // Fetch detailed information for each email
      const detailedEmails = await Promise.all(
        messages.map(async (message) => {
          const detailsResponse = await fetch(
            `https://gmail.googleapis.com/gmail/v1/users/me/messages/${message.id}`,
            {
              headers: { Authorization: `Bearer ${accessToken}` },
            }
          );
          if (!detailsResponse.ok) throw new Error("Failed to fetch email details");
  
          const details = await detailsResponse.json();
          return {
            id: details.id,
            threadId: details.threadId,
            snippet: details.snippet, // Extract the snippet for preview
          };
        })
      );
  
      setEmails(detailedEmails); // Update the state with detailed email information
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmailDetails = async (emailId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${emailId}?format=full`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
  
      if (!response.ok) {
        throw new Error("Failed to fetch email details");
      }
  
      const data = await response.json();
      setEmailDetails(data); // Update the state with email details
    } catch (err) {
      setError(err.message || "Failed to fetch email details.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const extractEmailHeader = (headers, name) => {
    const header = headers.find((header) => header.name === name);
    return header ? header.value : "Unknown";
  };
  
  const renderEmailBody = (payload) => {
    const bodyData = payload.body.data || 
                     (payload.parts && payload.parts[0]?.body?.data);
  
    if (!bodyData) {
      return "No body content available.";
    }
  
    try {
      const decodedBody = atob(bodyData.replace(/-/g, "+").replace(/_/g, "/"));
      return decodedBody;
    } catch (error) {
      console.error("Failed to decode email body:", error);
      return "Error decoding body.";
    }
  };

  // New function to handle attachment download
  const downloadAttachment = async (attachment, messageId, accessToken) => {
    try {
      // Check if attachmentId exists
      if (!attachment.body.attachmentId) {
        console.error("No attachmentId found");
        alert("Cannot download attachment");
        return;
      }
  
      // Fetch the attachment data from Gmail API
      const response = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}/attachments/${attachment.body.attachmentId}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
  
      if (!response.ok) {
        throw new Error('Failed to fetch attachment');
      }
  
      const attachmentData = await response.json();
  
      // Safely handle base64 decoding
      const safeBase64 = attachmentData.data
        .replace(/-/g, "+")
        .replace(/_/g, "/")
        .padEnd(attachmentData.data.length + (4 - (attachmentData.data.length % 4)) % 4, '=');
  
      // Decode the base64 attachment data
      const decodedData = atob(safeBase64);
      
      // Convert decoded data to Uint8Array
      const bytes = new Uint8Array(decodedData.length);
      for (let i = 0; i < decodedData.length; i++) {
        bytes[i] = decodedData.charCodeAt(i);
      }
  
      // Create a blob from the decoded data
      const blob = new Blob([bytes], { type: attachment.mimeType || 'application/octet-stream' });
      
      // Create a download link
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = attachment.filename || 'download';
      
      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  
    } catch (error) {
      console.error("Failed to download attachment:", error);
      alert("Failed to download attachment");
    }
  };

  const handleCancelCompose = () => {
    setIsComposing(false);
  };

  const handleSubmitCompose = () => {
    setIsComposing(false); // You can also reset other states as necessary
    fetchEmails(); // Optionally refetch the inbox after sending an email
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">{isComposing ? "Compose Email" : "Inbox"}</h1>
          <button
            onClick={() => setIsComposing(!isComposing)}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            {isComposing ? "Back to Inbox" : "Compose Email"}
          </button>
        </div>

        {isComposing ? (
          <ComposeEmail
            initialComposeForm={{ to: "", subject: "", body: "" }}
            onCancel={handleCancelCompose}
            onSubmit={handleSubmitCompose}
            loading={loading}
            accessToken={accessToken}
          />
        ) : emailDetails ? (
          <div>
            <h2 className="text-xl font-bold mb-4">Email Details</h2>
            <div className="space-y-2">
              <p><strong>Subject:</strong> {extractEmailHeader(emailDetails.payload.headers, "Subject")}</p>
              <p><strong>From:</strong> {extractEmailHeader(emailDetails.payload.headers, "From")}</p>
              <p><strong>To:</strong> {extractEmailHeader(emailDetails.payload.headers, "To")}</p>
              
              <div className="mt-4 p-3 bg-gray-100 rounded">
                <strong>Body:</strong>
                <div className="mt-2">{renderEmailBody(emailDetails.payload)}</div>
              </div>

              {/* Attachment section */}
              {emailDetails.payload.parts && (
                <div className="mt-4">
                  <strong>Attachments:</strong>
                  {emailDetails.payload.parts
                    .filter(part => part.filename && part.body)
                    .map((attachment, index) => (
                      <div 
                        key={index} 
                        className="flex items-center justify-between bg-gray-200 p-2 rounded mt-2"
                      >
                        <span>{attachment.filename}</span>
                        <button
                          onClick={() => downloadAttachment(
                            attachment, 
                            emailDetails.id, 
                            accessToken // Make sure you have the access token available
                          )}
                          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                        >
                          Download
                        </button>
                      </div>
                    ))}
                </div>
              )}

              <button
                onClick={() => setEmailDetails(null)}
                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Back to Inbox
              </button>
            </div>
          </div>
        ) : (
          <Inbox
            emails={emails}
            onEmailSelect={fetchEmailDetails} // Pass the function to fetch email details
            error={error}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
};

export default EmailPage;
