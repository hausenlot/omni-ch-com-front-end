import { useEffect, useState } from 'react';
import Sidebar from "../components/Sidebar"; // Assuming Sidebar is in components

const EmailAuth = () => {
  const [tokenClient, setTokenClient] = useState(null);
  const [accessToken, setAccessToken] = useState(null);

  const CLIENT_ID = '783763670617-gmgv3ihmq3jd2camerb8n5en32u84srk.apps.googleusercontent.com';
  const SCOPES = 'https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send';

  useEffect(() => {
    // Check for stored token on initial load
    const storedToken = localStorage.getItem('google_access_token');
    if (storedToken) {
      setAccessToken(storedToken);
    }

    const initializeGoogleSignIn = () => {
      if (window.google && window.google.accounts) {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: CLIENT_ID,
          scope: SCOPES,
          callback: (tokenResponse) => {
            if (tokenResponse.error) {
              console.error('OAuth Error:', tokenResponse.error);
              localStorage.removeItem('google_access_token');
              setAccessToken(null);
              return;
            }
            
            // Store token in localStorage
            localStorage.setItem('google_access_token', tokenResponse.access_token);
            setAccessToken(tokenResponse.access_token);
            console.log('Authentication successful');
          },
          error_callback: (error) => {
            console.error('Token initialization error:', error);
            localStorage.removeItem('google_access_token');
            setAccessToken(null);
          }
        });

        setTokenClient(client);
      } else {
        console.error('Google Identity Services script not loaded');
      }
    };

    // Load Google Identity Services script
    const script = document.createElement('script');
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = initializeGoogleSignIn;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleAuthClick = () => {
    if (tokenClient) {
      // Always request with consent to ensure fresh token
      tokenClient.requestAccessToken({ 
        prompt: 'consent' 
      });
    } else {
      console.error('Token client not initialized');
    }
  };

  const handleLogout = () => {
    // Clear the access token from state and local storage
    setAccessToken(null);
    localStorage.removeItem('google_access_token');
    
    // Optional: Revoke the token if you want to completely log out
    if (accessToken) {
      window.google.accounts.oauth2.revoke(accessToken, () => {
        console.log('Access token revoked');
      });
    }
  };

  return (
    <div className="flex">
      <Sidebar/>
      <div>
        {!accessToken ? (
          <button 
            onClick={handleAuthClick}
            className="bg-blue-500 text-white p-2 rounded"
          >
            Authenticate with Google
          </button>
        ) : (
          <div>
            <p>Authentication Successful!</p>
            <button 
              onClick={handleLogout}
              className="bg-red-500 text-white p-2 rounded mt-2"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailAuth;