import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaUsers } from 'react-icons/fa';
import { FaCog } from 'react-icons/fa'


const JoinGroupForm = ({groups}) => {
    const [uniqueCode, setUniqueCode] = useState('');
    const [message, setMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [joinedGroups, setJoinedGroups] = useState([]); // State for joined groups

    // Reusable function to fetch joined groups
    const fetchJoinedGroups = async () => {
        const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
        if (!token) {
            setErrorMessage('Authentication token is missing!');
            return;
        }

        try {
            // Get the token from local storage (ensure that the user is logged in)
            const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
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

        const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
        if (!token) {
            setErrorMessage('Authentication token is missing!');
            return;
        }

        try {
            setLoading(true); // Indicate loading state
            setError(null);
            // Get the token from local storage (ensure that the user is logged in)
            const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');

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
    });


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
        
        <h2 className="text-lg font-semibold mb-4">Groups Joined:</h2>
        
            {joinedGroups.length > 0 ? (
                <table className="min-w-full bg-white border border-gray-300 shadow-lg rounded-lg">
                    <thead>
                        <tr>
                            <th className="px-4 py-2 border-b border-gray-300 bg-gray-100 text-left">Group Name <FaUsers className="text-indigo-600 mr-2" size={16} /></th>
                            <th className="px-4 py-2 border-b border-gray-300 bg-gray-100 text-left"><div className="flex items-center"><span>Description</span> </div></th>
                            <th className="px-4 py-2 border-b border-gray-300 bg-gray-100 text-left">Actions <FaCog className="text-indigo-600 mr-2" size={11}/></th>
                        </tr>
                    </thead>
                    <tbody>
                        {joinedGroups.map((group) => (
                            <tr key={group.group_id} className="border-b border-gray-200 hover:bg-gray-50">
                                <td className="px-4 py-3 border-gray-300">{group.name}</td>
                                <td className="px-4 py-3 border-gray-300">
                                    {group.description || 'No description provided'}
                                </td>
                                <td className="px-4 py-3 border-gray-300">
                                    <Link 
                                        to={`/groups/members?group_id=${group.group_id}`}
                                        className="text-indigo-600 hover:text-indigo-800 font-medium"
                                    >
                                        View Members
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <div>No groups joined yet.</div>
            )}
        </div>
    );
};

export default JoinGroupForm;