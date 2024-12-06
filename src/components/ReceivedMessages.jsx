import { useState, useEffect } from 'react';

const ReceivedMessages = ({ myPhoneNumber }) => {
  console.log(myPhoneNumber);

  const [messages, setMessages] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReceivedMessages = () => {
      setIsLoading(true);
      fetch(`http://localhost:5000/fetch-received-messages?phoneNumber=${encodeURIComponent(myPhoneNumber)}`)
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(data => {
          // Filter out messages with 'failed' status and sort by date
          const validMessages = data
            .filter(message => message.status !== 'failed')
            .sort((a, b) => new Date(b.dateSent) - new Date(a.dateSent));

          setMessages(validMessages);
          setError(null);
          setIsLoading(false);
        })
        .catch(error => {
          console.error('Error fetching received messages:', error);
          setError(error.message);
          setIsLoading(false);
        });
    };

    // Fetch messages immediately
    fetchReceivedMessages();

    // Then set up polling
    const intervalId = setInterval(fetchReceivedMessages, 5000); // Poll every 5 seconds

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, [myPhoneNumber]);

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="text-lg font-medium">Loading messages...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-lg font-medium text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="px-6 py-12">
      <h2 className="text-3xl font-semibold mb-6">Received Messages</h2>
      {messages.length === 0 ? (
        <div className="text-center text-gray-500">No received messages</div>
      ) : (
        <div className="space-y-6">
          {messages.map((message) => (
            <div
              key={message.sid}
              className="bg-white shadow-md rounded-lg p-6 border border-gray-200"
            >
              <div className="flex flex-col md:flex-row justify-between">
                <div>
                  <div className="font-semibold text-gray-700">From:</div>
                  <div>{message.from}</div>
                </div>
                <div className="mt-4 md:mt-0">
                  <div className="font-semibold text-gray-700">Received:</div>
                  <div>{new Date(message.dateSent).toLocaleString()}</div>
                </div>
              </div>

              <div className="mt-4">
                <div className="font-semibold text-gray-700">Message:</div>
                <p className="text-gray-800">{message.body}</p>
              </div>

              <div className="mt-4">
                <div className="font-semibold text-gray-700">Status:</div>
                <div className={`text-sm ${message.status === 'failed' ? 'text-red-500' : 'text-green-500'}`}>
                  {message.status}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReceivedMessages;
