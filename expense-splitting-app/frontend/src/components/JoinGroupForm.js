import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const JoinGroupForm = () => {
    const [uniqueCode, setUniqueCode] = useState('');
    const [message, setMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [joinedGroups, setJoinedGroups] = useState([]); // State for joined groups

    const fetchJoinedGroups = async () => {
        const token = localStorage.getItem('auth_token');
        if (!token) {
            setErrorMessage('Authentication token is missing!');
            return;
        }

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
                    'Authorization': `Bearer ${token}`,
                },
            });

            const result = await response.json();
            if (response.ok) {
                setJoinedGroups(result.groups); // Update the state with the joined groups
            } else {
                setErrorMessage(result.error || 'Failed to fetch groups.');
            }
        } catch (error) {
            console.error('Error fetching groups:', error);
            setErrorMessage('An error occurred while fetching groups.');
        }
    };

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
            // Get the token from local storage (ensure that the user is logged in)
            const token = localStorage.getItem('auth_token');
            if (!token) {
            setError('Authentication token is missing!');
            return;
            }

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

    useEffect(() => {
        fetchJoinedGroups(); // Fetch joined groups when the component mounts
    }, []);


    return (
        <div>

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
        <h2>Groups Joined:</h2>
            {joinedGroups.length > 0 ? (
                <ul>
                    {joinedGroups.map((group) => (
                        <li key={group.group_id}>
                            <strong>{group.name}</strong>: {group.description}
                            {/* Link to view members */}
                            <Link to={`/groups/${group.group_id}/members`}>View Members</Link>
                        </li>
                    ))}
                </ul>
            ) : (
                <div>No groups joined yet.</div>
            )}
        </div>
    );
};

export default JoinGroupForm;
