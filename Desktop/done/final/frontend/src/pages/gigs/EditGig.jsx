import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

const EditGig = ({ isOpen, onClose, initialData }) => {
  const { id } = useParams();
  const navigate  = useNavigate()
  const [formData, setFormData] = useState({
    image: null,
    title: "",
    description: "",
    category: "",
    budget: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        image: null, 
        title: initialData.title || "",
        description: initialData.description || "",
        category: initialData.category || "",
        budget: initialData.budget?.toString() || "",
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files && files.length > 0 ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();

      if (formData.title) data.append("title", formData.title);
      if (formData.description) data.append("description", formData.description);
      if (formData.category) data.append("category", formData.category);
      if (formData.budget) data.append("budget", formData.budget);
      if (formData.image) data.append("image", formData.image);

      const res = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/gigs/${id}`,
        data,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (res.status === 200) {
        window.location.reload()
        onClose();
      }
    } catch (error) {
      console.error("Error updating gig:", error);
      alert(error.response?.data?.message || "Something went wrong!");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-lg p-6 relative">
    
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
        >
          ✕
        </button>

        <h2 className="text-xl font-semibold mb-2 text-center text-blue-600">
          Edit Gig Details
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* <div> */}
            <label className="block font-medium">Image</label>
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleChange}
              className="w-full border p-1 rounded-md "
            />
            {initialData?.image && !formData.image && (
              <img
                src={initialData.image}
                alt="Existing"
                className="mt-2 w-24 h-20 object-cover rounded-lg border d-flex"
              />
            )}
            {formData.image && (
              <img
                src={URL.createObjectURL(formData.image)}
                alt="Preview"
                className="mt-2 w-24 h-24 object-cover rounded-lg border"
              />
            )}
          {/* </div> */}

  
          <div>
            <label className="block font-medium mb-1">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full border p-1 rounded-md"
              placeholder="Enter gig title"
            />
          </div>

  
          <div>
            <label className="block font-medium mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="w-full border p-1 rounded-md"
              placeholder="Write about your gig..."
            ></textarea>
          </div>

          <div>
            <label className="block font-medium mb-1">Category</label>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full border p-1 rounded-md"
              placeholder="e.g. Web Development"
            />
          </div>

       
          <div>
            <label className="block font-medium mb-1">Price ($)</label>
            <input
              type="number"
              name="budget"
              value={formData.budget}
              onChange={handleChange}
              className="w-full border p-1 rounded-md"
              placeholder="Enter your price"
            />
          </div>

         
          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-200 px-4 py-2 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditGig;
