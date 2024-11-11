import React, { useState, useEffect } from 'react';

const CreateExpenses = ({ token }) => {
    const [groups, setGroups] = useState([]); // Initialize groups as an empty array
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [category_id, setCategoryId] = useState('');
    const [group_id, setGroupId] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [error, setError] = useState(null);

    // Fetch user's active groups and populate the dropdown
    const fetchUserGroups = async () => {
        setLoading(true); // Start loading while fetching groups
        try {
            // Get the token from local storage (ensure that the user is logged in)
            const token = localStorage.getItem('auth_token');
            if (!token) {
            setError('Authentication token is missing!');
            return;
            }

            const response = await fetch('http://127.0.0.1:5000/api/groups', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log('Response status:', response.status);
            const data = await response.json();
            console.log('Fetched groups:', data); // Log the response for debugging

            // Check the structure of the response
        if (Array.isArray(data)) {
            setGroups(data); // If data is an array, set it to groups
        } else if (data && Array.isArray(data.groups)) {
            setGroups(data.groups); // If groups is an array within data
        } else {
                setErrorMessage('Failed to load groups: Invalid data format.');
            }
        } catch (error) {
            console.error('Error fetching user groups:', error);
            setErrorMessage('Failed to load groups.');
        } finally {
            setLoading(false); // Stop loading after fetch is complete
        }
    };

    // Handle form submission
    const submitExpenseForm = async (event) => {
        event.preventDefault();

        // Validate form fields
        if (!amount || !description || !group_id) {
            setErrorMessage('All fields are required.');
            return;
        }
        console.log('Selected group ID:', group_id);

        setLoading(true);
        setErrorMessage('');
        setSuccessMessage('');

        try {
            // Get the token from local storage (ensure that the user is logged in)
            const token = localStorage.getItem('auth_token');
            if (!token) {
            setError('Authentication token is missing!');
            return;
            }
            const response = await fetch('http://127.0.0.1:5000/api/expenses', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    amount: parseFloat(amount), // Ensure amount is a number
                    description,
                    group_id: parseInt(group_id, 10) // Convert group_id to an integer
                })
            });

            const result = await response.json();
            if (response.ok) {
                setSuccessMessage('Expense created successfully!');
                // Optionally reset the form or provide user feedback
                setAmount('');
                setDescription('');
                setGroupId('');
            } else {
                setErrorMessage(result.error || 'Error creating expense.');
            }
        } catch (error) {
            console.error('Error submitting expense form:', error);
            setErrorMessage('An error occurred while submitting the form.');
        } finally {
            setLoading(false);
        }
    };

    // Call fetchUserGroups on page load
    useEffect(() => {
        fetchUserGroups();
    }, []);

    return (
        <form onSubmit={submitExpenseForm} className="space-y-4">
            <h2 className="text-xl font-bold">Create Expense</h2>

            {errorMessage && <div className="text-red-500">{errorMessage}</div>}
            {successMessage && <div className="text-green-500">{successMessage}</div>}

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
                onChange={(e) => setGroupId(e.target.value)} // This should set group_id correctly
                required
                className="block w-full mt-2 p-2 border rounded-md"
            >
                <option value="">Select a group</option>
                {loading && <option>Loading groups...</option>}
                {Array.isArray(groups) && groups.length > 0 ? (
                    groups.map(group => (
                        <option key={group.group_id} value={group.group_id}>  {/* Ensure using group.group_id */}
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
                className={`bg-blue-500 text-white p-2 rounded-md ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                {loading ? 'Submitting...' : 'Create Expense'}
            </button>
        </form>
    );
};

export default CreateExpenses;
