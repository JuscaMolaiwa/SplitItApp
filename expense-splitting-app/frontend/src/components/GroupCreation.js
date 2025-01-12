import React, { useState } from "react";
import JoinGroupForm from "./JoinGroupForm";

// Group Creation Component
const GroupCreation = ({ onGroupCreated }) => {
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [groupId, setGroupId] = useState(null);

  const handleGroupCreation = async () => {
    if (!groupName.trim()) {
      setErrorMessage("Group name is required.");
      return;
    }

    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    const groupData = {
      name: groupName.trim(),
      description: groupDescription.trim(),
    };

    try {
      const token =
        localStorage.getItem("auth_token") ||
        sessionStorage.getItem("auth_token");
      if (!token) {
        setErrorMessage("Authentication token is missing. Please log in.");
        setLoading(false);
        return;
      }

      const response = await fetch("http://127.0.0.1:5000/api/groups", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(groupData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage("Group created successfully!");
        setGroupId(data.id);
        setGroupName("");
        setGroupDescription("");
        localStorage.setItem("group_id", data.id);

        if (onGroupCreated) {
          onGroupCreated();
        }
      } else {
        setErrorMessage(
          data.error || "Group creation failed. Please try again."
        );
        console.error("Error details:", data);
      }
    } catch (error) {
      setErrorMessage(`An error occurred: ${error.message}`);
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyGroupIdToClipboard = () => {
    navigator.clipboard.writeText(groupId).then(() => {
      alert("Group ID copied to clipboard!");
    });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Create a Group</h2>

      {errorMessage && (
        <div className="text-red-600 text-sm">{errorMessage}</div>
      )}
      {successMessage && (
        <div className="text-green-600 text-sm">{successMessage}</div>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="groupName" className="block font-medium">
            Group Name
          </label>
          <input
            id="groupName"
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="Enter group name"
          />
        </div>

        <div>
          <label htmlFor="groupDescription" className="block font-medium">
            Group Description (optional)
          </label>
          <input
            id="groupDescription"
            type="text"
            value={groupDescription}
            onChange={(e) => setGroupDescription(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="Enter group description"
          />
        </div>
      </div>

      <button
        onClick={handleGroupCreation}
        disabled={loading}
        className={`mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition ${
          loading ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {loading ? "Creating..." : "Create Group"}
      </button>

      {groupId && (
        <div className="mt-4 text-blue-500">
          Group ID: <strong>{groupId}</strong>{" "}
          <button
            onClick={copyGroupIdToClipboard}
            className="ml-2 text-indigo-600 hover:underline"
          >
            Copy
          </button>
          (Save this for future use)
        </div>
      )}

      {/* Join Group Section */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold">Join an Existing Group</h2>
        <JoinGroupForm />
      </div>
    </div>
  );
};

export default GroupCreation;
