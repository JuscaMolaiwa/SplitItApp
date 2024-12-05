import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaUsers, FaCog } from "react-icons/fa";

const JoinGroupForm = () => {
  const [uniqueCode, setUniqueCode] = useState("");
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [joinedGroups, setJoinedGroups] = useState([]);

  // Fetch joined groups
  const fetchJoinedGroups = async () => {
    const token =
      localStorage.getItem("auth_token") ||
      sessionStorage.getItem("auth_token");
    if (!token) {
      setErrorMessage("Authentication token is missing. Please log in.");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:5000/api/groups", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();
      if (response.ok) {
        setJoinedGroups(result.groups || []);
      } else {
        setErrorMessage(result.error || "Failed to fetch groups.");
      }
    } catch (error) {
      console.error("Error fetching groups:", error);
      setErrorMessage("An error occurred while fetching groups.");
    }
  };

  // Handle group join request
  const handleJoinGroup = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    setMessage("");

    const token =
      localStorage.getItem("auth_token") ||
      sessionStorage.getItem("auth_token");
    if (!token) {
      setErrorMessage("Authentication token is missing. Please log in.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("http://127.0.0.1:5000/api/groups/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ unique_code: uniqueCode }),
      });

      const result = await response.json();
      if (response.ok) {
        setMessage(result.message || "Successfully joined the group!");
        setUniqueCode("");
        fetchJoinedGroups(); // Refresh the list of joined groups
      } else {
        setErrorMessage(result.error || "Failed to join the group.");
      }
    } catch (error) {
      console.error("Error joining group:", error);
      setErrorMessage("An error occurred while joining the group.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch joined groups on component mount
  useEffect(() => {
    fetchJoinedGroups(); // Fetch joined groups when the component mounts
  });

  return (
    <div className="p-6 space-y-6 bg-white rounded-md shadow-lg">
      <form onSubmit={handleJoinGroup} className="space-y-4">
        <div className="flex flex-col">
          <label htmlFor="uniqueCode" className="text-sm font-medium">
            Enter Unique Code
          </label>
          <input
            id="uniqueCode"
            type="text"
            value={uniqueCode}
            onChange={(e) => setUniqueCode(e.target.value)}
            placeholder="Unique Code"
            className="border p-2 rounded-md focus:outline-none focus:ring focus:ring-indigo-300"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-indigo-600 text-white py-2 rounded-md shadow hover:bg-indigo-700 transition ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "Joining..." : "Join Group"}
        </button>
        {message && <div className="text-green-600">{message}</div>}
        {errorMessage && <div className="text-red-600">{errorMessage}</div>}
      </form>

      <h2 className="text-lg font-semibold">Groups Joined:</h2>
      {joinedGroups.length > 0 ? (
        <table className="w-full bg-white border rounded-lg shadow-md">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 text-left">
                Group Name{" "}
                <FaUsers className="inline-block text-indigo-600 ml-2" />
              </th>
              <th className="px-4 py-2 text-left">Description</th>
              <th className="px-4 py-2 text-left">
                Actions <FaCog className="inline-block text-indigo-600 ml-2" />
              </th>
            </tr>
          </thead>
          <tbody>
            {joinedGroups.map((group) => (
              <tr key={group.group_id} className="hover:bg-gray-50 border-b">
                <td className="px-4 py-3">{group.name}</td>
                <td className="px-4 py-3">
                  {group.description || "No description provided"}
                </td>
                <td className="px-4 py-3">
                  <Link
                    to={`/groups/members?group_id=${group.group_id}`}
                    className="text-indigo-600 hover:text-indigo-800"
                  >
                    View Members
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="text-gray-500">No groups joined yet.</div>
      )}
    </div>
  );
};

export default JoinGroupForm;
