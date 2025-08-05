import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const api = axios.create({
  baseURL: `${API_URL}/job`,
});

// Get all jobs
export const getAllJobs = async () => {
  const { data } = await api.get("/get-all");
  return data;
};

// Create a new job
export const createJob = async (payload) => {
  const { data } = await api.post("/save", payload);
  return data;
};

// Delete a job by ID
export const deleteJob = async (id) => {
  const { data } = await api.delete(`/delete/${id}`);
  return data;
};

// Update a job by ID
export const updateJob = async (id, payload) => {
  const { data } = await api.put(`/update/${id}`, payload);
  return data;
};

export const updateJobStatus = async (id, status) => {
  const response = await api.patch(`/update/${id}/status`, { status });
  return response.data;
};