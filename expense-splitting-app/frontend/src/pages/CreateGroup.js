import React, { useState } from 'react';

const CreateGroup = () => {
  const [groupName, setGroupName] = useState('');
  const [message, setMessage] = useState('');

  const handleCreateGroup = () => {
    if (!groupName) {
      setMessage('Group name cannot be empty.');
      return;
    }

    setMessage(`Group "${groupName}" created successfully!`);
    setGroupName('');
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Create Group</h2>
      <input
        type="text"
        value={groupName}
        onChange={(e) => setGroupName(e.target.value)}
        placeholder="Enter Group Name"
        style={styles.input}
      />
      <button onClick={handleCreateGroup} style={styles.button}>
        Create
      </button>
      {message && (
        <p
          style={{
            ...styles.message,
            color: message.includes('successfully') ? 'green' : 'red',
          }}
        >
          {message}
        </p>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '400px',
    margin: '50px auto',
    padding: '20px',
    border: '1px solid #ddd',
    borderRadius: '10px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    textAlign: 'center',
    backgroundColor: '#f9f9f9',
  },
  heading: {
    fontSize: '24px',
    marginBottom: '20px',
    color: '#333',
  },
  input: {
    width: '100%',
    padding: '10px',
    marginBottom: '15px',
    border: '1px solid #ccc',
    borderRadius: '5px',
    fontSize: '16px',
  },
  button: {
    padding: '10px 20px',
    fontSize: '16px',
    color: '#fff',
    backgroundColor: '#3b82f6',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  },
  buttonHover: {
    backgroundColor: '#2563eb',
  },
  message: {
    marginTop: '15px',
    fontSize: '14px',
  },
};

export default CreateGroup;
