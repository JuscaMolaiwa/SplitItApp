import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useCallback,
} from "react";

const CreateExpenses = forwardRef(
  ({ token, groupId, onExpenseCreated }, ref) => {
    const [groups, setGroups] = useState([]);
    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState("");
    const [group_id, setGroupId] = useState(groupId || "");
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    // Memoize the fetchUserGroups function
    const fetchUserGroups = useCallback(async () => {
      setLoading(true);
      try {
        const authToken = localStorage.getItem("auth_token") || token;
        if (!authToken) {
          setErrorMessage("Authentication token is missing. Please log in.");
          return;
        }

        const response = await fetch("http://127.0.0.1:5000/api/groups", {
          method: "GET",
          headers: { Authorization: `Bearer ${authToken}` },
        });

        const data = await response.json();
        if (Array.isArray(data)) {
          setGroups(data);
        } else if (data && Array.isArray(data.groups)) {
          setGroups(data.groups);
        } else {
          setErrorMessage("Failed to load groups: Invalid data format.");
        }
      } catch (error) {
        console.error("Error fetching user groups:", error);
        setErrorMessage("Failed to load groups.");
      } finally {
        setLoading(false);
      }
    }, [token]);

    useImperativeHandle(ref, () => ({
      fetchUserGroups,
    }));

    useEffect(() => {
      fetchUserGroups();
    }, [fetchUserGroups]); // Add fetchUserGroups to the dependency array

    const submitExpenseForm = async (event) => {
      event.preventDefault();
      if (!amount || !description || !group_id) {
        setErrorMessage("All fields are required.");
        return;
      }

      setLoading(true);
      setErrorMessage("");
      setSuccessMessage("");

      try {
        const authToken = localStorage.getItem("auth_token") || token;
        if (!authToken) {
          setErrorMessage("Authentication token is missing. Please log in.");
          return;
        }

        const response = await fetch("http://127.0.0.1:5000/api/expenses", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            amount: parseFloat(amount),
            description,
            group_id: parseInt(group_id, 10),
          }),
        });

        const result = await response.json();

        if (response.ok) {
          setSuccessMessage("Expense created successfully!");
          setAmount("");
          setDescription("");
          setGroupId(groupId || "");
          if (onExpenseCreated) onExpenseCreated();
        } else {
          setErrorMessage(result.error || "Error creating expense.");
        }
      } catch (error) {
        console.error("Error submitting expense form:", error);
        setErrorMessage("An error occurred while submitting the form.");
      } finally {
        setLoading(false);
      }
    };

    return (
      <form onSubmit={submitExpenseForm} className="space-y-4">
        <h2 className="text-xl font-bold text-indigo-700">Create Expense</h2>

        {errorMessage && <div className="text-red-500">{errorMessage}</div>}
        {successMessage && (
          <div className="text-green-500">{successMessage}</div>
        )}

        <label>
          Amount:
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            className="block w-full mt-2 p-2 border rounded-md"
          />
        </label>

        <label>
          Description:
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="block w-full mt-2 p-2 border rounded-md"
          />
        </label>

        <label>
          Group:
          <select
            value={group_id}
            onChange={(e) => setGroupId(e.target.value)}
            required
            className="block w-full mt-2 p-2 border rounded-md"
          >
            <option value="">Select a group</option>
            {loading && <option>Loading groups...</option>}
            {groups.length > 0 ? (
              groups.map((group) => (
                <option key={group.group_id} value={group.group_id}>
                  {group.name}
                </option>
              ))
            ) : (
              <option disabled>No groups available</option>
            )}
          </select>
        </label>

        <button
          type="submit"
          disabled={loading}
          className={`bg-indigo-600 text-white p-2 rounded-md ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "Submitting..." : "Create Expense"}
        </button>
      </form>
    );
  }
);

export default CreateExpenses;
