import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const BlogDetails = () => {
  const { blogId } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const res = await axios.get(`http://127.0.0.1:3000/api/blogs/${blogId}`);
        setBlog(res.data.blog);
      } catch (error) {
        console.error('Failed to fetch blog:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [blogId]);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;
  if (!blog) return <div className="p-8 text-center text-red-500">Blog not found</div>;

  return (
    <main className="pt-20">
      {/* Featured Image */}
      {blog.featured_image && (
        <div className="max-w-4xl mx-auto px-4 mt-8">
            <div className="w-full h-96 overflow-hidden rounded-2xl">
          <img
            src={blog.featured_image}
            alt={blog.title}
            className="w-full h-full object-cover object-center"
          />
          </div>
        </div>
      )}

      {/* Blog Header */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
          {blog.title}
        </h1>

        <div className="flex items-center justify-between mb-8 pb-8 border-b border-gray-100">
          <div className="flex items-center space-x-4">
            {/* Placeholder author info */}
            <img
              src="/avatar-placeholder.png"
              alt="Author"
              className="w-12 h-12 rounded-full object-cover"
            />
            <div>
              <p className="font-semibold text-gray-900">Admin</p>
              <p className="text-sm text-gray-500">{new Date(blog.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Blog Content */}
        <div className="prose prose-lg max-w-none text-gray-800">
          <div
            dangerouslySetInnerHTML={{ __html: blog.content }}
            style={{ fontSize: '18px', lineHeight: '1.8' }}
          />
        </div>
      </div>
    </main>
  );
};

export default BlogDetails;
