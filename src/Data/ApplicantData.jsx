import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const api = axios.create({
  baseURL: `${API_URL}/applicant`,
});

// UPDATE job
export const createApplicant = async (id, payload) => {
  const { data } = await api.post(`/save/${id}`, payload);
  return data;
};