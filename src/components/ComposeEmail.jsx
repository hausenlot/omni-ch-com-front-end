import { useRef, useState } from "react";

const ComposeEmail = ({
  initialComposeForm,
  onCancel,
  onSubmit,
  loading: initialLoading,
  accessToken,
}) => {
  const [composeForm, setComposeForm] = useState(initialComposeForm || { to: "", subject: "", body: "" });
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const textareaRef = useRef(null);

  // Handle changes in the form inputs
  const handleComposeChange = (e) => {
    const { name, value } = e.target;
    setComposeForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const files = e.target.files;
    setAttachments([...attachments, ...files]);
  };

  // Apply formatting to the selected text
  const applyFormatting = (formatType) => {
    if (!textareaRef.current) return;
  
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
  
    let formattedText = selectedText;
    switch (formatType) {
      case 'bold':
        formattedText = `<b>${selectedText}</b>`; // Use HTML tags for bold
        break;
      case 'italic':
        formattedText = `<i>${selectedText}</i>`; // Use HTML tags for italic
        break;
      case 'underline':
        formattedText = `<u>${selectedText}</u>`; // Use HTML tags for underline
        break;
      default:
        break;
    }
  
    const newValue = 
      textarea.value.substring(0, start) + 
      formattedText + 
      textarea.value.substring(end);
  
    setComposeForm(prev => ({
      ...prev,
      body: newValue
    }));
  
    // Move cursor to the end of the formatted text
    setTimeout(() => {
      textarea.setSelectionRange(start, start + formattedText.length);
      textarea.focus();
    }, 0);
  };  

  // Send the email
  const sendEmail = async (e) => {
    e.preventDefault(); // Prevent default form submission
    setLoading(true);
    setError(null);
  
    try {
      // Construct the email message with attachments
      const boundary = "===boundary===";
      let emailContent = [
        `To: ${composeForm.to}`,
        `Subject: ${composeForm.subject}`,
        `Content-Type: multipart/mixed; boundary="${boundary}"`,
        "",
        `--${boundary}`,
        "Content-Type: text/plain; charset=UTF-8",
        "Content-Transfer-Encoding: 7bit",
        "",
        `${composeForm.body}`, // Email body content
      ];
  
      // Add attachments using a for...of loop to await the async file reading
      for (const file of attachments) {
        const fileContent = await readFileAsBase64(file); // Await the async function
        emailContent.push(
          `--${boundary}`,
          `Content-Type: ${file.type}; name="${file.name}"`,
          `Content-Transfer-Encoding: base64`,
          `Content-Disposition: attachment; filename="${file.name}"`,
          "",
          fileContent,
          ""
        );
      }
  
      emailContent.push(`--${boundary}--`);
  
      const rawMessage = emailContent.join("\r\n");
  
      // Base64 encode the message and send it
      const encodedMessage = btoa(rawMessage).replace(/\+/g, "-").replace(/\//g, "_");
  
      const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          raw: encodedMessage,
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to send email');
      }
  
      // Reset compose form and close composition mode
      setComposeForm({ to: '', subject: '', body: '' });
      setAttachments([]); // Clear attachments
  
      // Call onSubmit if provided
      if (onSubmit) {
        onSubmit();
      }
  
      // Optional: Show success message
      alert('Email sent successfully!');
    } catch (err) {
      setError(err.message || "Failed to send email.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // Helper function to convert file to base64
  const readFileAsBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(',')[1]); // Get base64 part
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="bg-white border rounded-lg p-6 mb-4 shadow-md">
      <form onSubmit={sendEmail} className="space-y-4">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            {error}
          </div>
        )}
        <div className="flex items-center space-x-2">
          <label className="w-20">To:</label>
          <input
            type="email"
            name="to"
            value={composeForm.to}
            onChange={handleComposeChange}
            required
            className="flex-grow px-3 py-2 border rounded"
            placeholder="Recipient's email"
          />
        </div>
        <div className="flex items-center space-x-2">
          <label className="w-20">Subject:</label>
          <input
            type="text"
            name="subject"
            value={composeForm.subject}
            onChange={handleComposeChange}
            className="flex-grow px-3 py-2 border rounded"
            placeholder="Email subject"
          />
        </div>
        <div className="flex items-center space-x-2 mb-2">
          <button
            type="button"
            onClick={() => applyFormatting("bold")}
            className="px-2 py-1 border rounded hover:bg-gray-100"
          >
            <strong>B</strong>
          </button>
          <button
            type="button"
            onClick={() => applyFormatting("italic")}
            className="px-2 py-1 border rounded hover:bg-gray-100"
          >
            <em>I</em>
          </button>
          <button
            type="button"
            onClick={() => applyFormatting("underline")}
            className="px-2 py-1 border rounded hover:bg-gray-100"
          >
            <u>U</u>
          </button>
        </div>
        <div>
          <textarea
            ref={textareaRef}
            name="body"
            value={composeForm.body}
            onChange={handleComposeChange}
            required
            className="w-full px-3 py-2 border rounded h-40"
            placeholder="Email content"
          />
        </div>
        <div className="flex justify-between items-center space-x-2">
          <div>
            {attachments.length > 0 && (
              <div className="text-sm text-gray-600">
                Attachments: {attachments.map(file => file.name).join(', ')}
              </div>
            )}
          </div>
          <div className="flex space-x-2">
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              className="border p-2 rounded"
            />
            <button
              type="button"
              onClick={onCancel}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send Email"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ComposeEmail;