import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  RiArrowLeftLine, RiImageLine, RiBold, RiItalic, RiUnderline, RiListUnordered,
  RiListOrdered, RiLink, RiCloseLine, RiEyeLine, RiSendPlaneLine,
  RiH1, RiH2, RiH3, RiH4, RiH5, RiH6, RiFullscreenLine, RiFullscreenExitLine
} from 'react-icons/ri';
import axios from 'axios';
import QuillEditor from "react-quill-new";
import 'react-quill-new/dist/quill.snow.css'; // Import the default snow theme styles

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
    seo_keyword: ''
  });

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (files) => {
    const file = files[0];
    const imageUrl = URL.createObjectURL(file);
    setImages([imageUrl]);
    setFormData((prev) => ({ ...prev, featured_image: file }));
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

    const res = await axios.post('http://127.0.0.1:3000/api/blogs', payload, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    if (res.status === 200 || res.status === 201) {
      alert('Blog published successfully!');
      navigate('/blogs/'+ res.data.blog.id);
    } else {
      alert(res.data.message || 'Failed to publish blog');
    }
  } catch (err) {
    console.error('Error:', err);
    alert('Server error');
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
          <p><strong>Keyword:</strong> {formData.seo_keyword}</p>
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

          {/* Content Editor with CKEditor */}
      <div className="bg-white rounded-xl border border-gray-300 p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
        <div className="text-editor-container">
      <QuillEditor 
         theme="snow"
          value={formData.content}
          onChange={(value) => handleInputChange('content', value)}
          modules={modules}
          formats={formats}
          className="min-h-[300px]"
      />
    </div>
      </div>

      <div className="p-6">
        <button
          onClick={handleSubmitBlog}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          <RiSendPlaneLine className="inline-block mr-2" /> Publish Now
        </button>
      </div>

        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
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

            <div className="mb-6">
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
            </div>

            <input type="text" placeholder="Category"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4"
              onChange={(e) => handleInputChange('category', e.target.value)} />

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
              onChange={(e) => handleInputChange('seo_keyword', e.target.value)} />
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
