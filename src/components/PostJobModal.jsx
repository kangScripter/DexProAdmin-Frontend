import React, { useState, useEffect } from "react";
import { X, Briefcase, MapPin, DollarSign, FileText, Plus, Trash2, CheckCircle, AlertCircle } from "lucide-react";
import { createJob, updateJob } from "../Data/jobData";
import { getSessionUser } from "../utils/session";

export default function PostJobModal({ onclose, jobToEdit }) {
  const [formData, setFormData] = useState({
    title: "",
    location: "",
    type: "full-time",
    status: "open", // Add default status
    description: "",
    skills: [],
    requirements: [],
    compensation: "",
    newRequirement: "",
    newSkill: "",
  });

  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Indian cities and regions
  const indianCities = [
    "Mumbai, Maharashtra",
    "Delhi, Delhi",
    "Bangalore, Karnataka", 
    "Hyderabad, Telangana",
    "Chennai, Tamil Nadu",
    "Kolkata, West Bengal",
    "Pune, Maharashtra",
    "Ahmedabad, Gujarat",
    "Jaipur, Rajasthan",
    "Surat, Gujarat",
    "Lucknow, Uttar Pradesh",
    "Kanpur, Uttar Pradesh",
    "Nagpur, Maharashtra",
    "Indore, Madhya Pradesh",
    "Thane, Maharashtra",
    "Bhopal, Madhya Pradesh",
    "Visakhapatnam, Andhra Pradesh",
    "Pimpri-Chinchwad, Maharashtra",
    "Patna, Bihar",
    "Vadodara, Gujarat",
    "Ghaziabad, Uttar Pradesh",
    "Ludhiana, Punjab",
    "Agra, Uttar Pradesh",
    "Nashik, Maharashtra",
    "Faridabad, Haryana",
    "Meerut, Uttar Pradesh",
    "Rajkot, Gujarat",
    "Kalyan-Dombivali, Maharashtra",
    "Vasai-Virar, Maharashtra",
    "Varanasi, Uttar Pradesh",
    "Srinagar, Jammu & Kashmir",
    "Aurangabad, Maharashtra",
    "Dhanbad, Jharkhand",
    "Amritsar, Punjab",
    "Allahabad, Uttar Pradesh",
    "Ranchi, Jharkhand",
    "Howrah, West Bengal",
    "Coimbatore, Tamil Nadu",
    "Jabalpur, Madhya Pradesh",
    "Gwalior, Madhya Pradesh",
    "Vijayawada, Andhra Pradesh",
    "Jodhpur, Rajasthan",
    "Madurai, Tamil Nadu",
    "Raipur, Chhattisgarh",
    "Kota, Rajasthan",
    "Guwahati, Assam",
    "Chandigarh, Chandigarh",
    "Solapur, Maharashtra",
    "Hubli-Dharwad, Karnataka",
    "Bareilly, Uttar Pradesh",
    "Moradabad, Uttar Pradesh",
    "Mysore, Karnataka",
    "Gurgaon, Haryana",
    "Aligarh, Uttar Pradesh",
    "Jalandhar, Punjab",
    "Tiruchirappalli, Tamil Nadu",
    "Bhubaneswar, Odisha",
    "Salem, Tamil Nadu",
    "Warangal, Telangana",
    "Guntur, Andhra Pradesh",
    "Bhiwandi, Maharashtra",
    "Saharanpur, Uttar Pradesh",
    "Gorakhpur, Uttar Pradesh",
    "Bikaner, Rajasthan",
    "Amravati, Maharashtra",
    "Noida, Uttar Pradesh",
    "Jamshedpur, Jharkhand",
    "Bhilai, Chhattisgarh",
    "Cuttack, Odisha",
    "Firozabad, Uttar Pradesh",
    "Kochi, Kerala",
    "Nellore, Andhra Pradesh",
    "Bhavnagar, Gujarat",
    "Dehradun, Uttarakhand",
    "Durgapur, West Bengal",
    "Asansol, West Bengal",
    "Rourkela, Odisha",
    "Nanded, Maharashtra",
    "Kolhapur, Maharashtra",
    "Ajmer, Rajasthan",
    "Akola, Maharashtra",
    "Gulbarga, Karnataka",
    "Jamnagar, Gujarat",
    "Ujjain, Madhya Pradesh",
    "Loni, Uttar Pradesh",
    "Siliguri, West Bengal",
    "Jhansi, Uttar Pradesh",
    "Ulhasnagar, Maharashtra",
    "Jammu, Jammu & Kashmir",
    "Sangli-Miraj & Kupwad, Maharashtra",
    "Mangalore, Karnataka",
    "Erode, Tamil Nadu",
    "Belgaum, Karnataka",
    "Ambattur, Tamil Nadu",
    "Tirunelveli, Tamil Nadu",
    "Malegaon, Maharashtra",
    "Gaya, Bihar",
    "Jalgaon, Maharashtra",
    "Udaipur, Rajasthan",
    "Maheshtala, West Bengal",
    "Tirupur, Tamil Nadu",
    "Davanagere, Karnataka",
    "Kozhikode, Kerala",
    "Kurnool, Andhra Pradesh",
    "Rajpur Sonarpur, West Bengal",
    "Bokaro, Jharkhand",
    "South Dumdum, West Bengal",
    "Bellary, Karnataka",
    "Patiala, Punjab",
    "Gopalpur, West Bengal",
    "Agartala, Tripura",
    "Bhagalpur, Bihar",
    "Muzaffarnagar, Uttar Pradesh",
    "Bhatpara, West Bengal",
    "Panihati, West Bengal",
    "Latur, Maharashtra",
    "Dhule, Maharashtra",
    "Rohtak, Haryana",
    "Korba, Chhattisgarh",
    "Bhilwara, Rajasthan",
    "Berhampur, Odisha",
    "Muzaffarpur, Bihar",
    "Ahmednagar, Maharashtra",
    "Mathura, Uttar Pradesh",
    "Kollam, Kerala",
    "Avadi, Tamil Nadu",
    "Kadapa, Andhra Pradesh",
    "Kamarhati, West Bengal",
    "Bilaspur, Chhattisgarh",
    "Shahjahanpur, Uttar Pradesh",
    "Satara, Maharashtra",
    "Bijapur, Karnataka",
    "Rampur, Uttar Pradesh",
    "Shivamogga, Karnataka",
    "Chandrapur, Maharashtra",
    "Junagadh, Gujarat",
    "Thrissur, Kerala",
    "Alwar, Rajasthan",
    "Bardhaman, West Bengal",
    "Kulti, West Bengal",
    "Kakinada, Andhra Pradesh",
    "Nizamabad, Telangana",
    "Parbhani, Maharashtra",
    "Tumkur, Karnataka",
    "Hisar, Haryana",
    "Ozhukarai, Puducherry",
    "Bihar Sharif, Bihar",
    "Panipat, Haryana",
    "Darbhanga, Bihar",
    "Bally, West Bengal",
    "Aizawl, Mizoram",
    "Dewas, Madhya Pradesh",
    "Ichalkaranji, Maharashtra",
    "Karnal, Haryana",
    "Bathinda, Punjab",
    "Jalna, Maharashtra",
    "Barasat, West Bengal",
    "Kirari Suleman Nagar, Delhi",
    "Purnia, Bihar",
    "Satna, Madhya Pradesh",
    "Mau, Uttar Pradesh",
    "Sonipat, Haryana",
    "Farrukhabad, Uttar Pradesh",
    "Sagar, Madhya Pradesh",
    "Rourkela, Odisha",
    "Durg, Chhattisgarh",
    "Imphal, Manipur",
    "Ratlam, Madhya Pradesh",
    "Hapur, Uttar Pradesh",
    "Arrah, Bihar",
    "Karimnagar, Telangana",
    "Anantapur, Andhra Pradesh",
    "Etawah, Uttar Pradesh",
    "Ambernath, Maharashtra",
    "North Dumdum, West Bengal",
    "Bharatpur, Rajasthan",
    "Begusarai, Bihar",
    "New Delhi, Delhi",
    "Gandhidham, Gujarat",
    "Baranagar, West Bengal",
    "Tiruvottiyur, Tamil Nadu",
    "Puducherry, Puducherry",
    "Sikar, Rajasthan",
    "Thoothukkudi, Tamil Nadu",
    "Rewa, Madhya Pradesh",
    "Mirzapur, Uttar Pradesh",
    "Raichur, Karnataka",
    "Pali, Rajasthan",
    "Ramagundam, Telangana",
    "Haridwar, Uttarakhand",
    "Vijayanagaram, Andhra Pradesh",
    "Katihar, Bihar",
    "Nagercoil, Tamil Nadu",
    "Sri Ganganagar, Rajasthan",
    "Karawal Nagar, Delhi",
    "Mango, Jharkhand",
    "Thanjavur, Tamil Nadu",
    "Bulandshahr, Uttar Pradesh",
    "Uluberia, West Bengal",
    "Murwara, Madhya Pradesh",
    "Sambhal, Uttar Pradesh",
    "Singrauli, Madhya Pradesh",
    "Nadiad, Gujarat",
    "Secunderabad, Telangana",
    "Naihati, West Bengal",
    "Yamunanagar, Haryana",
    "Bidhan Nagar, West Bengal",
    "Pallavaram, Tamil Nadu",
    "Bidar, Karnataka",
    "Munger, Bihar",
    "Panchkula, Haryana",
    "Burhanpur, Madhya Pradesh",
    "Raurkela Industrial Township, Odisha",
    "Kharagpur, West Bengal",
    "Dindigul, Tamil Nadu",
    "Gandhinagar, Gujarat",
    "Hospet, Karnataka",
    "Nangloi Jat, Delhi",
    "Malda, West Bengal",
    "Ongole, Andhra Pradesh",
    "Deoghar, Jharkhand",
    "Chapra, Bihar",
    "Haldia, West Bengal",
    "Khandwa, Madhya Pradesh",
    "Nandyal, Andhra Pradesh",
    "Morena, Madhya Pradesh",
    "Amroha, Uttar Pradesh",
    "Anand, Gujarat",
    "Bhind, Madhya Pradesh",
    "Bhalswa Jahangir Pur, Delhi",
    "Madhyamgram, West Bengal",
    "Bhiwani, Haryana",
    "Berhampore, West Bengal",
    "Ambala, Haryana",
    "Mori Gate, Delhi",
    "Saharsa, Bihar",
    "Damoh, Madhya Pradesh",
    "Satara, Maharashtra",
    "Bijapur, Karnataka",
    "Rampur, Uttar Pradesh",
    "Shivamogga, Karnataka",
    "Chandrapur, Maharashtra",
    "Junagadh, Gujarat",
    "Thrissur, Kerala",
    "Alwar, Rajasthan",
    "Bardhaman, West Bengal",
    "Kulti, West Bengal",
    "Kakinada, Andhra Pradesh",
    "Nizamabad, Telangana",
    "Parbhani, Maharashtra",
    "Tumkur, Karnataka",
    "Hisar, Haryana",
    "Ozhukarai, Puducherry",
    "Bihar Sharif, Bihar",
    "Panipat, Haryana",
    "Darbhanga, Bihar",
    "Bally, West Bengal",
    "Aizawl, Mizoram",
    "Dewas, Madhya Pradesh",
    "Ichalkaranji, Maharashtra",
    "Karnal, Haryana",
    "Bathinda, Punjab",
    "Jalna, Maharashtra",
    "Barasat, West Bengal",
    "Kirari Suleman Nagar, Delhi",
    "Purnia, Bihar",
    "Satna, Madhya Pradesh",
    "Mau, Uttar Pradesh",
    "Sonipat, Haryana",
    "Farrukhabad, Uttar Pradesh",
    "Sagar, Madhya Pradesh",
    "Remote",
    "Work from Home",
    "Hybrid"
  ];

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

  const removeRequirement = (index) => {
    setFormData((prev) => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index),
    }));
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

  const removeSkill = (index) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');
    
    try {
      // Get current user session
      const currentUser = getSessionUser();
      
      // Try to get user ID from different sources and ensure it's an integer
      let userId = 1; // Default fallback
      
      if (currentUser?.id) {
        // If it's a number, use it directly
        if (typeof currentUser.id === 'number') {
          userId = currentUser.id;
        } else {
          // If it's a string, try to parse it as integer
          const parsedId = parseInt(currentUser.id);
          if (!isNaN(parsedId)) {
            userId = parsedId;
          }
        }
      } else if (localStorage.getItem('user_id')) {
        const storedId = localStorage.getItem('user_id');
        const parsedId = parseInt(storedId);
        if (!isNaN(parsedId)) {
          userId = parsedId;
        }
      }
      
      // Prepare job data with user ID and ensure all required fields
      const jobData = {
        title: formData.title,
        location: formData.location,
        type: formData.type,
        status: formData.status || "open",
        description: formData.description,
        skills: formData.skills || [],
        requirements: formData.requirements || [],
        compensation: formData.compensation,
        author_id: userId, // Use the processed integer ID
        user_id: userId,   // Alternative field name
      };
      
      // Only add created_at if the backend expects it
      // Some backends handle this automatically
      // jobData.created_at = new Date().toISOString();
      
      // Debug logging
      console.log('Current user:', currentUser);
      console.log('User ID being sent:', userId);
      console.log('Job data being sent:', jobData);
      
      if (jobToEdit) {
        await updateJob(jobToEdit.id, jobData);
        setMessage("Job updated successfully!");
        setMessageType("success");
      } else {
        await createJob(jobData);
        setMessage("Job posted successfully!");
        setMessageType("success");
      }

      // Auto-close after success
      setTimeout(() => {
        setMessage('');
        onclose();
      }, 2000);
    } catch (err) {
      console.error('Job submission error:', err);
      
      // Provide more specific error messages
      let errorMessage = "Failed to submit job. Please try again.";
      
      if (err.response) {
        const status = err.response.status;
        const data = err.response.data;
        
        if (status === 400) {
          errorMessage = data?.message || "Invalid job data. Please check all required fields.";
        } else if (status === 401) {
          errorMessage = "Unauthorized. Please log in again.";
        } else if (status === 403) {
          errorMessage = "Permission denied. You don't have access to create jobs.";
        } else if (status === 422) {
          errorMessage = data?.message || "Validation error. Please check your input.";
        } else if (status === 500) {
          errorMessage = "Server error. Please try again later.";
        } else {
          errorMessage = data?.message || `Server error (${status}). Please try again.`;
        }
      } else if (err.request) {
        errorMessage = "Network error. Please check your connection.";
      }
      
      setMessage(errorMessage);
      setMessageType("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e, action) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      action();
    }
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-4xl rounded-lg shadow-lg relative max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                <Briefcase className="text-white" size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {jobToEdit ? "Edit Job Position" : "Post New Job"}
                </h2>
                <p className="text-gray-500 text-sm">
                  {jobToEdit ? "Update the job details below" : "Fill in the details to create a new job posting"}
                </p>
              </div>
            </div>
            <button
              onClick={onclose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {message && (
            <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
              messageType === 'success'
                ? 'bg-green-50 border border-green-200 text-green-700'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}>
              {messageType === 'success' ? (
                <CheckCircle size={20} className="text-green-600" />
              ) : (
                <AlertCircle size={20} className="text-red-600" />
              )}
              <span className="font-medium">{message}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Briefcase size={20} className="text-primary" />
                Basic Information
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Job Title *</label>
                  <input 
                    name="title" 
                    onChange={handleChange} 
                    value={formData.title} 
                    placeholder="e.g., Senior React Developer" 
                    className="w-full px-4 py-3 border border-gray-300 rounded-button focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
                  <select 
                    name="location" 
                    onChange={handleChange} 
                    value={formData.location} 
                    className="w-full px-4 py-3 border border-gray-300 rounded-button focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200" 
                    required 
                  >
                    <option value="">Select a location</option>
                    <optgroup label="Major Cities">
                      {indianCities.slice(0, 20).map((city, index) => (
                        <option key={index} value={city}>{city}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Other Cities">
                      {indianCities.slice(20, 100).map((city, index) => (
                        <option key={index + 20} value={city}>{city}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Remote Options">
                      {indianCities.slice(-3).map((city, index) => (
                        <option key={index + 100} value={city}>{city}</option>
                      ))}
                    </optgroup>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Job Type</label>
                  <select 
                    name="type" 
                    onChange={handleChange} 
                    value={formData.type} 
                    className="w-full px-4 py-3 border border-gray-300 rounded-button focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                  >
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="freelance">Freelance</option>
                    <option value="internship">Internship</option>
                    <option value="contract">Contract</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Compensation (₹) *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">₹</span>
                    <input 
                      name="compensation" 
                      onChange={handleChange} 
                      value={formData.compensation} 
                      placeholder="e.g., 8,00,000 - 12,00,000 per annum" 
                      className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-button focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200" 
                      required 
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Enter salary in Indian Rupees (₹)</p>
                </div>
              </div>
            </div>

            {/* Job Description */}
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText size={20} className="text-primary" />
                Job Description
              </h3>
              <textarea 
                name="description" 
                onChange={handleChange} 
                value={formData.description} 
                placeholder="Describe the role, responsibilities, and what makes this position exciting..." 
                className="w-full px-4 py-3 border border-gray-300 rounded-button focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 resize-none" 
                rows={6} 
                required 
              />
            </div>

            {/* Requirements */}
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Requirements</h3>
              <div className="flex gap-3 mb-4">
                <input 
                  type="text" 
                  value={formData.newRequirement} 
                  onChange={(e) => setFormData((prev) => ({ ...prev, newRequirement: e.target.value }))} 
                  placeholder="Add a requirement (e.g., 3+ years experience)" 
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-button focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                  onKeyPress={(e) => handleKeyPress(e, addRequirement)}
                />
                <button 
                  type="button" 
                  onClick={addRequirement} 
                  className="px-6 py-3 bg-primary hover:bg-secondary text-white font-semibold rounded-button transition-all duration-200 flex items-center gap-2"
                >
                  <Plus size={18} />
                  Add
                </button>
              </div>
              {formData.requirements.length > 0 && (
                <div className="space-y-2">
                  {formData.requirements.map((req, i) => (
                    <div key={i} className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <span className="text-gray-700">{req}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeRequirement(i)}
                        className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Skills */}
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills & Technologies</h3>
              <div className="flex gap-3 mb-4">
                <input 
                  type="text" 
                  value={formData.newSkill} 
                  onChange={(e) => setFormData((prev) => ({ ...prev, newSkill: e.target.value }))} 
                  placeholder="Add a skill (e.g., React, Python, AWS)" 
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-button focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
                  onKeyPress={(e) => handleKeyPress(e, addSkill)}
                />
                <button 
                  type="button" 
                  onClick={addSkill} 
                  className="px-6 py-3 bg-primary hover:bg-secondary text-white font-semibold rounded-button transition-all duration-200 flex items-center gap-2"
                >
                  <Plus size={18} />
                  Add
                </button>
              </div>
              {formData.skills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.skills.map((skill, i) => (
                    <div key={i} className="flex items-center gap-2 bg-white px-3 py-2 rounded-full border border-gray-200 shadow-sm">
                      <span className="text-gray-700 text-sm font-medium">{skill}</span>
                      <button
                        type="button"
                        onClick={() => removeSkill(i)}
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
            <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
              <button 
                type="button" 
                onClick={onclose} 
                className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-button transition-all duration-200"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="px-8 py-3 bg-primary hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-button transition-all duration-200 flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {jobToEdit ? "Updating..." : "Posting..."}
                  </>
                ) : (
                  <>
                    <CheckCircle size={18} />
                    {jobToEdit ? "Update Job" : "Post Job"}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

