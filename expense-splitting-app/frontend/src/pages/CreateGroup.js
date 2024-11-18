import React, { useState } from 'react';
import API from '../api';

const CreateGroup = () => {
  const [groupName, setGroupName] = useState('');
  const [message, setMessage] = useState('');

  const handleCreateGroup = async () => {
    try {
      const response = await API.post('/groups', { name: groupName });
      setMessage(`Group "${response.data.name}" created successfully!`);
      setGroupName(''); // Clear input field
    } catch (error) {
      setMessage('Error creating group. Please try again.');
    }
  };

  return (
    <div className="create-group">
      <h2>Create Group</h2>
      <input
        type="text"
        value={groupName}
        onChange={(e) => setGroupName(e.target.value)}
        placeholder="Group Name"
      />
      <button onClick={handleCreateGroup}>Create</button>
      {message && <p>{message}</p>}
    </div>
  );
};

export default CreateGroup;