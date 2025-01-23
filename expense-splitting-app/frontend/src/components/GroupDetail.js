import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import GroupMembers from "../components/GroupMembers";

const GroupDetail = () => {
  const { id: groupId } = useParams(); // Extract groupId from URL
  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchGroupDetails = async () => {
      const token =
        localStorage.getItem("auth_token") ||
        sessionStorage.getItem("auth_token");

      if (!token) {
        setErrorMessage("Authentication token is missing. Please log in.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `http://127.0.0.1:5000/api/groups/details?group_id=${groupId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!groupId) {
          setErrorMessage("Invalid group ID. Please try again.");
          setLoading(false);
          return;
        }
        const result = await response.json();
        console.log("API Response:", result);

        if (response.ok) {
          setGroup(result.group);
          setExpenses(result.expenses || []);
        } else {
          setErrorMessage(result.error || "Failed to fetch group details.");
        }
      } catch (error) {
        console.error("Error fetching group details:", error);
        setErrorMessage("An error occurred while fetching group details.");
      } finally {
        setLoading(false);
      }
    };

    fetchGroupDetails();
  }, [groupId]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        Loading group details...
      </div>
    );
  }

  if (errorMessage) {
    return <div className="text-red-600 text-center mt-4">{errorMessage}</div>;
  }

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      {/* Left Section: Group Expenses */}
      <div style={{ flex: 1, padding: "1rem", overflowY: "auto" }}>
        <div
          style={{
            backgroundColor: "indigo",
            color: "white",
            padding: "1rem",
            borderRadius: "0.5rem",
            marginBottom: "1rem",
          }}
        >
          <h1 style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
            {group.name}
          </h1>
          <p style={{ margin: "0.5rem 0 0", fontSize: "1rem" }}>
            Balance:{" "}
            <span
              style={{
                fontWeight: "bold",
                color: group.balance < 0 ? "red" : "green",
              }}
            >
              {group.balance < 0
                ? `Owe $${Math.abs(group.balance)}`
                : `Owed $${group.balance}`}
            </span>
          </p>
        </div>

        <h2
          style={{
            fontSize: "1.25rem",
            fontWeight: "bold",
            marginBottom: "1rem",
          }}
        >
          Group Expenses
        </h2>
        {expenses.length === 0 ? (
          <p style={{ color: "#6b7280" }}>No expenses found for this group.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {expenses.map((expense) => (
              <li
                key={expense.id}
                style={{
                  marginBottom: "1rem",
                  padding: "1rem",
                  backgroundColor: "white",
                  borderRadius: "0.5rem",
                  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <strong>{expense.description}</strong>
                  <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                    Added by {expense.addedBy} on{" "}
                    {new Date(expense.date).toLocaleDateString()}
                  </p>
                </div>
                <span
                  style={{
                    fontWeight: "bold",
                    color: expense.amount < 0 ? "red" : "green",
                  }}
                >
                  ${expense.amount.toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Right Section: Group Members */}
      <GroupMembers groupName={group.name} groupBalance={group.balance} />
    </div>
  );
};

export default GroupDetail;
