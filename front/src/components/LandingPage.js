import React from 'react';
import { Link } from 'react-router-dom';

function LandingPage() {
  return (
    <div>
      <h1>Welcome to My Landing Page</h1>
      <Link to="/main/">Go to Main Page</Link> {/* Link to /main/ */}
    </div>
  );
}

export default LandingPage;
