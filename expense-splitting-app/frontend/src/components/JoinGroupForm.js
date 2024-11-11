import React, { useState } from 'react';

const JoinGroupForm = () => {
    const [uniqueCode, setUniqueCode] = useState('');
    const [message, setMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleJoinGroup = async (event) => {
        event.preventDefault();
        setErrorMessage(''); // Reset error message before making request

        const token = localStorage.getItem('auth_token');
        if (!token) {
            setErrorMessage('Authentication token is missing!');
            return;
        }

        try {
            setLoading(true); // Indicate loading state
            setError(null);

            const response = await fetch('http://127.0.0.1:5000/api/groups/join', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ unique_code: uniqueCode }),
            });

            const result = await response.json();
            if (response.ok) {
                setMessage(result.message);
                setUniqueCode(''); // Clear the input field
            } else {
                setErrorMessage(result.error || 'Failed to join the group.');
            }
        } catch (error) {
            console.error('Error joining group:', error);
            setErrorMessage('An error occurred while joining the group.');
        } finally {
            setLoading(false); // Reset loading state
        }
    };

    return (
        <form onSubmit={handleJoinGroup}>
            <input
                type="text"
                value={uniqueCode}
                onChange={(e) => setUniqueCode(e.target.value)}
                placeholder="Unique Code"
                required
            />
            <button type="submit" disabled={loading}>
                {loading ? 'Joining...' : 'Join Group'}
            </button>
            {message && <div>{message}</div>}
            {errorMessage && <div>{errorMessage}</div>}
        </form>
    );
};

export default JoinGroupForm;
