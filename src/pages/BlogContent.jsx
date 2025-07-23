import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import 'react-quill-new/dist/quill.core.css';
import 'react-quill-new/dist/quill.snow.css';

const API_URL = import.meta.env.VITE_API_URL;

const BlogDetails = () => {
  const { blogId } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/blogs/${blogId}`);
        setBlog(res.data.blog);
      } catch (error) {
        console.error('Failed to fetch blog:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [blogId]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-6">
      <div className="text-center text-gray-600 text-xl font-medium animate-pulse">Loading blog content...</div>
    </div>
  );
  if (!blog) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-6">
      <div className="text-center text-red-600 text-xl font-semibold">Blog not found. It might have been moved or deleted.</div>
    </div>
  );

  return (
    <main className="min-h-screen bg-white text-gray-900 py-16 md:py-20 lg:py-24">
      <article className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 xl:px-12">
        {/* Blog Header (Title, Author, Date) */}
        <header className="text-center mb-12 sm:mb-16">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight mb-5 text-gray-900">
            {blog.title}
          </h1>
          <div className="flex items-center justify-center gap-3 text-gray-600 text-base md:text-lg">
            <div className="w-9 h-9 flex items-center justify-center rounded-full bg-blue-100 text-blue-600 border border-blue-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="font-medium text-gray-800">Admin</p>
            <span className="text-gray-400">•</span>
            <p className="text-gray-500">{new Date(blog.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
        </header>
        {/* Featured Image Section */}
        {blog.featured_image && (
          <div className="mb-12 sm:mb-16">
            <img
              src={blog.featured_image}
              alt={blog.title}
              className="w-full h-72 sm:h-96 md:h-[550px] object-cover object-center rounded-2xl shadow-lg transition-transform duration-300 hover:scale-[1.005]"
            />
          </div>
        )}
        {/* Blog Content Area */}
        <section
          className="prose prose-lg sm:prose-xl max-w-none text-gray-800 prose-headings:font-bold prose-headings:text-gray-900 prose-p:leading-relaxed prose-p:text-gray-700 prose-a:text-blue-700 hover:prose-a:text-blue-800 prose-a:font-medium hover:prose-a:underline prose-ul:list-disc prose-ol:list-decimal prose-li:marker:text-blue-600 prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:pl-5 prose-blockquote:italic prose-blockquote:text-gray-600 prose-img:rounded-xl prose-img:shadow-md prose-img:hover:shadow-lg prose-img:transition-all prose-img:duration-300 ql-editor"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />
        {/* Optional: Add a subtle separator or a "Back to Blog" link */}
        <div className="text-center mt-20 pt-10 border-t border-gray-200">
          <p className="text-gray-500 text-sm">Thank you for reading.</p>
        </div>
      </article>
    </main>
  );
};

export default BlogDetails;