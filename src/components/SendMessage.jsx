import { useState } from 'react';
import axios from 'axios';

const SendMessage = ({ myPhoneNumber }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');

  const formatPhoneNumber = (number) => {
    // Remove all non-digit characters
    const cleaned = number.replace(/\D/g, '');
    
    // If it starts with 0, replace with 63
    if (cleaned.startsWith('0')) {
      return '+1' + cleaned.slice(1);
    }
    
    // If it starts with 63, add +
    if (cleaned.startsWith('63')) {
      return '+' + cleaned;
    }
    
    // If it's already in international format, return as is
    if (cleaned.startsWith('+1')) {
      return cleaned;
    }
    
    // Default fallback (assume it's a local number)
    return '+1' + cleaned;
  };


  const handleSendMessage = async () => {
    const formattedNumber = formatPhoneNumber(phoneNumber); // just use phoneNumber if they try to use other phonenumber XD
    try {
      const response = await axios.post('http://localhost:5000/send-sms', {
        from: myPhoneNumber,
        to: formattedNumber,
        message: message,
      });
      if (response.data.success) {
        setStatus('Message sent successfully!');
      } else {
        setStatus('Failed to send message.');
      }
    } catch (error) {
      setStatus('Error sending message.');
    }
  };

  return (
    <div className="flex-1 p-6 bg-gray-100">
      <div className="bg-white shadow-md rounded-lg p-6 max-w-md mx-auto">
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">Phone Number</label>
          <input
            type="text"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., +1234567890"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">Message</label>
          <textarea
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type your message here..."
            rows="4"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>

        <div>
          <button
            onClick={handleSendMessage}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            Send Message
          </button>
        </div>

        {status && (
          <p className="mt-4 text-center text-sm font-medium text-gray-600">
            {status}
          </p>
        )}
      </div>
    </div>
  );
};

export default SendMessage;
