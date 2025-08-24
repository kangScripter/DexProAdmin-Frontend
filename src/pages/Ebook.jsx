import React, { useEffect, useMemo, useState } from "react";
import { Plus, Eye, Trash2, X, Upload, Pencil, Users2, BookCheck, FileText, Calendar, Search, Download, Edit2, CheckCircle, AlertCircle } from "lucide-react";
import {
  getEbooks,
  createEbook,
  deleteEbookById,
  updateEbookById,
} from "../Data/ebookData";
import axios from "axios";
import Loader from "../components/Loader";
import { useNavigate } from "react-router-dom";

// Import Chart.js components
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import Sidebar from "../components/Sidebar";

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const API_URL = import.meta?.env?.VITE_API_URL || "http://localhost:3000";

function Ebook() {
  const [ebooks, setEbooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showViewModal, setShowViewModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // add form
  const [form, setForm] = useState({
    title: "",
    description: "",
    highlights: [],
    image: null,
    pdf_file: null,
  });
  const [highlightInput, setHighlightInput] = useState("");

  // edit form
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    highlights: [],
    image: null,
    pdf_file: null,
  });
  const [editHighlightInput, setEditHighlightInput] = useState("");
  const [editId, setEditId] = useState(null);

  // For leads data and count
  const [allLeadsDetails, setAllLeadsDetails] = useState([]);
  const [leadCount, setLeadCount] = useState(0);
  const [loadingLeadData, setLoadingLeadData] = useState(true);

  // State for Pie Chart data
  const [pieChartData, setPieChartData] = useState({
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: [],
      borderColor: [],
      borderWidth: 1,
    }]
  });
  const [loadingChart, setLoadingChart] = useState(false);

  const navigate = useNavigate();

  // Helper function to get proper image/PDF URL
  const getFileUrl = (filePath) => {
    if (!filePath) return null;
    
    // If it's already a full URL, return as is
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
      return filePath;
    }
    
    // If it's a relative path, add the API URL
    return `${API_URL}/uploads/${filePath}`;
  };

  // Fetch ebooks
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await getEbooks();
        setEbooks(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
        setError("Failed to load ebooks.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Fetch all leads data for count and chart
  useEffect(() => {
    (async () => {
      setLoadingLeadData(true);
      try {
        const { data } = await axios.get(`${API_URL}/ebook/lead/get`);
        setAllLeadsDetails(Array.isArray(data) ? data : []);
        setLeadCount(Array.isArray(data) ? data.length : 0);
      } catch (e) {
        console.error("Failed to fetch lead data for count/chart:", e);
      } finally {
        setLoadingLeadData(false);
      }
    })();
  }, []);

  // Process lead data for pie chart when leads data changes
  useEffect(() => {
    if (allLeadsDetails.length > 0) {
      setLoadingChart(true);
      const usageCounts = {};

      allLeadsDetails.forEach(lead => {
        if (lead.book && lead.book.title) {
          const title = lead.book.title;
          usageCounts[title] = (usageCounts[title] || 0) + 1;
        }
      });

      const labels = Object.keys(usageCounts);
      const data = Object.values(usageCounts);

      const generateColors = (numColors) => {
        const colors = [];
        for (let i = 0; i < numColors; i++) {
          const hue = (i * 137.508) % 360;
          colors.push(`hsl(${hue}, 70%, 50%)`);
        }
        return colors;
      };

      const backgroundColors = generateColors(labels.length);
      const borderColors = backgroundColors.map(color => color.replace('50%)', '40%)'));

      setPieChartData({
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: backgroundColors,
          borderColor: borderColors,
          borderWidth: 1,
        }]
      });
      setLoadingChart(false);
    } else {
      setPieChartData({
        labels: [],
        datasets: [{
          data: [],
          backgroundColor: [],
          borderColor: [],
          borderWidth: 1,
        }]
      });
      setLoadingChart(false);
    }
  }, [allLeadsDetails]);

  const pieOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        align: 'center',
        labels: {
          usePointStyle: true,
          boxWidth: 12,
          padding: 10,
        },
      },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
            const value = ctx.parsed;
            const pct = ((value / total) * 100).toFixed(1);
            return `${ctx.label}: ${value} (${pct}%)`;
          },
        },
      },
    },
  }), []);

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      highlights: [],
      image: null,
      pdf_file: null,
    });
    setHighlightInput("");
  };

  const resetEditForm = () => {
    setEditForm({
      title: "",
      description: "",
      highlights: [],
      image: null,
      pdf_file: null,
    });
    setEditHighlightInput("");
    setEditId(null);
  };

  const handleAddEbook = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      const created = await createEbook({
        title: form.title,
        description: form.description,
        highlights: form.highlights,
        image: form.image,
        pdf_file: form.pdf_file,
      });

      setEbooks((prev) => [created, ...prev]);
      resetForm();
      setShowAddModal(false);
      setSuccess("Ebook created successfully!");
    } catch (e) {
      console.error(e);
      setError(e?.response?.data?.message || "Failed to create ebook.");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteEbook = async (id) => {
    if (window.confirm("Are you sure you want to delete this ebook?")) {
      try {
        await deleteEbookById(id);
        setEbooks((prev) => prev.filter((b) => b.id !== id));
        setSuccess("Ebook deleted successfully!");
      } catch (e) {
        console.error(e);
        setError("Failed to delete ebook.");
      }
    }
  };

  const addHighlight = () => {
    const val = highlightInput.trim();
    if (!val) return;
    if (form.highlights.includes(val)) {
      setHighlightInput("");
      return;
    }
    setForm((f) => ({ ...f, highlights: [...f.highlights, val] }));
    setHighlightInput("");
  };

  const removeHighlight = (val) => {
    setForm((f) => ({
      ...f,
      highlights: f.highlights.filter((h) => h !== val),
    }));
  };

  const addEditHighlight = () => {
    const val = editHighlightInput.trim();
    if (!val) return;
    if (editForm.highlights.includes(val)) {
      setEditHighlightInput("");
      return;
    }
    setEditForm((f) => ({ ...f, highlights: [...f.highlights, val] }));
    setEditHighlightInput("");
  };

  const removeEditHighlight = (val) => {
    setEditForm((f) => ({
      ...f,
      highlights: f.highlights.filter((h) => h !== val),
    }));
  };

  const openEdit = (b) => {
    setEditId(b.id);
    setEditForm({
      title: b.title || "",
      description: b.description || "",
      highlights: Array.isArray(b.highlights) ? b.highlights : [],
      image: null,
      pdf_file: null,
    });
    setShowEditModal(true);
  };

  const handleEditEbook = async (e) => {
    e.preventDefault();
    if (!editId) return;

    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      const updated = await updateEbookById(editId, {
        title: editForm.title,
        description: editForm.description,
        highlights: editForm.highlights,
        image: editForm.image,
        pdf_file: editForm.pdf_file,
      });

      setEbooks((prev) =>
        prev.map((b) => (b.id === editId ? updated : b))
      );

      resetEditForm();
      setShowEditModal(false);
      setSuccess("Ebook updated successfully!");
    } catch (e) {
      console.error(e);
      setError(e?.response?.data?.message || "Failed to update ebook.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyPress = (e, action) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      action();
    }
  };

  const filteredEbooks = ebooks.filter(ebook =>
    ebook.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ebook.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ebook.highlights?.some(highlight => highlight.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const stats = {
    total: ebooks.length,
    active: ebooks.filter(ebook => ebook.pdf_file).length,
    totalLeads: leadCount
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen font-sans">
      {/* Sidebar */}
      <div className="fixed top-0 left-0 h-screen w-64 bg-white shadow-xl z-50">
        <Sidebar />
      </div>

      <div className="pl-64">
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="mb-8">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                    Ebooks Manager
                  </h1>
                  <p className="text-gray-600 mt-2 text-lg">Manage your digital library and track lead generation</p>
                </div>
                <button
                  className="flex items-center gap-3 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  onClick={() => {
                    setError("");
                    setSuccess("");
                    resetForm();
                    setShowAddModal(true);
                  }}
                >
                  <Plus size={20} />
                  Add Ebook
                </button>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Total Ebooks</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {loading ? <Loader className="!h-8 !w-8" /> : stats.total}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                      <BookCheck className="text-primary" size={24} />
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Active Ebooks</p>
                      <p className="text-2xl font-bold text-emerald-600">{stats.active}</p>
                    </div>
                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                      <FileText className="text-emerald-600" size={24} />
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Total Leads</p>
                      <p className="text-2xl font-bold text-secondary">
                        {loadingLeadData ? <Loader className="!h-8 !w-8" /> : stats.totalLeads}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center">
                      <Users2 className="text-secondary" size={24} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Alerts */}
            {error && (
              <div className="mb-6 p-4 rounded-xl flex items-center gap-3 bg-red-50 border border-red-200 text-red-700">
                <AlertCircle size={20} className="text-red-600" />
                <span className="font-medium">{error}</span>
              </div>
            )}
            {success && (
              <div className="mb-6 p-4 rounded-xl flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-700">
                <CheckCircle size={20} className="text-emerald-600" />
                <span className="font-medium">{success}</span>
              </div>
            )}

            {/* Search Bar */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search ebooks by title, description, or highlights..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>

            {/* Ebook Usage Chart */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Users2 size={20} className="text-primary" />
                Ebook Usage by Leads
              </h2>
              {loadingChart ? (
                <div className="flex justify-center py-8">
                  <Loader />
                </div>
              ) : pieChartData.labels.length > 0 ? (
                <div className="w-full max-w-2xl mx-auto h-[300px]">
                  <Pie data={pieChartData} options={pieOptions} />
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users2 className="text-gray-400" size={24} />
                  </div>
                  <p className="text-gray-500 text-lg">No ebook usage data to display.</p>
                  <p className="text-gray-400 text-sm mt-1">Lead data will appear here once collected.</p>
                </div>
              )}
            </div>

            {/* Ebooks Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredEbooks.length > 0 ? (
                filteredEbooks.map((ebook, index) => (
                  <div key={ebook.id || index} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-200">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <BookCheck className="text-primary" size={20} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 text-lg">{ebook.title}</h3>
                          <p className="text-sm text-gray-500">
                            {ebook.highlights?.length || 0} highlights
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEdit(ebook)}
                          className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all duration-200"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => deleteEbook(ebook.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <p className="text-gray-700 text-sm line-clamp-3">{ebook.description}</p>
                      
                      {ebook.image && (
                        <div className="relative">
                          <img
                            src={getFileUrl(ebook.image)}
                            alt={ebook.title}
                            className="w-full h-32 object-cover rounded-lg"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                          <div 
                            className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400"
                            style={{ display: 'none' }}
                          >
                            <BookCheck size={24} />
                          </div>
                        </div>
                      )}
                      
                      {ebook.highlights && ebook.highlights.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-gray-700">Highlights</h4>
                          <div className="flex flex-wrap gap-2">
                            {ebook.highlights.slice(0, 3).map((highlight, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium"
                              >
                                {highlight}
                              </span>
                            ))}
                            {ebook.highlights.length > 3 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded-full text-xs">
                                +{ebook.highlights.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Calendar size={14} />
                          {new Date(ebook.created_at || Date.now()).toLocaleDateString('en-IN')}
                        </div>
                        {ebook.pdf_file && (
                          <a
                            href={getFileUrl(ebook.pdf_file)}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1 text-primary hover:text-secondary text-sm font-medium transition-colors"
                          >
                            <Download size={14} />
                            Download
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookCheck className="text-gray-400" size={24} />
                  </div>
                  <p className="text-gray-500 text-lg">
                    {searchTerm ? "No ebooks found matching your search." : "No ebooks added yet."}
                  </p>
                  <p className="text-gray-400 text-sm mt-1">
                    {searchTerm ? "Try adjusting your search terms." : "Start by adding your first ebook!"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Modal */}
      <Modal
        open={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          resetForm();
        }}
        title="Add New Ebook"
      >
        <form onSubmit={handleAddEbook} className="space-y-6">
          {/* Ebook Information */}
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BookCheck size={20} className="text-primary" />
              Ebook Information
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Enter ebook title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <textarea
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 min-h-[100px] resize-none"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Enter ebook description"
                  required
                />
              </div>
            </div>
          </div>

          {/* Highlights */}
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Highlights</h3>
            
            <div className="flex gap-3 mb-4">
              <input
                type="text"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                value={highlightInput}
                onChange={(e) => setHighlightInput(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, addHighlight)}
                placeholder="Add a highlight and press Enter"
              />
              <button
                type="button"
                onClick={addHighlight}
                className="px-6 py-3 bg-primary hover:bg-secondary text-white font-semibold rounded-xl transition-all duration-200 flex items-center gap-2"
              >
                <Plus size={18} />
                Add
              </button>
            </div>

            {form.highlights.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {form.highlights.map((highlight, index) => (
                  <div key={index} className="flex items-center gap-2 bg-white px-3 py-2 rounded-full border border-gray-200 shadow-sm">
                    <span className="text-gray-700 text-sm font-medium">{highlight}</span>
                    <button
                      type="button"
                      onClick={() => removeHighlight(highlight)}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Files */}
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Upload size={20} className="text-primary" />
              Files
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cover Image</label>
                <label className="flex items-center gap-3 w-full cursor-pointer rounded-xl border border-gray-300 px-4 py-3 focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent transition-all duration-200 bg-white">
                  <Upload className="text-gray-400" size={20} />
                  <span className="flex-1 text-gray-700">
                    {form.image ? form.image.name : "Choose cover image..."}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setForm({ ...form, image: e.target.files?.[0] || null })}
                  />
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">PDF File *</label>
                <label className="flex items-center gap-3 w-full cursor-pointer rounded-xl border border-gray-300 px-4 py-3 focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent transition-all duration-200 bg-white">
                  <FileText className="text-gray-400" size={20} />
                  <span className="flex-1 text-gray-700">
                    {form.pdf_file ? form.pdf_file.name : "Choose PDF file..."}
                  </span>
                  <input
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={(e) => setForm({ ...form, pdf_file: e.target.files?.[0] || null })}
                    required
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={() => {
                setShowAddModal(false);
                resetForm();
              }}
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-8 py-3 bg-primary hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle size={18} />
                  Save Ebook
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        open={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          resetEditForm();
        }}
        title="Edit Ebook"
      >
        <form onSubmit={handleEditEbook} className="space-y-6">
          {/* Ebook Information */}
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BookCheck size={20} className="text-primary" />
              Ebook Information
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  placeholder="Enter ebook title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <textarea
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 min-h-[100px] resize-none"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  placeholder="Enter ebook description"
                  required
                />
              </div>
            </div>
          </div>

          {/* Highlights */}
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Highlights</h3>
            
            <div className="flex gap-3 mb-4">
              <input
                type="text"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                value={editHighlightInput}
                onChange={(e) => setEditHighlightInput(e.target.value)}
                onKeyPress={(e) => handleKeyPress(e, addEditHighlight)}
                placeholder="Add a highlight and press Enter"
              />
              <button
                type="button"
                onClick={addEditHighlight}
                className="px-6 py-3 bg-primary hover:bg-secondary text-white font-semibold rounded-xl transition-all duration-200 flex items-center gap-2"
              >
                <Plus size={18} />
                Add
              </button>
            </div>

            {editForm.highlights.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {editForm.highlights.map((highlight, index) => (
                  <div key={index} className="flex items-center gap-2 bg-white px-3 py-2 rounded-full border border-gray-200 shadow-sm">
                    <span className="text-gray-700 text-sm font-medium">{highlight}</span>
                    <button
                      type="button"
                      onClick={() => removeEditHighlight(highlight)}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Files */}
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Upload size={20} className="text-primary" />
              Files (Optional Updates)
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Replace Cover Image</label>
                <label className="flex items-center gap-3 w-full cursor-pointer rounded-xl border border-gray-300 px-4 py-3 focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent transition-all duration-200 bg-white">
                  <Upload className="text-gray-400" size={20} />
                  <span className="flex-1 text-gray-700">
                    {editForm.image ? editForm.image.name : "Choose new cover image (optional)..."}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setEditForm({ ...editForm, image: e.target.files?.[0] || null })}
                  />
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Replace PDF File</label>
                <label className="flex items-center gap-3 w-full cursor-pointer rounded-xl border border-gray-300 px-4 py-3 focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent transition-all duration-200 bg-white">
                  <FileText className="text-gray-400" size={20} />
                  <span className="flex-1 text-gray-700">
                    {editForm.pdf_file ? editForm.pdf_file.name : "Choose new PDF file (optional)..."}
                  </span>
                  <input
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={(e) => setEditForm({ ...editForm, pdf_file: e.target.files?.[0] || null })}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={() => {
                setShowEditModal(false);
                resetEditForm();
              }}
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-8 py-3 bg-primary hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Updating...
                </>
              ) : (
                <>
                  <CheckCircle size={18} />
                  Update Ebook
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default Ebook;

/* -------------------------*/
/* Modern Modal component */
/* ------------------------*/
function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex justify-center items-center z-50 p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl relative max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                <BookCheck className="text-white" size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
                <p className="text-gray-500 text-sm">Manage your ebook details</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}