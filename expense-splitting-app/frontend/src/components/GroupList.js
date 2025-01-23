import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const GroupList = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchGroups = async () => {
      const token =
        localStorage.getItem("auth_token") ||
        sessionStorage.getItem("auth_token");
      if (!token) {
        setErrorMessage("Authentication token is missing. Please log in.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("http://127.0.0.1:5000/api/groups", {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        const result = await response.json();

        if (response.ok) {
          setGroups(result.groups || []);
        } else {
          setErrorMessage(result.error || "Failed to fetch groups.");
        }
      } catch (error) {
        console.error("Error fetching groups:", error);
        setErrorMessage("An error occurred while fetching groups.");
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, []);

  return (
    <div>
      {loading && <div className="text-gray-300">Loading groups...</div>}
      {errorMessage && <div className="text-red-500">{errorMessage}</div>}
      {!loading && groups.length === 0 && (
        <div className="text-gray-300">
          No groups found. Join or create one!
        </div>
      )}
      {!loading && groups.length > 0 && (
        <ul className="space-y-4">
          {groups.map((group) => (
            <li
              key={group.group_id}
              className="bg-indigo-500 text-white p-4 rounded-md shadow-md"
            >
              <Link
                to={`/app/group/${group.group_id}`}
                className="flex justify-between items-center hover:underline"
              >
                <span className="font-semibold">{group.name}</span>
                <span className="text-sm">
                  Balance:{" "}
                  {group.balance >= 0
                    ? `$${group.balance}`
                    : `-$${Math.abs(group.balance)}`}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default GroupList;
