import React, { useRef, useState, useEffect } from 'react';
import {
  RiEyeLine,
  RiSendPlaneLine,
  RiImageLine,
  RiCloseLine,
  RiFullscreenLine,
  RiFullscreenExitLine,
  RiArrowLeftLine,
  RiSaveLine,
  RiSettings3Line,
  RiFileTextLine,
  RiGlobalLine,
  RiTimeLine,
  RiCheckLine,
  RiErrorWarningLine
} from 'react-icons/ri';
import QuillEditor from "react-quill-new";
import 'react-quill-new/dist/quill.snow.css';
import 'react-quill-new/dist/quill.bubble.css';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export default function BlogForm({
  initialValues = {},
  onSubmit,
  onCancel,
  mode = 'create',
  submitLabel = 'Publish Now',
  loading = false,
}) {
  const fileInputRef = useRef(null);
  const editorRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    short_desc: '',
    slug: '',
    featured_image: null,
    content: '',
    status: 'Draft',
    scheduled: false,
    schedule_date: '',
    schedule_time: '',
    category: '',
    tags: '',
    seo_title: '',
    seo_description: '',
    seo_keywords: '',
    is_featured: false,
    is_pinned: false,
    author_id: localStorage.getItem('user_id') || '1',
    ...initialValues,
  });

  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [images, setImages] = useState(initialValues.featured_image ? [initialValues.featured_image] : []);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [activeTab, setActiveTab] = useState('content');

  // Fetch blog data when in edit mode
  useEffect(() => {
    const fetchBlog = async () => {
      if (mode === 'edit' && initialValues.slug) {
        setIsLoading(true);
        setError('');
        try {
          const res = await axios.get(`${API_URL}/api/blogs/${initialValues.slug}`);
          if (res.data.blog) {
            const blogData = res.data.blog;
            setFormData(prev => ({
              ...prev,
              ...blogData,
              featured_image: blogData.featured_image_url || blogData.featured_image
            }));

            // Set featured image if exists
            if (blogData.featured_image_url) {
              setImages([blogData.featured_image_url]);
            }
          }
        } catch (error) {
          console.error('Failed to fetch blog:', error);
          setError('Failed to load blog data. Please try again.');
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchBlog();
  }, [mode, initialValues.slug]);

  useEffect(() => {
    setFormData((prev) => ({ ...prev, ...initialValues }));
    if (initialValues.featured_image) setImages([initialValues.featured_image]);
  }, [initialValues]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/categories`);
        if (res.status === 200) {
          setCategories(res.data.categories);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    fetchCategories();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (files) => {
    const file = files[0];
    const imageUrl = URL.createObjectURL(file);
    setImages([imageUrl]);
    setFormData((prev) => ({ ...prev, featured_image: file }));
  };

  const removeImage = () => {
    setImages([]);
    setFormData((prev) => ({ ...prev, featured_image: null }));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleImageUpload(e.dataTransfer.files);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) onSubmit(formData);
  };

  const generateSlug = () => {
    const slug = formData.title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
    handleInputChange('slug', slug);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading blog data...</p>
        </div>
      </div>
    );
  }

  if (showPreview) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <button
            onClick={() => setShowPreview(false)}
            className="text-primary hover:text-secondary mb-6 flex items-center font-medium"
          >
            <RiArrowLeftLine className="mr-2" />
            Back to Edit
          </button>
          {images.length > 0 && (
            <img
              src={images[0]}
              alt="Featured"
              className="w-full h-96 object-cover rounded-2xl mb-8 shadow-lg"
            />
          )}
          <h1 className="text-4xl font-bold mb-4 text-gray-900">{formData.title}</h1>
          <p className="text-gray-600 text-lg mb-8 leading-relaxed">{formData.short_desc}</p>
          <div
            className="prose prose-lg max-w-none text-gray-800"
            dangerouslySetInnerHTML={{ __html: formData.content }}
          />
          <div className="mt-12 p-6 bg-gray-50 rounded-2xl">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Blog Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div><strong>Category:</strong> {formData.category || 'Uncategorized'}</div>
              <div><strong>Tags:</strong> {formData.tags || 'No tags'}</div>
              <div><strong>SEO Title:</strong> {formData.seo_title || 'Not set'}</div>
              <div><strong>SEO Description:</strong> {formData.seo_description || 'Not set'}</div>
              <div><strong>Keywords:</strong> {formData.seo_keywords || 'Not set'}</div>
              <div><strong>Status:</strong> <span className={`px-2 py-1 rounded-full text-xs ${
                formData.status === 'Published' ? 'bg-green-100 text-green-800' :
                formData.status === 'Draft' ? 'bg-gray-100 text-gray-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>{formData.status}</span></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              {onCancel && (
                <button
                  onClick={onCancel}
                  className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100"
                >
                  <RiArrowLeftLine size={20} />
                </button>
              )}
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {mode === 'edit' ? 'Edit Blog Post' : 'Create New Blog Post'}
                </h1>
                <p className="text-sm text-gray-500">
                  {mode === 'edit' ? 'Update your blog post content and settings' : 'Write and publish your new blog post'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => setShowPreview(true)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center"
              >
                <RiEyeLine className="mr-2" />
                Preview
              </button>
              <button
                type="submit"
                form="blog-form"
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors flex items-center"
                disabled={loading}
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <RiSendPlaneLine className="mr-2" />
                )}
                {submitLabel}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
            <RiErrorWarningLine className="text-red-500 mr-3" size={20} />
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}

      <form id="blog-form" onSubmit={handleFormSubmit} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Title Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <label className="block text-sm font-semibold text-gray-900 mb-3">Blog Title</label>
              <input
                type="text"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter an engaging blog title..."
              />
            </div>

            {/* Short Description */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-3">
                <label className="text-sm font-semibold text-gray-900">Short Description</label>
                <span className={`text-sm ${formData.short_desc.length > 140 ? 'text-red-500' : 'text-gray-500'}`}>
                  {formData.short_desc.length}/160
                </span>
              </div>
              <textarea
                rows="3"
                maxLength="160"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                value={formData.short_desc}
                onChange={(e) => handleInputChange('short_desc', e.target.value)}
                placeholder="Write a brief description that will appear in previews..."
              />
            </div>

            {/* Featured Image */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <label className="block text-sm font-semibold text-gray-900 mb-4">Featured Image</label>
              <div
                className="upload-zone border-2 border-dashed border-gray-300 p-8 text-center rounded-xl cursor-pointer hover:bg-blue-50 transition-colors"
                onClick={() => fileInputRef.current.click()}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
              >
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-xl flex justify-center items-center mb-4">
                    <RiImageLine className="text-3xl text-gray-400" />
                  </div>
                  <p className="text-gray-600 font-medium">Drag & drop an image or click to upload</p>
                  <p className="text-gray-500 text-sm mt-1">Recommended: 1200x630px, Max 5MB</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={(e) => handleImageUpload(e.target.files)}
                  accept="image/*"
                />
              </div>
              {images.length > 0 && (
                <div className="mt-4">
                  <div className="relative overflow-hidden rounded-xl bg-gray-100">
                    <img src={images[0]} alt="preview" className="w-full h-48 object-cover" />
                    <button
                      onClick={removeImage}
                      className="absolute top-3 right-3 bg-black bg-opacity-70 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-opacity-90 transition-all"
                      type="button"
                    >
                      <RiCloseLine className="text-sm" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Content Editor */}
            <div className={`bg-white rounded-2xl shadow-sm border border-gray-200 ${isFullscreen ? 'fixed inset-0 z-[9999] bg-white overflow-auto flex flex-col w-screen h-screen top-0 left-0' : ''}`}
              style={isFullscreen ? { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', margin: 0, padding: 0, borderRadius: 0, boxShadow: 'none' } : {}}>
              <div className="flex justify-between items-center p-6 border-b border-gray-200"
                style={{ position: 'sticky', top: 0, left: 0, right: 0, borderRadius: isFullscreen ? 0 : undefined, backgroundColor: 'white', zIndex: 30 }}>
                <label className="text-sm font-semibold text-gray-900">Content</label>
                <button
                  type="button"
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  {isFullscreen ? <RiFullscreenExitLine size={20} /> : <RiFullscreenLine size={20} />}
                </button>
              </div>
              <div className="flex-1 flex flex-col relative p-6">
                <QuillEditor
                  theme="snow"
                  value={formData.content}
                  onChange={(value) => handleInputChange('content', value)}
                  className={isFullscreen ? 'flex-1 min-h-0 h-full w-full' : 'min-h-[400px]'}
                  style={isFullscreen ? { height: '100%', width: '100%' } : {}}
                />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <RiSettings3Line className="mr-2" />
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={generateSlug}
                  className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  Generate Slug
                </button>
                <button
                  type="button"
                  onClick={() => setShowPreview(true)}
                  className="w-full px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-sm"
                >
                  Preview Post
                </button>
              </div>
            </div>

            {/* Publishing Options */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <RiTimeLine className="mr-2" />
                Publishing
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                  >
                    <option value="Draft">Draft</option>
                    <option value="Published">Published</option>
                    <option value="Scheduled">Scheduled</option>
                  </select>
                </div>

                {formData.status === 'Scheduled' && (
                  <div className="space-y-3">
                    <input
                      type="date"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      value={formData.schedule_date || ''}
                      onChange={(e) => handleInputChange('schedule_date', e.target.value)}
                    />
                    <input
                      type="time"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      value={formData.schedule_time || ''}
                      onChange={(e) => handleInputChange('schedule_time', e.target.value)}
                    />
                  </div>
                )}

                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.is_featured}
                      onChange={(e) => handleInputChange('is_featured', e.target.checked)}
                      className="mr-3 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-gray-700">Mark as Featured</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.is_pinned}
                      onChange={(e) => handleInputChange('is_pinned', e.target.checked)}
                      className="mr-3 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-gray-700">Pin to Top</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Blog Settings */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <RiFileTextLine className="mr-2" />
                Blog Settings
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Slug</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    value={formData.slug}
                    onChange={(e) => handleInputChange('slug', e.target.value)}
                    placeholder="url-friendly-title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent mb-2"
                    value={formData.category}
                    onChange={e => {
                      const val = e.target.value;
                      if (val === '__other') {
                        setNewCategory('');
                        handleInputChange('category', '');
                      } else {
                        handleInputChange('category', val);
                      }
                    }}
                  >
                    <option value="">Select category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                    <option value="__other">Other (Add New)</option>
                  </select>
                  {formData.category === '' && (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Enter new category"
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        value={newCategory}
                        onChange={e => setNewCategory(e.target.value)}
                      />
                      <button
                        type="button"
                        className="px-4 py-3 bg-primary text-white rounded-lg hover:bg-secondary transition-colors"
                        onClick={() => {
                          const trimmed = newCategory.trim();
                          if (trimmed) {
                            setCategories([...categories, trimmed]);
                            handleInputChange('category', trimmed);
                            setNewCategory('');
                          }
                        }}
                      >
                        Add
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                  <input
                    type="text"
                    placeholder="tag1, tag2, tag3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    value={formData.tags}
                    onChange={(e) => handleInputChange('tags', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* SEO Settings */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <RiGlobalLine className="mr-2" />
                SEO Settings
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Meta Title</label>
                  <input
                    type="text"
                    placeholder="SEO optimized title"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                    value={formData.seo_title}
                    onChange={(e) => handleInputChange('seo_title', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Meta Description</label>
                  <textarea
                    rows="3"
                    placeholder="Brief description for search engines"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm resize-none"
                    value={formData.seo_description}
                    onChange={(e) => handleInputChange('seo_description', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Focus Keywords</label>
                  <input
                    type="text"
                    placeholder="keyword1, keyword2, keyword3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                    value={formData.seo_keywords}
                    onChange={(e) => handleInputChange('seo_keywords', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
