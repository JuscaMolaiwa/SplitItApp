import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";

const CreateExpenses = forwardRef(
  ({ token, groupId, onExpenseCreated }, ref) => {
    const [groups, setGroups] = useState([]);
    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState("");
    // eslint-disable-next-line no-unused-vars
    const [category_id, setCategoryId] = useState("");
    const [group_id, setGroupId] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    // eslint-disable-next-line no-unused-vars
    const [groupMembers, setGroupMembers] = useState([]);
    // eslint-disable-next-line no-unused-vars
    const [splitMethod, setSplitMethod] = useState("equal");
    // eslint-disable-next-line no-unused-vars
    const [customSplit, setCustomSplit] = useState({});
    // eslint-disable-next-line no-unused-vars
    const [error, setError] = useState(null);

    const fetchUserGroups = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("auth_token");
        if (!token) {
          setError("Authentication token is missing!");
          return;
        }

        const response = await fetch("http://127.0.0.1:5000/api/groups", {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
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
    };

    useImperativeHandle(ref, () => ({
      fetchUserGroups,
    }));

    // Handle form submission (unique definition)
    const submitExpenseForm = async (event) => {
      event.preventDefault();

      if (!amount || !description || !group_id) {
        setErrorMessage("All fields are required.");
        return;
      }
      console.log("Selected group ID:", group_id);

      setLoading(true);
      setErrorMessage("");
      setSuccessMessage("");

      try {
        const token =
          localStorage.getItem("auth_token") ||
          sessionStorage.getItem("auth_token");
        if (!token) {
          setError("Authentication token is missing!");
          return;
        }

        const response = await fetch("http://127.0.0.1:5000/api/expenses", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
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
          console.log("Group ID from localStorage:", group_id);
          setAmount("");
          setDescription("");
          setGroupId("");
          onExpenseCreated();
          localStorage.setItem("group_id", group_id);
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

    useEffect(() => {
      fetchUserGroups();
    }, []);

    return (
      <form onSubmit={submitExpenseForm} className="space-y-4">
        <h2 className="text-xl font-bold">Create Expense</h2>

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
            {Array.isArray(groups) && groups.length > 0 ? (
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
          className={`bg-blue-500 text-white p-2 rounded-md ${
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
