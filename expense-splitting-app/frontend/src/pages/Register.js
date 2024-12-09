import React from 'react';

const Register = () => {
  return (
    <div>
      <h2>Register</h2>
      <p>Register to create a new account.</p>
      <form>
        <div>
          <label>Username</label>
          <input type="text" required />
        </div>
        <div>
          <label>Password</label>
          <input type="password" required />
        </div>
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default Register;
