const Inbox = ({ emails, onEmailSelect, error, loading }) => {
  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
        {error}
      </div>
    );
  }
  console.log(emails[0])
  return (
    <ul className="space-y-2">
      {emails.length === 0 ? (
        <li className="text-gray-500">No emails found</li>
      ) : (
        emails.map((email) => (
          <li
            key={email.id}
            className="border-b pb-2 hover:bg-gray-100 cursor-pointer"
            onClick={() => onEmailSelect(email.id)}
          >
            {email.snippet || "No preview available"}
          </li>
        ))
      )}
    </ul>
  );
};

export default Inbox;
