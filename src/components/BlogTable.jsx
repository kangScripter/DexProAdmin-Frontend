import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  RiSearchLine,
  RiEditLine,
  RiDeleteBinLine,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiCloseLine,
} from "react-icons/ri";
import BlogForm from "./BlogForm";

const API_URL = import.meta.env.VITE_API_URL;

export default function BlogTable() {
  const [blogData, setBlogData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  // Fetch Blogs
  useEffect(() => {
    const fetchBlogData = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/blogs`);
        const blogs = response.data.blogs;
        const transformed = blogs.map((blog, index) => {
          const isPublished = blog.status === "Published";
          return {
            avatar: String(index + 1),
            color: "bg-blue-500",
            title: blog.title,
            slug: blog.slug,
            subtitle: `Published on ${new Date(blog.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}`,
            role: blog.category || "Uncategorized",
            roleColor: "bg-blue-100 text-blue-800",
            status: blog.status,
            statusColor: isPublished
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800",
            lastActive:
              blog.views_count > 1000
                ? (blog.views_count / 1000).toFixed(1) + "K views"
                : blog.views_count + " views",
            is_featured: blog.is_featured || false,
            is_pinned: blog.is_pinned || false,
          };
        });
        setBlogData(transformed);
      } catch (error) {
        console.error("Error fetching blog data:", error);
      }
    };

    fetchBlogData();
  }, []);

  // Fetch Categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(
          "https://api.dexprosolutions.com/api/categories/with-count"
        );
        const data = await res.json();
        setCategories(data.categories || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  // Filter Logic
  const filteredData = blogData.filter((blog) => {
    const matchesSearch = blog.title
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesCategory = selectedCategory
      ? blog.role === selectedCategory
      : true;
    const matchesStatus = selectedStatus
      ? blog.status === selectedStatus
      : true;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  // Delete Blog
  const handleDeleteBlog = async (slug) => {
    if (!window.confirm("Are you sure you want to delete this blog?")) return;
    try {
      await axios.delete(`${API_URL}/api/blogs/slug/${slug}`);
      setBlogData((prev) => prev.filter((blog) => blog.slug !== slug));
    } catch (error) {
      alert("Failed to delete blog.");
      console.error("Delete error:", error);
    }
  };

  // Edit Blog
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editBlog, setEditBlog] = useState(null);
  const [editLoading, setEditLoading] = useState(false);

  // Quick Actions
  const [updatingBlog, setUpdatingBlog] = useState(null);

  const openEditModal = (blog) => {
    setEditBlog(blog);
    setEditModalOpen(true);
  };

  const handleUpdateBlog = async (formData) => {
    setEditLoading(true);
    try {
      const payload = new FormData();
      for (const key in formData) {
        if (key !== "featured_image" && formData[key]) {
          payload.append(key, formData[key]);
        }
      }
      if (formData.featured_image) {
        payload.append("featured_image", formData.featured_image);
      }
      if (
        formData.status === "Scheduled" &&
        formData.schedule_date &&
        formData.schedule_time
      ) {
        const scheduled_time = `${formData.schedule_date}T${formData.schedule_time}:00`;
        payload.append("scheduled_time", scheduled_time);
      }
      await axios.put(`${API_URL}/api/blogs/${editBlog.slug}`, payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setEditModalOpen(false);

      // Refresh blogs
      const response = await axios.get(`${API_URL}/api/blogs`);
      setBlogData(response.data.blogs);
      alert("Blog updated!");
    } catch (error) {
      alert("Failed to update blog");
    } finally {
      setEditLoading(false);
    }
  };

  // Quick Actions
  const handleToggleFeatured = async (blog) => {
    setUpdatingBlog(blog.slug);
    try {
      await axios.patch(`${API_URL}/api/blogs/${blog.slug}/toggle-featured`);
      
      // Update local state
      setBlogData(prev => prev.map(b => 
        b.slug === blog.slug 
          ? { ...b, is_featured: !b.is_featured }
          : b
      ));
    } catch (error) {
      console.error('Failed to toggle featured status:', error);
      alert('Failed to update featured status');
    } finally {
      setUpdatingBlog(null);
    }
  };

  const handleTogglePinned = async (blog) => {
    setUpdatingBlog(blog.slug);
    try {
      await axios.patch(`${API_URL}/api/blogs/${blog.slug}/toggle-pinned`);
      
      // Update local state
      setBlogData(prev => prev.map(b => 
        b.slug === blog.slug 
          ? { ...b, is_pinned: !b.is_pinned }
          : b
      ));
    } catch (error) {
      console.error('Failed to toggle pinned status:', error);
      alert('Failed to update pinned status');
    } finally {
      setUpdatingBlog(null);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 mt-8">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Blog Posts Management
          </h3>
        </div>

        <div className="flex items-center space-x-4">
          {/* 🔎 Search */}
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search posts..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1); // reset to first page
              }}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent w-full"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 flex items-center justify-center">
              <RiSearchLine className="text-gray-400 text-sm" />
            </div>
          </div>

          {/* 📂 Category filter */}
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setCurrentPage(1);
            }}
            className="border border-gray-300 rounded-lg px-3 py-2 pr-8"
          >
            <option value="">All Categories</option>
            {categories.map((cat, index) => (
              <option key={index} value={cat.category}>
                {cat.category} ({cat.post_count})
              </option>
            ))}
          </select>

          {/* 📌 Status filter */}
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="border border-gray-300 rounded-lg px-3 py-2 pr-8"
          >
            <option value="">All Status</option>
            <option value="Published">Published</option>
            <option value="Draft">Draft</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Table - unchanged UI */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <input type="checkbox" className="rounded border-gray-300" />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Blog
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Views
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Featured
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pinned
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.map((row, index) => (
              <tr key={index}>
                <td className="px-6 py-4">
                  <input type="checkbox" className="rounded border-gray-300" />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div
                      className={`w-10 h-10 ${row.color} rounded-full flex items-center justify-center text-white font-medium`}
                    >
                      {row.avatar}
                    </div>
                    <div className="ml-4">
                      <a
                        href={`https://dexprosolutions.com/blog/${row.slug}`}
                        className="text-sm font-medium text-gray-900 hover:text-blue-600"
                      >
                        {row.title}
                      </a>
                      <div className="text-sm text-gray-500">
                        {row.subtitle}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${row.roleColor}`}
                  >
                    {row.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${row.statusColor}`}
                  >
                    {row.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {row.lastActive}
                </td>
                <td className="px-6 py-4 text-center">
                  <button
                    onClick={() => handleToggleFeatured(row)}
                    disabled={updatingBlog === row.slug}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                      row.is_featured ? 'bg-primary' : 'bg-gray-200'
                    } ${updatingBlog === row.slug ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        row.is_featured ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </td>
                <td className="px-6 py-4 text-center">
                  <button
                    onClick={() => handleTogglePinned(row)}
                    disabled={updatingBlog === row.slug}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                      row.is_pinned ? 'bg-primary' : 'bg-gray-200'
                    } ${updatingBlog === row.slug ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        row.is_pinned ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <button
                      className="text-gray-400 hover:text-gray-600"
                      onClick={() => openEditModal(row)}
                    >
                      <RiEditLine />
                    </button>
                    <button
                      className="text-gray-400 hover:text-red-600"
                      onClick={() => handleDeleteBlog(row.slug)}
                    >
                      <RiDeleteBinLine />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
        <div className="text-sm text-gray-500">
          Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
          {Math.min(currentPage * itemsPerPage, filteredData.length)} of{" "}
          {filteredData.length} users
        </div>

        <div className="flex items-center space-x-2">
          <button
            className="px-3 py-1 text-gray-500 hover:text-gray-700 disabled:opacity-50"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <RiArrowLeftSLine />
          </button>

          {[...Array(totalPages)].map((_, i) => {
            const page = i + 1;
            return (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 ${
                  currentPage === page
                    ? "bg-primary text-white rounded"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {page}
              </button>
            );
          })}

          <button
            className="px-3 py-1 text-gray-500 hover:text-gray-700 disabled:opacity-50"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            <RiArrowRightSLine />
          </button>
        </div>
      </div>

      {/* Edit Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl shadow-2xl w-[95%] max-w-7xl h-[95vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-2xl font-bold text-gray-800">Edit Blog Post</h3>
              <button
                onClick={() => setEditModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <RiCloseLine size={24} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <BlogForm
                mode="edit"
                initialValues={editBlog}
                submitLabel="Update Blog"
                loading={editLoading}
                onSubmit={handleUpdateBlog}
                onCancel={() => setEditModalOpen(false)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
