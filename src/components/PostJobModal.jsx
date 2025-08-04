import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { createJob, updateJob } from "../Data/jobData";

export default function PostJobModal({ onclose, jobToEdit }) {
  const [formData, setFormData] = useState({
    title: "",
    location: "",
    type: "full-time",
    description: "",
    skills: [],
    requirements: [],
    compensation: "",
    newRequirement: "",
    newSkill: "",
  });

  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'

  useEffect(() => {
    if (jobToEdit) {
      setFormData({
        ...jobToEdit,
        newRequirement: "",
        newSkill: "",
      });
    }
  }, [jobToEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const addRequirement = () => {
    if (formData.newRequirement.trim()) {
      setFormData((prev) => ({
        ...prev,
        requirements: [...prev.requirements, prev.newRequirement],
        newRequirement: "",
      }));
    }
  };

  const addSkill = () => {
    if (formData.newSkill.trim()) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, prev.newSkill],
        newSkill: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (jobToEdit) {
        await updateJob(jobToEdit.id, formData);
        setMessage("Job updated successfully!");
        setMessageType("success");
      } else {
        await createJob(formData);
        setMessage("Job posted successfully!");
        setMessageType("success");
      }

      // Optional: auto-close after success
      setTimeout(() => {
        setMessage('');
        onclose();
      }, 2000);
    } catch (err) {
      console.error(err);
      setMessage("Failed to submit job.");
      setMessageType("error");
    }
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-3xl p-6 rounded-lg shadow-lg relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onclose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
        >
          <X />
        </button>
        <h2 className="text-2xl font-bold mb-4">
          {jobToEdit ? "Edit Job" : "Post New Job"}
        </h2>

        {/* ✅ Success/Error message display */}
        {message && (
          <div
            className={`p-3 rounded mb-4 text-sm font-medium ${
              messageType === 'success'
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input name="title" onChange={handleChange} value={formData.title} placeholder="Job Title *" className="border p-2 rounded w-full" required />
            <input name="location" onChange={handleChange} value={formData.location} placeholder="Location *" className="border p-2 rounded w-full" required />
            <select name="type" onChange={handleChange} value={formData.type} className="border p-2 rounded w-full">
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="freelance">Freelance</option>
              <option value="internship">Internship</option>
            </select>
            <input name="compensation" onChange={handleChange} value={formData.compensation} placeholder="Compensation *" className="border p-2 rounded w-full" required />
          </div>

          <textarea name="description" onChange={handleChange} value={formData.description} placeholder="Job Description *" className="border p-2 rounded w-full" rows={4} required />

          <div>
            <label className="font-medium">Requirements</label>
            <div className="flex gap-2 mt-1">
              <input type="text" value={formData.newRequirement} onChange={(e) => setFormData((prev) => ({ ...prev, newRequirement: e.target.value }))} placeholder="Add a requirement" className="border p-2 rounded w-full" />
              <button type="button" onClick={addRequirement} className=" text-white px-4 rounded cursor-pointer bg-[#140228] hover:bg-[#20033d]">Add</button>
            </div>
            <ul className="mt-2 list-disc list-inside text-sm text-gray-600">
              {formData.requirements.map((req, i) => <li key={i}>{req}</li>)}
            </ul>
          </div>

          <div>
            <label className="font-medium">Skills / Tags</label>
            <div className="flex gap-2 mt-1">
              <input type="text" value={formData.newSkill} onChange={(e) => setFormData((prev) => ({ ...prev, newSkill: e.target.value }))} placeholder="Add a skill/tag" className="border p-2 rounded w-full" />
              <button type="button" onClick={addSkill} className=" text-white px-4 rounded cursor-pointer bg-[#140228] hover:bg-[#20033d]">Add</button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2 text-sm">
              {formData.skills.map((skill, i) => (
                <span key={i} className="bg-gray-200 px-2 py-1 rounded">{skill}</span>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button type="button" onClick={onclose} className="px-4 py-2 bg-gray-300 rounded cursor-pointer hover:bg-gray-400">Cancel</button>
            <button type="submit" className="px-4 py-2 text-white rounded cursor-pointer bg-[#140228] hover:bg-[#20033d]">
              {jobToEdit ? "Update Job" : "Post Job"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
