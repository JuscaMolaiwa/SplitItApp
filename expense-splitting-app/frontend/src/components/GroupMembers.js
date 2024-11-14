import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const GroupMembers = () => {
    const { groupId } = useParams(); // Get the groupId from the URL
    const [members, setMembers] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(true); // Loading state

    useEffect(() => {
        const fetchMembers = async () => {
            const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
            if (!token) {
                setErrorMessage('Authentication token is missing!');
                setLoading(false); // Stop loading
                return;
            }

            try {
                const groupId = localStorage.getItem('group_id');
                console.log('The Selected for getting memebrs group ID:', groupId);
                const response = await fetch(`http://127.0.0.1:5000/api/groups/members?group_id=${groupId}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                const result = await response.json();
                if (response.ok) {
                    setMembers(result.members); // Update state with fetched members
                } else {
                    setErrorMessage(result.error || 'Failed to fetch members.');
                }
            } catch (error) {
                console.error('Error fetching members:', error);
                setErrorMessage('An error occurred while fetching members.');
            } finally {
                setLoading(false); // Stop loading
            }
        };

        fetchMembers();
    }, [groupId]); // Re-fetch when groupId changes

    return (
        <div>
            <h2>Group Members</h2>
            {loading && <div>Loading...</div>}
            {errorMessage && <div className="text-red-500">{errorMessage}</div>}
            {!loading && members.length === 0 && <div>No members found.</div>}
            <ul>
                {members.map((member) => (
                    <li key={member.id}>
                        {member.username} ({member.full_name})
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default GroupMembers;