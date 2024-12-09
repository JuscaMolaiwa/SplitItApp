import React from 'react';

const Dashboard = () => {
  const handleNavigation = (path) => {
    alert(`Navigate to ${path}`); // Replace with actual navigation logic
  };

  return (
    <div style={styles.container}>
      {/* Navigation Bar */}
      <div style={styles.navbar}>
        <h1 style={styles.logo}>SplitItApp</h1>
        <div style={styles.navLinks}>
          <button style={styles.navButton} onClick={() => handleNavigation('home')}>Home</button>
          <button style={styles.navButton} onClick={() => handleNavigation('create-group')}>Create Group</button>
          <button style={styles.navButton} onClick={() => handleNavigation('manage-groups')}>Manage Groups</button>
        </div>
      </div>

      {/* Main Content */}
      <h2 style={styles.heading}>Dashboard</h2>
      <p style={styles.description}>
        Welcome to the dashboard. You can create and manage your groups here.
      </p>

      {/* Cards Section */}
      <div style={styles.cardContainer}>
        <div style={styles.card} onClick={() => handleNavigation('create-group')}>
          <h3 style={styles.cardTitle}>Create Group</h3>
          <p style={styles.cardDescription}>
            Start a new group and split expenses easily.
          </p>
        </div>
        <div style={styles.card} onClick={() => handleNavigation('manage-groups')}>
          <h3 style={styles.cardTitle}>Manage Groups</h3>
          <p style={styles.cardDescription}>
            View, edit, or delete your existing groups.
          </p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
    textAlign: 'center',
  },
  navbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 20px',
    backgroundColor: '#3b82f6',
    color: '#fff',
    borderRadius: '8px',
    marginBottom: '30px',
  },
  logo: {
    fontSize: '24px',
    fontWeight: 'bold',
  },
  navLinks: {
    display: 'flex',
    gap: '10px',
  },
  navButton: {
    backgroundColor: '#2563eb',
    border: 'none',
    color: '#fff',
    padding: '8px 12px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'background-color 0.3s ease',
  },
  navButtonHover: {
    backgroundColor: '#1e40af',
  },
  heading: {
    fontSize: '28px',
    marginBottom: '15px',
    color: '#333',
  },
  description: {
    fontSize: '16px',
    marginBottom: '30px',
    color: '#555',
  },
  cardContainer: {
    display: 'flex',
    gap: '20px',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  card: {
    flex: '1 1 calc(50% - 40px)',
    maxWidth: '300px',
    padding: '15px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    textAlign: 'left',
    cursor: 'pointer',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  },
  cardTitle: {
    fontSize: '18px',
    marginBottom: '10px',
    color: '#222',
  },
  cardDescription: {
    fontSize: '14px',
    color: '#666',
  },
  cardHover: {
    transform: 'scale(1.05)',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.15)',
  },
};

export default Dashboard;
