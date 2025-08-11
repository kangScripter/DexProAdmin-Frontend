import React, { useEffect, useMemo, useState } from "react";
import { Plus, Eye, Trash2, X, Upload, Pencil, Users2, BookCheck } from "lucide-react";
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

  const [showViewModal, setShowViewModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

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
  const [allLeadsDetails, setAllLeadsDetails] = useState([]); // Store full lead data
  const [leadCount, setLeadCount] = useState(0);
  const [loadingLeadData, setLoadingLeadData] = useState(true); // Renamed from loadingLeadCount

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
    // We only need to proceed if allLeadsDetails has data
    if (allLeadsDetails.length > 0) {
      setLoadingChart(true);
      const usageCounts = {};

      allLeadsDetails.forEach(lead => {
        // Correctly access the ebook title from the nested 'book' object
        if (lead.book && lead.book.title) {
          const title = lead.book.title;
          usageCounts[title] = (usageCounts[title] || 0) + 1;
        }
      });

      const labels = Object.keys(usageCounts);
      const data = Object.values(usageCounts);

      // Generate distinct colors for the pie chart slices
      const generateColors = (numColors) => {
        const colors = [];
        for (let i = 0; i < numColors; i++) {
          const hue = (i * 137.508) % 360; // Use golden angle approximation for distinct hues
          colors.push(`hsl(${hue}, 70%, 50%)`); // Saturated, medium lightness
        }
        return colors;
      };

      const backgroundColors = generateColors(labels.length);
      const borderColors = backgroundColors.map(color => color.replace('50%)', '40%)')); // Slightly darker border

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
      // If no leads, clear chart data or show default empty state
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
  }, [allLeadsDetails]); // Now, it only depends on allLeadsDetails as ebook titles are embedded

  const pieOptions = useMemo(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'right',   // moves the text to the right
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
    } catch (e) {
      console.error(e);
      setError(e?.response?.data?.message || "Failed to create ebook.");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteEbook = async (id) => {
    try {
      await deleteEbookById(id);
      setEbooks((prev) => prev.filter((b) => b.id !== id));
    } catch (e) {
      console.error(e);
      setError("Failed to delete ebook.");
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

  // ===== EDIT helpers =====
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
      image: null, // user can re-upload if needed
      pdf_file: null,
    });
    setShowEditModal(true);
  };

  const handleEditEbook = async (e) => {
    e.preventDefault();
    if (!editId) return;

    setSubmitting(true);
    setError("");
    try {
      const updated = await updateEbookById(editId, {
        title: editForm.title,
        description: editForm.description,
        highlights: editForm.highlights,
        image: editForm.image, // only sent if user picked one
        pdf_file: editForm.pdf_file, // only sent if user picked one
      });

      // update list
      setEbooks((prev) =>
        prev.map((b) => (b.id === editId ? updated : b))
      );

      resetEditForm();
      setShowEditModal(false);
    } catch (e) {
      console.error(e);
      setError(e?.response?.data?.message || "Failed to update ebook.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900 p-4 sm:p-6">
        <div className="fixed top-0 left-0 h-screen w-64 bg-white shadow-lg z-50">
          <Sidebar />
        </div>     
         <div className="flex-1 ml-64 p-4 sm:p-6">
            <div className="max-w-6xl mx-auto">
              {/* Header */}
              <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 bg-white/70 backdrop-blur-md shadow-lg rounded-xl p-4">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#140228]">
                  Ebooks Manager
                </h1>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-lg cursor-pointer bg-gradient-to-r from-[#9859fe] to-[#602fea] hover:from-[#602fea] hover:to-[#9859fe] text-white shadow-md transition-all duration-200"
                  >
                    <Plus className="w-4 h-4" />
                    Add Ebook
                  </button>
                </div>
              </header>

              {/* Error or Status */}
              {error && (
                <div className="mb-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700 shadow-sm">
                  {error}
                </div>
              )}

              {/* Dashboard Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {/* Ebook Count Card */}
                <div
                  className="bg-white rounded-xl shadow-lg p-5 flex items-center justify-between cursor-pointer hover:shadow-xl transition-all duration-200"
                  onClick={() => setShowViewModal(true)}
                >
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Total Ebooks</p>
                    <h2 className="text-3xl font-extrabold text-[#140228] mt-1">
                      {loading ? <Loader className="!h-8 !w-8" /> : ebooks.length}
                    </h2>
                  </div>
                  <BookCheck className="w-8 h-8 text-gray-800 opacity-70" />
                </div>

                {/* Leads Count Card */}
                <div
                  className="bg-white rounded-xl shadow-lg p-5 flex items-center justify-between cursor-pointer hover:shadow-xl transition-all duration-200"
                  onClick={() => navigate("/ebook-leads")}
                >
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Total Leads</p>
                    <h2 className="text-3xl font-extrabold text-[#140228] mt-1">
                      {loadingLeadData ? <Loader className="!h-8 !w-8" /> : leadCount}
                    </h2>
                  </div>
                  <Users2 className="w-8 h-8 text-gray-800 opacity-70" />
                </div>
              </div>

              {/* Ebook Usage Pie Chart */}
                  <div className="bg-white rounded-xl shadow-lg p-5 mb-6">
                    <h2 className="  font-medium text-gray-600 mb-4">
                      Ebook Usage by Leads
                    </h2>

                    {loadingChart ? (
                      <Loader />
                    ) : pieChartData.labels.length > 0 ? (
                      <div className="w-full max-w-2xl mx-auto h-[300px]"> {/* wider container so legend fits on the right */}
                        <Pie data={pieChartData} options={pieOptions} />
                      </div>
                    ) : (
                      <div className="text-center text-gray-500 py-4">
                        No ebook usage data to display.
                      </div>
                    )}
                  </div>

            </div> {/* End of max-w-6xl mx-auto */}
         </div>

      {/* View Modal */}
      <Modal
        open={showViewModal}
        onClose={() => setShowViewModal(false)}
        title="Your Ebook Library"
      >
        {loading ? (
          <Loader />
        ) : ebooks.length === 0 ? (
          <div className="text-center text-gray-500 py-8">No ebooks yet.</div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            {/* On mobile we reduce font & padding */}
            <table className="w-full border-collapse text-xs sm:text-sm text-left text-gray-600">
              <thead className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800">
                <tr>
                  {[
                    "#",
                    "Title",
                    "Description",
                    "Highlights",
                    "Image",
                    "PDF",
                    "Action",
                  ].map((h) => (
                    <th key={h} className="p-2 sm:p-3 border">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ebooks.map((b, i) => (
                  <tr
                    key={b.id || i}
                    className="hover:bg-indigo-50 transition-all duration-150"
                  >
                    <td className="p-2 sm:p-3 border">{i + 1}</td>
                    <td className="p-2 sm:p-3 border font-semibold text-indigo-700">
                      {b.title}
                    </td>
                    <td className="p-2 sm:p-3 border">{b.description}</td>
                    <td className="p-2 sm:p-3 border">
                      {b.highlights?.length > 0
                        ? b.highlights.join(", ")
                        : "-"}
                    </td>
                    <td className="p-2 sm:p-3 border">
                      {b.image ? (
                        typeof b.image === "string" ? (
                          <img
                            src={`${API_URL}/uploads/${b.image}`}
                            className="w-14 h-14 sm:w-20 sm:h-20 object-cover rounded-lg shadow-sm"
                            alt={b.title}
                          />
                        ) : (
                          b.image.name
                        )
                      ) : (
                        "N/A"
                      )}
                    </td>
                    <td className="p-2 sm:p-3 border">
                      {b.pdf_file ? (
                        <a
                          href={`${API_URL}/uploads/${b.pdf_file}`}
                          className="text-blue-700 underline"
                          target="_blank"
                          rel="noreferrer"
                        >
                          ebook
                        </a>
                      ) : (
                        "N/A"
                      )}
                    </td>
                    <td className="p-2 sm:p-3 border">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEdit(b)}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs sm:text-sm rounded-lg bg-yellow-100 text-yellow-700 hover:bg-yellow-200 hover:shadow transition-all"
                        >
                          <Pencil className="w-4 h-4" /> Edit
                        </button>
                        <button
                          onClick={() => deleteEbook(b.id)}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs sm:text-sm rounded-lg bg-red-100 text-red-600 hover:bg-red-200 hover:shadow transition-all"
                        >
                          <Trash2 className="w-4 h-4" /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Modal>

      {/* Add Modal */}
      <Modal
        open={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          resetForm();
        }}
        title="Add Ebook"
      >
        <form onSubmit={handleAddEbook} className="space-y-4 sm:space-y-5">
          {/* Title */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold mb-1">
              Title *
            </label>
            <input
              type="text"
              className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold mb-1">
              Description *
            </label>
            <textarea
              className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm min-h-[90px]"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              required
            />
          </div>

          {/* Highlights */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold mb-1">
              Highlights
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                className="flex-1 rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                value={highlightInput}
                onChange={(e) => setHighlightInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addHighlight();
                  }
                }}
                placeholder="Add a highlight and press Enter"
              />
              <button
                type="button"
                onClick={addHighlight}
                className="px-3 py-2 rounded-lg cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm shadow-sm"
              >
                Add
              </button>
            </div>
            {form.highlights.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {form.highlights.map((h) => (
                  <span
                    key={h}
                    className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full text-xs"
                  >
                    {h}
                    <button
                      type="button"
                      onClick={() => removeHighlight(h)}
                      className="hover:text-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Image */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold mb-1">
              Cover Image
            </label>
            <label className="flex items-center gap-2 w-full cursor-pointer rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm bg-white text-sm">
              <Upload className="w-4 h-4" />
              <span className="truncate">
                {form.image ? form.image.name : "Choose image..."}
              </span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) =>
                  setForm({ ...form, image: e.target.files?.[0] || null })
                }
              />
            </label>
          </div>

          {/* PDF */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold mb-1">
              PDF *
            </label>
            <label className="flex items-center gap-2 w-full cursor-pointer rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm bg-white text-sm">
              <Upload className="w-4 h-4" />
              <span className="truncate">
                {form.pdf_file ? form.pdf_file.name : "Choose PDF..."}
              </span>
              <input
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) =>
                  setForm({ ...form, pdf_file: e.target.files?.[0] || null })
                }
                required
              />
            </label>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setShowAddModal(false);
                resetForm();
              }}
              className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg cursor-pointer bg-gradient-to-r from-[#9859fe] to-[#602fea] hover:from-[#602fea] hover:to-[#9859fe] text-white disabled:opacity-60 text-sm"
              disabled={submitting}
            >
              {submitting ? "Saving..." : "Save Ebook"}
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
        <form onSubmit={handleEditEbook} className="space-y-4 sm:space-y-5">
          {/* Title */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold mb-1">
              Title *
            </label>
            <input
              type="text"
              className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
              value={editForm.title}
              onChange={(e) =>
                setEditForm({ ...editForm, title: e.target.value })
              }
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold mb-1">
              Description *
            </label>
            <textarea
              className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm min-h-[90px]"
              value={editForm.description}
              onChange={(e) =>
                setEditForm({ ...editForm, description: e.target.value })
              }
              required
            />
          </div>

          {/* Highlights */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold mb-1">
              Highlights
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                className="flex-1 rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                value={editHighlightInput}
                onChange={(e) => setEditHighlightInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addEditHighlight();
                  }
                }}
                placeholder="Add a highlight and press Enter"
              />
              <button
                type="button"
                onClick={addEditHighlight}
                className="px-3 py-2 rounded-lg cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm shadow-sm"
              >
                Add
              </button>
            </div>
            {editForm.highlights.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {editForm.highlights.map((h) => (
                  <span
                    key={h}
                    className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full text-xs"
                  >
                    {h}
                    <button
                      type="button"
                      onClick={() => removeEditHighlight(h)}
                      className="hover:text-red-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Image */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold mb-1">
              Replace Cover Image (optional)
            </label>
            <label className="flex items-center gap-2 w-full cursor-pointer rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm bg-white text-sm">
              <Upload className="w-4 h-4" />
              <span className="truncate">
                {editForm.image
                  ? editForm.image.name
                  : "Choose new image (optional)..."}
              </span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    image: e.target.files?.[0] || null,
                  })
                }
              />
            </label>
          </div>

          {/* PDF */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold mb-1">
              Replace PDF (optional)
            </label>
            <label className="flex items-center gap-2 w-full cursor-pointer rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm bg-white text-sm">
              <Upload className="w-4 h-4" />
              <span className="truncate">
                {editForm.pdf_file
                  ? editForm.pdf_file.name
                  : "Choose new PDF (optional)..."}
              </span>
              <input
                type="file"
                accept="application/pdf"
                className="hidden"
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    pdf_file: e.target.files?.[0] || null,
                  })
                }
              />
            </label>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setShowEditModal(false);
                resetEditForm();
              }}
              className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg cursor-pointer bg-gradient-to-r from-[#9859fe] to-[#602fea] hover:from-[#602fea] hover:to-[#9859fe] text-white disabled:opacity-60 text-sm"
              disabled={submitting}
            >
              {submitting ? "Updating..." : "Update Ebook"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default Ebook;

/* -------------------------*/
/* Minimal Modal component */
/* ------------------------*/
function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-2 sm:p-4">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-[1000] w-full max-w-lg sm:max-w-4xl bg-white rounded-2xl shadow-xl border p-4 sm:p-6 animate-in fade-in zoom-in-95">
        <div className="flex items-start justify-between mb-3 sm:mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100 text-gray-600"
            aria-label="Close modal"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}