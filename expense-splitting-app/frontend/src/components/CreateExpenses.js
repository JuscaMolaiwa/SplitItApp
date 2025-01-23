import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useCallback,
} from "react";
import { useNavigate, useParams } from "react-router-dom"; // Add useParams import

const CreateExpenses = forwardRef(
  ({ token, groupId: propGroupId, onExpenseCreated }, ref) => {
    const navigate = useNavigate();
    const { groupId: routeGroupId } = useParams();
    const [groups, setGroups] = useState([]);
    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [splitType, setSplitType] = useState("equal");
    const [currency, setCurrency] = useState("USD");
    const [participants, setParticipants] = useState([]);
    const [groupMembers, setGroupMembers] = useState([]);
    const [selectedGroupId, setSelectedGroupId] = useState(
      propGroupId || routeGroupId || ""
    ); // New state for group_id

    // Use handleSuccessfulCreation when needed
    const handleSuccessfulCreation = () => {
      navigate(-1);
      if (onExpenseCreated) {
        onExpenseCreated();
      }
    };

    // Add currency options based on backend CURRENCY_SYMBOLS
    const currencies = [
      { code: "USD", symbol: "$" },
      { code: "EUR", symbol: "€" },
      { code: "GBP", symbol: "£" },
      { code: "ZAR", symbol: "R" },
    ];

    // Add split type options
    const splitTypes = [
      { value: "equal", label: "Equal Split" },
      { value: "percentage", label: "Percentage Split" },
      { value: "custom_amount", label: "Custom Amount" },
    ];

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

    const fetchGroupMembers = async (selectedGroupId) => {
      if (!selectedGroupId) return;

      const authToken = localStorage.getItem("auth_token") || token;
      if (!authToken) {
        setErrorMessage("Authentication token is missing. Please log in.");
        return;
      }

      try {
        const response = await fetch(
          `http://127.0.0.1:5000/api/groups/members?group_id=${selectedGroupId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        const result = await response.json();

        if (response.ok) {
          setGroupMembers(result.members || []);
        } else {
          setErrorMessage(result.error || "Failed to fetch group members.");
        }
      } catch (error) {
        console.error("Error fetching members:", error);
        setErrorMessage("An error occurred while fetching group members.");
      }
    };

    useImperativeHandle(ref, () => ({
      fetchUserGroups,
    }));

    useEffect(() => {
      fetchUserGroups();
    }, [fetchUserGroups]); // Add fetchUserGroups to the dependency array

    const validateForm = () => {
      if (!amount || !description || !selectedGroupId) {
        // Use selectedGroupId instead of group_id
        setErrorMessage("All fields are required.");
        return false;
      }

      return validateSplits();
    };

    const validateSplits = () => {
      switch (splitType) {
        case "percentage":
          const totalPercentage = participants.reduce(
            (sum, p) => sum + (p.percentage || 0),
            0
          );
          if (Math.abs(totalPercentage - 100) > 0.01) {
            setErrorMessage("Percentages must sum to 100%");
            return false;
          }
          break;

        case "custom_amount":
          const totalAmount = participants.reduce(
            (sum, p) => sum + (p.amount || 0),
            0
          );
          if (Math.abs(totalAmount - parseFloat(amount)) > 0.01) {
            setErrorMessage("Split amounts must sum to total amount");
            return false;
          }
          break;

        default: // Add default case for equal split
          if (!participants.length) {
            setErrorMessage("At least one participant is required");
            return false;
          }
          break;
      }
      return true;
    };

    const submitExpenseForm = async (event) => {
      event.preventDefault();

      try {
        if (!validateForm()) return;

        setLoading(true);
        setErrorMessage("");
        setSuccessMessage("");

        const authToken = localStorage.getItem("auth_token") || token; // Get token from props or localStorage
        if (!authToken) {
          setErrorMessage("Authentication token is missing. Please log in.");
          return;
        }

        const response = await fetch("http://127.0.0.1:5000/api/expenses", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`, // Use the retrieved token
          },
          body: JSON.stringify({
            amount: parseFloat(amount),
            description,
            group_id: parseInt(selectedGroupId, 10),
            split_type: splitType,
            currency,
            participants,
            paid_by: localStorage.getItem("user_id"),
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Success handling
        setSuccessMessage("Expense created successfully!");
        resetForm();
        handleSuccessfulCreation(); // Use the function here instead of calling onExpenseCreated directly
      } catch (error) {
        setErrorMessage(`Error creating expense: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    const handleGroupChange = (e) => {
      const newGroupId = e.target.value;
      setSelectedGroupId(newGroupId);
      setParticipants([]);
      fetchGroupMembers(newGroupId);
    };

    const handleParticipantToggle = (member, checked) => {
      if (checked) {
        setParticipants([
          ...participants,
          {
            user_id: member.id,
            name: member.name,
            amount: splitType === "custom_amount" ? 0 : null,
            percentage: splitType === "percentage" ? 0 : null,
          },
        ]);
      } else {
        setParticipants(participants.filter((p) => p.user_id !== member.id));
      }
    };

    const resetForm = () => {
      setAmount("");
      setDescription("");
      setSelectedGroupId(propGroupId || "");
      setSplitType("equal");
      setCurrency("USD");
      setParticipants([]);
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
          Currency:
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            required
            className="block w-full mt-2 p-2 border rounded-md"
          >
            {currencies.map(({ code, symbol }) => (
              <option key={code} value={code}>
                {code} ({symbol})
              </option>
            ))}
          </select>
        </label>

        <label>
          Split Type:
          <select
            value={splitType}
            onChange={(e) => setSplitType(e.target.value)}
            required
            className="block w-full mt-2 p-2 border rounded-md"
          >
            {splitTypes.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <label>
          Group:
          <select
            value={selectedGroupId}
            onChange={handleGroupChange}
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

        {/* Add participant selection */}
        <div className="mt-4">
          <h3 className="font-medium mb-2">Participants</h3>
          {groupMembers?.map((member) => (
            <label key={member.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={participants.some((p) => p.user_id === member.id)}
                onChange={(e) =>
                  handleParticipantToggle(member, e.target.checked)
                }
              />
              {member.name}
            </label>
          ))}
        </div>

        {/* Add split amount/percentage inputs based on split type */}
        {splitType !== "equal" && participants.length > 0 && (
          <div className="mt-4">
            <h3 className="font-medium mb-2">
              {splitType === "percentage"
                ? "Split Percentages"
                : "Split Amounts"}
            </h3>
            {participants.map((participant, index) => (
              <div
                key={participant.user_id}
                className="flex gap-2 items-center"
              >
                <span>{participant.name}:</span>
                <input
                  type="number"
                  value={
                    splitType === "percentage"
                      ? participant.percentage
                      : participant.amount
                  }
                  onChange={(e) => {
                    const newParticipants = [...participants];
                    if (splitType === "percentage") {
                      newParticipants[index].percentage = parseFloat(
                        e.target.value
                      );
                    } else {
                      newParticipants[index].amount = parseFloat(
                        e.target.value
                      );
                    }
                    setParticipants(newParticipants);
                  }}
                  className="w-24 p-1 border rounded"
                  min="0"
                  step={splitType === "percentage" ? "0.01" : "0.01"}
                />
                {splitType === "percentage" && "%"}
              </div>
            ))}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`bg-indigo-600 text-white p-2 rounded-md ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "Submitting..." : "Create Expense"}
        </button>

        {loading && (
          <div className="text-center py-4">
            <div className="spinner"></div>
            <p>Creating expense...</p>
          </div>
        )}
      </form>
    );
  }
);

export default CreateExpenses;
