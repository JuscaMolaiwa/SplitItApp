import React, { useState } from 'react';

// Group Creation
const GroupCreation = () => {
    const [groupName, setGroupName] = useState('');
  
    const handleGroupCreation = () => {
      // Call backend API to create new group
      // ...
    };
  
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Create a Group</h2>
        <div>
          <label htmlFor="groupName" className="block font-medium">Group Name</label>
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
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md"
        >
          Create Group
        </button>
      </div>
    );
  };

  export default GroupCreation;
