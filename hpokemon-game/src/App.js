import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LandingPage from './LandingPage';
import Register from './Register';
import Login from './Login';
import Dashboard from './Dashboard';
import Battle from './Battle';
import ManageTeam from './ManageTeam';
import ViewTeam from './ViewTeam';
import ComposeTeam from './ComposeTeam';
import { UserProvider } from './UserContext';

function App() {
  return (
    <UserProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/battle" element={<Battle />} />
          <Route path="/manage-team" element={<ManageTeam />} />
          <Route path="/view-team" element={<ViewTeam />} />
          <Route path="/compose-team" element={<ComposeTeam />} />
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;
