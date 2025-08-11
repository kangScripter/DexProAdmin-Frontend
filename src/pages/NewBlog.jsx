import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  RiArrowLeftLine, RiImageLine, RiBold, RiItalic, RiUnderline, RiListUnordered,
  RiListOrdered, RiLink, RiCloseLine, RiEyeLine, RiSendPlaneLine,
  RiH1, RiH2, RiH3, RiH4, RiH5, RiH6, RiFullscreenLine, RiFullscreenExitLine
} from 'react-icons/ri';
import axios from 'axios';
import QuillEditor from "react-quill-new";
import 'react-quill-new/dist/quill.snow.css'; // Import the default snow theme styles
import 'react-quill-new/dist/quill.bubble.css'; // Import the bubble theme styles

const API_URL = import.meta.env.VITE_API_URL;

const NewBlog = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const editorRef = useRef(null);

  const [images, setImages] = useState([]);
  const [wordCount, setWordCount] = useState(0);
  const [schedule, setSchedule] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
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
        is_featured: false,  // ✅ NEW
        is_pinned: false ,    // ✅ NEW
        author_id: localStorage.getItem('user_id') || '1' // Default to 1 if not set
      });
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (files) => {
    const file = files[0];
    const imageUrl = URL.createObjectURL(file);
    setImages([imageUrl]);
    setFormData((prev) => ({ ...prev, featured_image: file }));
  };
  
  const handleAddCategory = async () => {
  const trimmedCategory = newCategory.trim();
  if (trimmedCategory && !categories.includes(trimmedCategory)) {
    try {
      // POST the new category to API
      const res = await axios.post(`${API_URL}/api/categories`, {
        name: trimmedCategory
      });

      if (res.status === 200 || res.status === 201) {
        const added = res.data.category || trimmedCategory;
        setCategories((prev) => [...prev, added]);
        handleInputChange('category', added);
        setNewCategory('');
      } else {
        alert(res.data.message || "Failed to add category");
      }
    } catch (err) {
      console.error("Error adding category:", err);
      alert("Error adding category");
    }
  }
};

  const handleDrop = (e) => {
    e.preventDefault();
    handleImageUpload(e.dataTransfer.files);
  };

  const handleEditorInput = () => {
    const text = editorRef.current?.innerText || '';
    const html = editorRef.current?.innerHTML || '';
    setWordCount(text.trim().split(/\s+/).filter(Boolean).length);
    setFormData((prev) => ({ ...prev, content: html }));
  };

  const execCommand = (command, value = null) => {
    if (command === 'insertImage') {
      const url = prompt('Enter image URL:');
      if (url) document.execCommand(command, false, url);
    } else if (command.startsWith('formatBlock')) {
      document.execCommand('formatBlock', false, value);
    } else {
      document.execCommand(command, false, value);
    }
    editorRef.current.focus();
  };

  const removeImage = () => {
    setImages([]);
    setFormData((prev) => ({ ...prev, featured_image: null }));
  };
  
  useEffect(() => {
  const fetchCategories = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/categories`);
      if (res.status === 200) {
        setCategories(res.data.categories); // ensure API returns { categories: [...] }
      }
    } catch (error) {
      console.error("Failed to load categories:", error);
    }
  };
  fetchCategories();
}, []);
  useEffect(() => {
  localStorage.setItem("blog_draft", JSON.stringify(formData));
}, [formData]);


  useEffect(() => {
      const draft = sessionStorage.getItem('blogDraft');
      if (draft) {
        const parsed = JSON.parse(draft);
        setFormData(parsed);
      }
    }, []);
  
    useEffect(() => {
  const handleKeyDown = (e) => {
    if (e.key === 'Escape' && isFullscreen) {
      setIsFullscreen(false);
    }
  };

  document.addEventListener('keydown', handleKeyDown);
  return () => document.removeEventListener('keydown', handleKeyDown);
}, [isFullscreen]);
  const handleSubmitBlog = async () => {
  try {
    const payload = new FormData();

    for (const key in formData) {
      if (key !== 'featured_image' && formData[key]) {
        payload.append(key, formData[key]);
      }
    }

    if (schedule && formData.schedule_date && formData.schedule_time) {
      const scheduled_time = `${formData.schedule_date}T${formData.schedule_time}:00`;
      payload.append("scheduled_time", scheduled_time);
    }

    if (formData.featured_image) {
      payload.append("featured_image", formData.featured_image);
    }
    console.log(formData)
    const res = await axios.post(`${API_URL}/api/blogs`, payload, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    if (res.status === 200 || res.status === 201) {
      alert('Blog published successfully!');
      navigate('/blogs/'+ res.data.blog.slug);
    } else {
      alert(res.data.message || 'Failed to publish blog');
    }
  } catch (err) {
    console.error('Error:', err);
    alert('Server error');
  }
    if (res.status === 200 || res.status === 201) {
        localStorage.removeItem("blog_draft"); // ✅ Clear draft
        alert('Blog published successfully!');
        navigate('/blogs/' + res.data.blog.id);
      }
};
  const formattingButtons = [
    { icon: RiBold, command: 'bold' },
    { icon: RiItalic, command: 'italic' },
    { icon: RiUnderline, command: 'underline' },
    { icon: RiListUnordered, command: 'insertUnorderedList' },
    { icon: RiListOrdered, command: 'insertOrderedList' },
    { icon: RiLink, command: 'createLink' },
    { icon: RiImageLine, command: 'insertImage' },
    { icon: RiH1, command: 'formatBlock', value: 'H1' },
    { icon: RiH2, command: 'formatBlock', value: 'H2' },
    { icon: RiH3, command: 'formatBlock', value: 'H3' },
    { icon: RiH4, command: 'formatBlock', value: 'H4' },
    { icon: RiH5, command: 'formatBlock', value: 'H5' },
    { icon: RiH6, command: 'formatBlock', value: 'H6' },
  ];
  const modules = {
  toolbar: [
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    [{ 'font': [] }],
    [{ 'size': ['small', false, 'large', 'huge'] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'align': [] }],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    [{ 'indent': '-1' }, { 'indent': '+1' }],
    ['blockquote', 'code-block'],
    ['link', 'image'],
    ['clean']
  ]
};
  const formats = [
  'header', 'font', 'size',
  'bold', 'italic', 'underline', 'strike',
  'color', 'background',
  'align', 'list', 'bullet', 'indent',
  'blockquote', 'code-block',
  'link', 'image'
];

  // 👉 Preview Mode UI
  if (showPreview) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8">
        <button
          onClick={() => setShowPreview(false)}
          className="text-blue-600 hover:underline mb-4 flex items-center"
        >
          <RiArrowLeftLine className="mr-2" /> Back to Edit
        </button>

        {images.length > 0 && (
          <img
            src={images[0]}
            alt="Featured"
            className="w-full h-96 object-cover rounded-xl mb-6"
          />
        )}

        <h1 className="text-4xl font-bold mb-2 text-gray-900">{formData.title}</h1>
        <p className="text-gray-600 text-sm mb-4">{formData.short_desc}</p>

        <div
          className="prose prose-lg text-gray-800"
          dangerouslySetInnerHTML={{ __html: formData.content }}
        />

        <div className="mt-12 text-sm text-gray-500">
          <p><strong>Category:</strong> {formData.category}</p>
          <p><strong>Tags:</strong> {formData.tags}</p>
          <p><strong>SEO Title:</strong> {formData.seo_title}</p>
          <p><strong>SEO Desc:</strong> {formData.seo_description}</p>
          <p><strong>Keyword:</strong> {formData.seo_keywords}</p>
        </div>
      </div>
    );
  }

  // ✍️ Default Editor UI
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-4 sticky top-0 z-50">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button className="w-10 h-10 text-gray-600 hover:bg-gray-100 rounded-lg flex justify-center items-center"
              onClick={() => navigate(-1)}>
              <RiArrowLeftLine className="text-lg" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Write New Blog</h1>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Section */}
        <div className="lg:col-span-2 space-y-8">
          {/* Title */}
          <div className="bg-white p-6 rounded-xl border border-gray-300">
            <label className="block text-sm font-medium text-gray-700 mb-2">Blog Title</label>
            <input
              type="text"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter blog title"
            />
          </div>
          
          {/* Short Description */}
          <div className="bg-white p-6 rounded-xl border border-gray-300">
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Short Description</label>
              <span className={`text-sm ${formData.short_desc.length > 140 ? 'text-red-500' : 'text-gray-500'}`}>
                {formData.short_desc.length}/160
              </span>
            </div>
            <textarea
              rows="3"
              maxLength="160"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              value={formData.short_desc}
              onChange={(e) => handleInputChange('short_desc', e.target.value)}
              placeholder="Brief description..."
            />
          </div>
           
  

          {/* Featured Image */}
          <div className="bg-white p-6 rounded-xl border border-gray-300">
            <label className="block text-sm font-medium text-gray-700 mb-4">Featured Image</label>
            <div
              className="upload-zone border-2 border-dashed border-gray-300 p-8 text-center rounded-lg cursor-pointer hover:bg-blue-50"
              onClick={() => fileInputRef.current.click()}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
            >
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex justify-center items-center mb-4">
                  <RiImageLine className="text-2xl text-gray-400" />
                </div>
                <p className="text-gray-600">Drag & drop or click to upload</p>
              </div>
              <input type="file" className="hidden" ref={fileInputRef} onChange={(e) => handleImageUpload(e.target.files)} accept="image/*" />
            </div>
            {images.length > 0 && (
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="relative overflow-hidden rounded-lg bg-gray-100">
                  <img src={images[0]} alt="preview" className="w-full h-24 object-cover" />
                  <button
                    onClick={removeImage}
                    className="absolute top-2 right-2 bg-black bg-opacity-70 text-white rounded-full w-6 h-6 flex items-center justify-center"
                  >
                    <RiCloseLine className="text-xs" />
                  </button>
                </div>
              </div>
            )}
          </div>

          <div
  className={`bg-white rounded-xl border border-gray-300 p-6 ${
    isFullscreen ? 'fixed inset-0 z-[9999] bg-white overflow-auto flex flex-col w-screen h-screen top-0 left-0' : ''
  }`}
  style={isFullscreen ? { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', margin: 0, padding: 0, borderRadius: 0, boxShadow: 'none' } : {}}
>
  <div
    className="flex justify-between items-center mb-2 bg-white sticky top-0 z-30 p-4 border-b border-gray-200"
    style={{ position: 'sticky', top: 0, left: 0, right: 0, borderRadius: isFullscreen ? 0 : undefined }}
  >
    <label className="block text-sm font-medium text-gray-700">Content</label>
    <button
      type="button"
      onClick={() => setIsFullscreen(!isFullscreen)}
      className="text-gray-500 hover:text-gray-700"
    >
      {isFullscreen ? (
        <RiFullscreenExitLine size={20} />
      ) : (
        <RiFullscreenLine size={20} />
      )}
    </button>
  </div>
  <div className="flex-1 flex flex-col relative">
    <QuillEditor
      theme="snow"
      value={formData.content}
      onChange={(value) => handleInputChange('content', value)}
      modules={modules}
      formats={formats}
      className={isFullscreen ? 'flex-1 min-h-0 h-full w-full' : 'min-h-[300px]'}
      style={isFullscreen ? { height: '100%', width: '100%' } : {}}
    />
  </div>
</div>

      {/* <div className="p-6">
        <button
          onClick={handleSubmitBlog}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          <RiSendPlaneLine className="inline-block mr-2" /> Publish Now
        </button>
      </div> */}

        </div>
        
        
        {/* Right Sidebar */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-300">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Blog Settings</h3>

              <label className="block text-sm font-medium text-gray-700 mb-2">Slug</label>
              <input
                type="text"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4"
                value={formData.slug}
                onChange={(e) => handleInputChange('slug', e.target.value)}
                placeholder="Enter Slug (URL-friendly title)"
              />

              <div className="space-y-2">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => handleInputChange('is_featured', e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Mark as Featured</span>
                </label>
                <br />
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_pinned}
                    onChange={(e) => handleInputChange('is_pinned', e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Pin to Top</span>
                </label>
              </div>
            </div>

          {/* Publishing Options */}
          <div className="bg-white p-6 rounded-xl border border-gray-300">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Publishing Options</h3>
            <select
              className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-6"
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
            >
              <option>Draft</option>
              <option>Published</option>
              <option>Scheduled</option>
            </select>

            {/* <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-700">Schedule Publication</label>
                <div
                  className={`w-10 h-5 bg-gray-300 rounded-full relative cursor-pointer ${schedule ? 'bg-blue-600' : ''}`}
                  onClick={() => setSchedule(!schedule)}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full absolute top-0 transition-transform ${schedule ? 'translate-x-5' : 'translate-x-0'}`}
                  ></div>
                </div>
              </div>
              {schedule && (
                <div className="space-y-3">
                  <input type="date" className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    onChange={(e) => handleInputChange('schedule_date', e.target.value)} />
                  <input type="time" className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    onChange={(e) => handleInputChange('schedule_time', e.target.value)} />
                </div>
              )}
            </div> */}
            {formData.status === 'Scheduled' && (
              <div className="space-y-3 mb-6">
                <input
                  type="date"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  value={formData.schedule_date || ''}
                  onChange={(e) => handleInputChange('schedule_date', e.target.value)}
                />
                <input
                  type="time"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  value={formData.schedule_time || ''}
                  onChange={(e) => handleInputChange('schedule_time', e.target.value)}
                />
              </div>
            )}

            {/* Category Dropdown + Add New */}
          <div className="mb-4">
  {/* <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
  <select
    className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-2"
    value={formData.category}
    onChange={e => handleInputChange('category', e.target.value)}
  >
    <option value="">Select category</option>
    {categories.map(cat => (
      <option key={cat} value={cat}>{cat}</option>
    ))}
  </select> */}
        <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-2"
                value={formData.category}
                onChange={e => {
                  const val = e.target.value;
                  if (val === '__other') {
                    setNewCategory('');
                    handleInputChange('category', ''); // temporarily clear
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

              {/* Show input only if Other is selected */}
              {formData.category === '' && (
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    placeholder="Enter new category"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg"
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value)}
                  />
                  <button
                    type="button"
                    className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
            </div>

            <input type="text" placeholder="Tags (comma separated)"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              onChange={(e) => handleInputChange('tags', e.target.value)} />
          </div>

          {/* SEO Settings */}
          <div className="bg-white p-6 rounded-xl border border-gray-300">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">SEO Settings</h3>
            <input type="text" placeholder="Meta Title" className="w-full px-4 py-3 mb-3 border border-gray-300 rounded-lg text-sm"
              onChange={(e) => handleInputChange('seo_title', e.target.value)} />
            <textarea rows="3" placeholder="Meta Description" className="w-full px-4 py-3 mb-3 border border-gray-300 rounded-lg text-sm"
              onChange={(e) => handleInputChange('seo_description', e.target.value)} />
            <input type="text" placeholder="Focus Keyword" className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm"
              onChange={(e) => handleInputChange('seo_keywords', e.target.value)} />
          </div>

          {/* Buttons */}
          <div className="bg-white p-6 rounded-xl border border-gray-300 space-y-4">
            <button
              onClick={() => setShowPreview(true)}
              className="w-full px-4 py-3 border border-blue-600 text-blue-600 hover:bg-blue-50 rounded-button flex items-center justify-center"
            >
              <RiEyeLine className="mr-2" /> Preview
            </button>
            <button
              onClick={handleSubmitBlog}
              className="w-full px-4 py-3 bg-primary text-white hover:bg-blue-600 rounded-button flex items-center justify-center"
            >
              <RiSendPlaneLine className="mr-2" /> Publish Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewBlog;
