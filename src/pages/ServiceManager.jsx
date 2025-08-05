import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";

export default function ServiceManager() {
  const [services, setServices] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [subServices, setSubServices] = useState([]);
  const [newSubService, setNewSubService] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchServices = async () => {
    try {
      const res = await axios.get("http://localhost:3000/services/get-all");
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

    if (!title.trim()) {
      return setError("Service title is required.");
    }

    if (subServices.length === 0) {
      return setError("Please add at least one sub-service.");
    }

    try {
      await axios.post("http://localhost:3000/services/save", {
        title,
        subServices,
      });

      setTitle("");
      setSubServices([]);
      setNewSubService("");
      setIsModalOpen(false);
      setSuccess("Service added successfully!");
      fetchServices();
    } catch (err) {
      console.error("Add service failed:", err);
      setError("Failed to add service. Please try again.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 mt-10">
      <div className="fixed top-0 left-0 h-screen w-64 bg-white shadow-lg z-50">
        <Sidebar />
      </div>

      <div className="flex justify-between items-center mb-8 ml-64">
        <h1 className="text-3xl font-bold text-gray-800">Service Manager</h1>
        <button
          onClick={() => {
            setError("");
            setSuccess("");
            setIsModalOpen(true);
          }}
          className="bg-purple-950 hover:bg-purple-800 text-white px-5 py-2 rounded-lg shadow transition-all"
        >
          + Add Service
        </button>
      </div>

      {/* Alerts */}
      {error && <div className="mb-4 ml-64 px-4 py-2 bg-red-100 text-red-700 rounded">{error}</div>}
      {success && <div className="mb-4 ml-64 px-4 py-2 bg-green-100 text-green-700 rounded">{success}</div>}

      {/* Service Table */}
      <div className="overflow-x-auto rounded-lg border shadow ml-64">
        <table className="min-w-full text-sm text-gray-700">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left font-semibold">Service Title</th>
              <th className="px-6 py-3 text-left font-semibold">Sub-Services</th>
            </tr>
          </thead>
          <tbody>
            {services.map((service, index) => (
              <tr key={service.id || index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                <td className="px-6 py-4 font-medium">{service.title}</td>
                <td className="px-6 py-4">
                  {(service.sub_services || []).join(", ")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 backdrop-blur-sm flex justify-center items-center z-50 px-4">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-lg relative overflow-y-auto max-h-[90vh]">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-3 right-4 text-xl text-gray-500 hover:text-gray-800"
            >
              &times;
            </button>
            <h2 className="text-xl font-semibold text-gray-800 mb-5">
              Add New Service
            </h2>

            {error && <div className="text-red-600 mb-2">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Title Input */}
              <div>
                <label className="block text-sm mb-1 font-medium text-gray-700">
                  Service Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter service title"
                  className="w-full border px-4 py-2 rounded-md focus:outline-none"
                />
              </div>

              {/* Sub-Service Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sub-Service
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSubService}
                    onChange={(e) => setNewSubService(e.target.value)}
                    placeholder="Enter sub-service"
                    className="flex-1 border px-4 py-2 rounded-md focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newSubService.trim()) {
                        setSubServices([...subServices, newSubService.trim()]);
                        setNewSubService("");
                      }
                    }}
                    className="px-4 py-2 cursor-pointer bg-purple-950 hover:bg-purple-800 text-white rounded"
                  >
                    +
                  </button>
                </div>

                {/* Sub-Service Tags */}
                <div className="mt-3 flex flex-wrap gap-2">
                  {subServices.map((sub, index) => (
                    <span
                      key={index}
                      className="flex items-center gap-2 bg-gray-200 px-3 py-1 rounded-full text-sm"
                    >
                      {sub}
                      <button
                        type="button"
                        onClick={() => {
                          setSubServices(subServices.filter((_, i) => i !== index));
                        }}
                        className="text-red-500 font-bold hover:text-red-700"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  className="bg-purple-950 hover:bg-purple-800 text-white px-5 py-2 rounded-md transition-all"
                >
                  Save Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
