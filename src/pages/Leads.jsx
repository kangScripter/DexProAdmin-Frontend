// src/pages/Leads.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import LeadsTable from "../components/LeadsTable"; // Assuming this component exists
import Loader from "../components/Loader";
import { ArrowLeft } from "lucide-react"; // For a back button
import { useNavigate } from "react-router-dom"; // Import useNavigate
import Sidebar from "../components/Sidebar";

const API_URL = import.meta?.env?.VITE_API_URL || "http://localhost:3000";

function Leads() {
  const [leadData, setLeadData] = useState([]);
  const [loadingLeads, setLoadingLeads] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate(); // Initialize navigate

  useEffect(() => {
    (async () => {
      setLoadingLeads(true);
      setError("");
      try {
        const { data } = await axios.get(`${API_URL}/ebook/lead/get`);
        setLeadData(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
        setError("Failed to load leads data.");
      } finally {
        setLoadingLeads(false);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900 p-4 sm:p-6">
        {/* Sidebar */}
        <div className="fixed top-0 left-0 h-screen w-64 bg-white shadow-lg z-50">
          <Sidebar />
        </div>       
       <div className="flex-1 ml-64 p-4 sm:p-6">
          <div className="max-w-6xl mx-auto">
            <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 bg-white/70 backdrop-blur-md shadow-lg rounded-xl p-4">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#140228]">
                Ebook Leads
              </h1>
              <button
                onClick={() => navigate(-1)} // Go back to the previous page
                className="inline-flex items-center cursor-pointer gap-2 px-4 py-2 text-sm rounded-lg bg-white border shadow-sm hover:shadow-md hover:bg-gray-100 transition-all duration-200"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Ebooks
              </button>
            </header>

            {error && (
              <div className="mb-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700 shadow-sm">
                {error}
              </div>
            )}

            {loadingLeads ? (
              <Loader />
            ) : (
              <main className="max-w-6xl mx-auto mt-6 p-3 sm:p-5">
                <LeadsTable data={leadData || []} fileName="ebook_Subscribers.xlsx" />
              </main>
            )}
          </div>
       </div>
    </div>
  );
}

export default Leads;