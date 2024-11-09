import React, { useState } from 'react';

// Group Creation
const GroupCreation = () => {
    const [groupName, setGroupName] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleGroupCreation = async () => {
        if (!groupName) {
            setErrorMessage('Group name is required.');
            return;
        }

        setLoading(true);
        setErrorMessage('');
        setSuccessMessage('');

        const groupData = { name: groupName };

        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch('http://127.0.0.1:5000/api/groups', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(groupData),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccessMessage('Group created successfully!');
                setGroupName(''); // Clear the input field
            } else {
                setErrorMessage(data.error || 'Group creation failed');
            }
        } catch (error) {
            setErrorMessage(`An error occurred: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold">Create a Group</h2>

            {errorMessage && <div className="text-red-500 text-sm">{errorMessage}</div>}
            {successMessage && <div className="text-green-500 text-sm">{successMessage}</div>}

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
                />
            </div>

            <button
                onClick={handleGroupCreation}
                disabled={loading}
                className={`bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                {loading ? 'Creating...' : 'Create Group'}
            </button>
        </div>
    );
};

export default GroupCreation;
