import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../styles/GroupMembers.css";

const GroupMembers = ({ groupName, groupBalance }) => {
  const { groupId } = useParams(); // Get groupId from URL
  const [members, setMembers] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Ensure `groupId` is valid
    if (!groupId) {
      setErrorMessage("Invalid group ID. Please try again.");
      setLoading(false);
      return;
    }

    /**
     * Fetches group members from the API using the provided `groupId` and
     * updates the component state accordingly.
     *
     * @param {string} groupId - The ID of the group to fetch members for.
     */
    const fetchMembers = async () => {
      try {
        // Retrieve the auth token
        const token =
          localStorage.getItem("auth_token") ||
          sessionStorage.getItem("auth_token");

        if (!token) {
          setErrorMessage("Authentication token is missing. Please log in.");
          setLoading(false);
          return;
        }

        // Fetch group members from API
        const response = await fetch(
          `http://127.0.0.1:5000/api/groups/members?group_id=${groupId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const result = await response.json();

        if (response.ok) {
          setMembers(result.members || []);
          setErrorMessage("");
        } else {
          setErrorMessage(result.error || "Failed to fetch group members.");
        }
      } catch (error) {
        console.error("Error fetching members:", error);
        setErrorMessage("An error occurred while fetching group members.");
      } finally {
        setLoading(false); // Ensure loading state is updated
      }
    };

    fetchMembers();
  }, [groupId]); // Dependency array ensures the effect only runs when `groupId` changes

  return (
    <div className="group-members-container">
      {/* Group Info */}
      <div className="group-info">
        <h2>{groupName}</h2>
        <p>
          Balance:{" "}
          <strong>
            {groupBalance < 0
              ? `Owe $${Math.abs(groupBalance)}`
              : `Owed $${groupBalance}`}
          </strong>
        </p>
      </div>

      {/* Members Section */}
      <h3>Members</h3>
      {loading && <div>Loading members...</div>}
      {errorMessage && <div className="error">{errorMessage}</div>}
      {!loading && members.length === 0 && (
        <div>No members found in this group.</div>
      )}
      {!loading && Array.isArray(members) && members.length > 0 && (
        <ul className="members-list">
          {members.map((member) => (
            <li key={member.id} className="member-item">
              <span>
                <strong>{member.username}</strong> ({member.full_name})
              </span>
              <span>ID: {member.id}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default GroupMembers;
