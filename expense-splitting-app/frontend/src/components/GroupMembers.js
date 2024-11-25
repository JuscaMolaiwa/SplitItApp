import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const GroupMembers = () => {
    const { groupId } = useParams(); // Get groupId from URL
    const [members, setMembers] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMembers = async () => {
            const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
            if (!token) {
                setErrorMessage('Authentication token is missing. Please log in.');
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(`http://127.0.0.1:5000/api/groups/members?group_id=${groupId}`, {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const result = await response.json();

                if (response.ok) {
                    setMembers(result.members || []);
                } else {
                    setErrorMessage(result.error || 'Failed to fetch group members.');
                }
            } catch (error) {
                console.error('Error fetching members:', error);
                setErrorMessage('An error occurred while fetching group members.');
            } finally {
                setLoading(false);
            }
        };

        fetchMembers();
    }, [groupId]);

    return (
        <div className="space-y-4">
            <h2 className="text-2xl font-bold">Group Members</h2>
            {loading && <div className="text-gray-500">Loading members...</div>}
            {errorMessage && <div className="text-red-600 text-sm">{errorMessage}</div>}
            {!loading && members.length === 0 && (
                <div className="text-gray-500">No members found in this group.</div>
            )}
            {!loading && members.length > 0 && (
                <ul className="space-y-2">
                    {members.map((member) => (
                        <li
                            key={member.id}
                            className="bg-gray-100 p-2 rounded-md shadow-sm text-sm flex justify-between"
                        >
                            <span>
                                <strong>{member.username}</strong> ({member.full_name})
                            </span>
                            <span className="text-gray-500 text-xs">ID: {member.id}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default GroupMembers;
