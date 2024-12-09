import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const GroupDetail = () => {
  const { id } = useParams();
  const [group, setGroup] = useState(null);

  useEffect(() => {
    // Replace with actual API call
    setGroup({ id, name: `Group ${id}`, description: 'Group details here' });
  }, [id]);

  if (!group) return <p>Loading...</p>;

  return (
    <div>
      <h2>{group.name}</h2>
      <p>{group.description}</p>
    </div>
  );
};

export default GroupDetail;
