import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const api = axios.create({
  baseURL: `${API_URL}/ebook`,
});

// GET all
export const getEbooks = async () => {
  const { data } = await api.get("/get");
  return Array.isArray(data) ? data : [];
};

// CREATE
export const createEbook = async (payload) => {
  const formData = new FormData();
  formData.append("title", payload.title);
  formData.append("description", payload.description);

  // append multiple highlights as repeated fields
  (payload.highlights || []).forEach((h) => formData.append("highlights", h));

  if (payload.image) formData.append("image", payload.image);
  if (payload.pdf_file) formData.append("pdf_file", payload.pdf_file);

  const { data } = await api.post("/save", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data; // created ebook document
};

// UPDATE
export const updateEbookById = async (id, payload) => {
  const formData = new FormData();

  if (payload.title !== undefined) formData.append("title", payload.title);
  if (payload.description !== undefined)
    formData.append("description", payload.description);

  if (Array.isArray(payload.highlights)) {
    payload.highlights.forEach((h) => formData.append("highlights", h));
  }

  if (payload.image) formData.append("image", payload.image);
  if (payload.pdf_file) formData.append("pdf_file", payload.pdf_file);

  const { data } = await api.put(`/update/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  // backend responds with { message, book }
  return data.book || data;
};

// DELETE
export const deleteEbookById = async (id) => {
  const { data } = await api.delete(`/delete/${id}`);
  return data;
};