import { useEffect, useState } from "react";
import axios from "axios";
import { Plus, X, Settings, Tag, CheckCircle, AlertCircle, Edit2, Trash2, Search } from "lucide-react";
import Sidebar from "../components/Sidebar";

const API_URL = import.meta.env.VITE_API_URL;

export default function ServiceManager() {
  const [services, setServices] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [title, setTitle] = useState("");
  const [subServices, setSubServices] = useState([]);
  const [newSubService, setNewSubService] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchServices = async () => {
    try {
      const res = await axios.get(`${API_URL}/services/get-all`);
      setServices(res.data);
    } catch (err) {
      console.error("Error fetching services", err);
      setError("Failed to load services.");
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  // Auto-clear messages after 3 seconds
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess("");
        setError("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    if (!title.trim()) {
      setError("Service title is required.");
      setIsSubmitting(false);
      return;
    }

    if (subServices.length === 0) {
      setError("Please add at least one sub-service.");
      setIsSubmitting(false);
      return;
    }

    try {
      if (editingService) {
        await axios.put(`${API_URL}/services/update/${editingService.id}`, {
          title,
          subServices,
        });
        setSuccess("Service updated successfully!");
      } else {
        await axios.post(`${API_URL}/services/save`, {
          title,
          subServices,
        });
        setSuccess("Service added successfully!");
      }

      setTitle("");
      setSubServices([]);
      setNewSubService("");
      setEditingService(null);
      setIsModalOpen(false);
      fetchServices();
    } catch (err) {
      console.error("Service operation failed:", err);
      setError(editingService ? "Failed to update service." : "Failed to add service. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setTitle(service.title);
    setSubServices(service.sub_services || []);
    setIsModalOpen(true);
  };

  const handleDelete = async (serviceId) => {
    if (window.confirm("Are you sure you want to delete this service?")) {
      try {
        await axios.delete(`${API_URL}/services/delete/${serviceId}`);
        setSuccess("Service deleted successfully!");
        fetchServices();
      } catch (err) {
        console.error("Delete service failed:", err);
        setError("Failed to delete service.");
      }
    }
  };

  const addSubService = () => {
    if (newSubService.trim()) {
      setSubServices([...subServices, newSubService.trim()]);
      setNewSubService("");
    }
  };

  const removeSubService = (index) => {
    setSubServices(subServices.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSubService();
    }
  };

  const filteredServices = services.filter(service =>
    service.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.sub_services?.some(sub => sub.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const stats = {
    total: services.length,
    active: services.filter(service => service.sub_services?.length > 0).length,
    subServices: services.reduce((total, service) => total + (service.sub_services?.length || 0), 0)
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
                    Service Manager
                  </h1>
                  <p className="text-gray-600 mt-2 text-lg">Manage your services and sub-services</p>
                </div>
                <button
                  className="flex items-center gap-3 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  onClick={() => {
                    setError("");
                    setSuccess("");
                    setEditingService(null);
                    setTitle("");
                    setSubServices([]);
                    setNewSubService("");
                    setIsModalOpen(true);
                  }}
                >
                  <Plus size={20} />
                  Add Service
                </button>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Total Services</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                    </div>
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                      <Settings className="text-primary" size={24} />
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Active Services</p>
                      <p className="text-2xl font-bold text-emerald-600">{stats.active}</p>
                    </div>
                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                      <CheckCircle className="text-emerald-600" size={24} />
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Sub-Services</p>
                      <p className="text-2xl font-bold text-secondary">{stats.subServices}</p>
                    </div>
                    <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center">
                      <Tag className="text-secondary" size={24} />
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
                  placeholder="Search services or sub-services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>

            {/* Services Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredServices.length > 0 ? (
                filteredServices.map((service, index) => (
                  <div key={service.id || index} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-200">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Settings className="text-primary" size={20} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 text-lg">{service.title}</h3>
                          <p className="text-sm text-gray-500">
                            {(service.sub_services || []).length} sub-services
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(service)}
                          className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all duration-200"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(service.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Tag size={14} />
                        Sub-Services
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {(service.sub_services || []).map((subService, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium"
                          >
                            {subService}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Settings className="text-gray-400" size={24} />
                  </div>
                  <p className="text-gray-500 text-lg">
                    {searchTerm ? "No services found matching your search." : "No services added yet."}
                  </p>
                  <p className="text-gray-400 text-sm mt-1">
                    {searchTerm ? "Try adjusting your search terms." : "Start by adding your first service!"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex justify-center items-center z-50 p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl relative max-h-[95vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                    <Settings className="text-white" size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {editingService ? "Edit Service" : "Add New Service"}
                    </h2>
                    <p className="text-gray-500 text-sm">
                      {editingService ? "Update the service details below" : "Fill in the details to create a new service"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Service Title */}
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Settings size={20} className="text-primary" />
                    Service Information
                  </h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Service Title *</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter service title"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                      required
                    />
                  </div>
                </div>

                {/* Sub-Services */}
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Tag size={20} className="text-primary" />
                    Sub-Services
                  </h3>
                  
                  <div className="flex gap-3 mb-4">
                    <input
                      type="text"
                      value={newSubService}
                      onChange={(e) => setNewSubService(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Enter sub-service name"
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                    />
                    <button
                      type="button"
                      onClick={addSubService}
                      className="px-6 py-3 bg-primary hover:bg-secondary text-white font-semibold rounded-xl transition-all duration-200 flex items-center gap-2"
                    >
                      <Plus size={18} />
                      Add
                    </button>
                  </div>

                  {/* Sub-Service Tags */}
                  {subServices.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {subServices.map((sub, index) => (
                        <div key={index} className="flex items-center gap-2 bg-white px-3 py-2 rounded-full border border-gray-200 shadow-sm">
                          <span className="text-gray-700 text-sm font-medium">{sub}</span>
                          <button
                            type="button"
                            onClick={() => removeSubService(index)}
                            className="text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-4 pt-6 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8 py-3 bg-primary hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        {editingService ? "Updating..." : "Saving..."}
                      </>
                    ) : (
                      <>
                        <CheckCircle size={18} />
                        {editingService ? "Update Service" : "Save Service"}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
