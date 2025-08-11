// src/pages/ProjectRequestDashboard.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import Loader from "../components/Loader";

const API_URL = import.meta.env.VITE_API_URL;

const ProjectRequestDashboard = () => {
  const [userData, setUserData] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch data from backend
  useEffect(() => {
    axios
      .get(`${API_URL}/project-requirements/get-all`)
      .then((res) => {
        setUserData(res.data);
      })
      .catch((err) => {
        console.error("Error fetching user data:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const openModal = (user) => setSelectedUser(user);
  const closeModal = () => setSelectedUser(null);

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg fixed h-full z-50">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-64 p-8">
        <h1 className="text-3xl font-bold mb-6">Project Submissions</h1>

        {loading ? (
          <Loader/>
        ) : userData.length === 0 ? (
          <p className="text-center text-gray-600">No submissions found.</p>
        ) : (
          <div className="space-y-4">
            {userData.map((user) => (
              <div
                key={user.id}
                className="flex justify-between items-center bg-white shadow-md border rounded-lg px-6 py-4 hover:shadow-lg cursor-pointer"
                onClick={() => openModal(user)}
              >
                <div>
                  <h3 className="text-lg font-semibold">{user.username}</h3>
                  <p className="text-sm text-gray-600">{user.email}</p>
                  <p className="text-sm text-gray-600">
                    Service: {(user.selectedservices || []).join(", ")}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-green-600">
                      ₹{Number(user.budgetrange)?.toLocaleString("en-IN") || "N/A"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white p-6 rounded-lg w-full max-w-xl relative shadow-xl overflow-y-auto max-h-[90vh]">
            <button
              onClick={closeModal}
              className="absolute top-2 right-3 text-gray-500 hover:text-red-500 text-xl"
            >
              &times;
            </button>

            <h2 className="text-2xl font-bold mb-4">Submission Details</h2>
            <div className="space-y-2 text-sm">
              <p><strong>Name:</strong> {selectedUser.username}</p>
              <p><strong>Email:</strong> {selectedUser.email}</p>
              <p><strong>Phone:</strong> {selectedUser.phone}</p>
              <p><strong>Address:</strong> {selectedUser.address}</p>

              <p><strong>Selected Services:</strong> {(selectedUser.selectedservices || []).join(", ")}</p>

              <p><strong>Selected Sub-Services:</strong></p>
              <ul className="list-disc ml-6">
                {selectedUser.selectedsubservices && Object.keys(selectedUser.selectedsubservices).length > 0 ? (
                  Object.entries(selectedUser.selectedsubservices).map(([service, subs]) => (
                    <li key={service}>
                      {service}: {(subs || []).join(", ")}
                    </li>
                  ))
                ) : (
                  <li>No sub-services selected</li>
                )}
              </ul>

              <p><strong>Timeline:</strong> {selectedUser.projecttimeline}</p>
              <p><strong>Requirements:</strong> {selectedUser.additionalrequirements}</p>
              <p><strong>Keep Updated:</strong> {selectedUser.keepupdated ? "Yes" : "No"}</p>
              <p><strong>Budget:</strong> ₹{Number(selectedUser.budgetrange)?.toLocaleString("en-IN") || "N/A"}</p>
              <p><strong>Submitted At:</strong> {selectedUser.submittedat ? new Date(selectedUser.submittedat).toLocaleString() : "N/A"}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectRequestDashboard;
