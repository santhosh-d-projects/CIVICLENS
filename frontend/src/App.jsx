import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';

import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ExploreProjectsPage } from './pages/ExploreProjectsPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { CitizenDashboard } from './pages/CitizenDashboard';
import { ContractorDashboard } from './pages/ContractorDashboard';
import { GovernmentDashboard } from './pages/GovernmentDashboard';
import { ManageProjectsPage } from './pages/ManageProjectsPage';

export function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/explore" element={<ExploreProjectsPage />} />
              <Route path="/civic-projects/:projectId" element={<ProjectDetailPage />} />

              {/* Role Protected Routes */}
              <Route
                path="/citizen/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['CITIZEN']}>
                    <CitizenDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/contractor/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['CONTRACTOR']}>
                    <ContractorDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/government/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['GOVERNMENT_ADMIN', 'CIVICLENS_ADMIN']}>
                    <GovernmentDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/government/projects/new"
                element={
                  <ProtectedRoute allowedRoles={['GOVERNMENT_ADMIN', 'CIVICLENS_ADMIN']}>
                    <ManageProjectsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/government/projects/:projectId/edit"
                element={
                  <ProtectedRoute allowedRoles={['GOVERNMENT_ADMIN', 'CIVICLENS_ADMIN']}>
                    <ManageProjectsPage />
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<HomePage />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
