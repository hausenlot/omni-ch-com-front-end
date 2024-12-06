import { Link } from "react-router-dom"; // Import Link from react-router-dom

const Sidebar = () => {
  return (
    <div className="w-64 bg-gray-800 text-white h-screen p-4">
      <h2 className="text-xl font-bold">Dashboard</h2>
      <nav className="mt-8">
        <ul>
          <li>
            <Link to="/" className="text-blue-300 hover:text-blue-500">
              Home
            </Link>
          </li>
          <li>
            <Link to="/edit-profile" className="text-blue-300 hover:text-blue-500">
              Edit Profile
            </Link>
          </li>
          <li>
            <Link to="/email-auth" className="text-blue-300 hover:text-blue-500">
              Email Authentication
            </Link>
          </li>
          <li>
            <Link to="/email" className="text-blue-300 hover:text-blue-500">
              Email
            </Link>
          </li>
          <li>
            <Link to="/chat" className="text-blue-300 hover:text-blue-500">
              Chat
            </Link>
          </li>
          <li>
            <Link to="/sms" className="text-blue-300 hover:text-blue-500">
              SMS
            </Link>
          </li>
          <li>
            <Link to="/call" className="text-blue-300 hover:text-blue-500">
              Call
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
