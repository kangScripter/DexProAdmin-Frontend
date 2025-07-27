import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminLogin from './components/AdminLogin';
import Dashboard from './pages/Dashboard';
import Blogs from './pages/Blogs';
import NewBlog from './pages/NewBlog';
import AuthRedirect from './components/AuthRedirect';
import ProtectedRoute from './components/ProtectedRoute';
import BlogDetails from './pages/BlogContent';
import Leads from './pages/Leads';
import Ebook from './pages/Ebook';
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
      </Routes>
    </Router>
  );
};

export default App;
