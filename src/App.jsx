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
      </Routes>
    </Router>
  );
};

export default App;
