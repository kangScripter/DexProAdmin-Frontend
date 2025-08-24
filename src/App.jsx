import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminLogin from './components/AdminLogin';
import Dashboard from './pages/Dashboard';
import Blogs from './pages/Blogs';
import NewBlog from './pages/NewBlog';
import AuthRedirect from './components/AuthRedirect';
import ProtectedRoute from './components/ProtectedRoute';
import BlogDetails from './pages/BlogContent';
import Users from './pages/Users';
import ForgotPassword from './pages/ForgotPassword';

import JobApplication from './pages/JobApplication';
import JobsManagement from './pages/JobsManagement';
import CareerDashboard from './pages/CareerDashboard';
import Leads from './pages/Leads';
import Ebook from './pages/Ebook';
import ServiceManager from './pages/ServiceManager';
import ProjectRequestDashboard from './pages/ProjectRequestDashboard';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/login"
          element={
            <AuthRedirect>
              <AdminLogin />
            </AuthRedirect>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <AuthRedirect>
              <ForgotPassword />
            </AuthRedirect>
          }
        />

       <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/blogs"
          element={
            <ProtectedRoute>
              <Blogs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/blogs/new"
          element={
            <ProtectedRoute>
              <NewBlog />
            </ProtectedRoute>
          }
        />

        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <Users />
            </ProtectedRoute>
          }
        />

        <Route 
        path="/blogs/:blogId" 
        element={
          <ProtectedRoute>
            <BlogDetails />
          </ProtectedRoute>
        } />
        <Route
          path="/ebooks"
          element={
            <ProtectedRoute>
              <Ebook />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ebook-leads"
          element={
            <ProtectedRoute>
              <Leads />
            </ProtectedRoute>
          }
        />
      <Route
          path="/career-dashboard"
          element={
            <ProtectedRoute>
              <CareerDashboard />
            </ProtectedRoute>
          }
        />
      <Route
          path="/job-management"
          element={
            <ProtectedRoute>
              <JobsManagement />
            </ProtectedRoute>
          }
        />
      <Route
          path="/job-application"
          element={
            <ProtectedRoute>
              <JobApplication />
            </ProtectedRoute>
          }

        />   
      <Route
          path="/services"
          element={
            <ProtectedRoute>
              <ServiceManager />
            </ProtectedRoute>
          }
        />
      <Route
          path="/project-requirement"
          element={
            <ProtectedRoute>
              <ProjectRequestDashboard />
            </ProtectedRoute>
          }
        />                       

      </Routes>
    </Router>
  );
};

export default App;
