import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const CreateGig = () => {
  const navigate = useNavigate()
  const [status, setStatus] = useState();
  const [message, setMessage] = useState();
  const [gig, setGig] = useState({
    title: "",
    description: "",
    category: "",
    budget: "",
    location: "",
  });
  const [image, setImage] = useState(null);

  const handleChange = (e) => {
    setGig({ ...gig, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {

      const formData = new FormData();
      formData.append("title", gig.title);
      formData.append("description", gig.description);
      formData.append("category", gig.category);
      formData.append("budget", gig.budget);
      formData.append("location", gig.location);
      if (image) formData.append("gigImage", image);

      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/gigs`,
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (res.data.success) {
        setStatus("success")
        setMessage(res.data.message)

        setTimeout(() => {
          navigate('/client-dashboard')
        }, 1000)

        setGig({
          title: "",
          description: "",
          category: "",
          budget: "",
          location: "",
        });
        setImage(null);
      }
    } catch (err) {
      setStatus("error")
      setMessage("Error:", err);
      alert("Failed to create gig");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4 space-y-3">
      <input
        name="title"
        placeholder="Title"
        value={gig.title}
        onChange={handleChange}
        className="border p-2 w-full"
        required
      />
      <textarea
        name="description"
        placeholder="Description"
        value={gig.description}
        onChange={handleChange}
        className="border p-2 w-full"
        required
      />
      <input
        name="budget"
        placeholder="Price"
        type="number"
        value={gig.budget}
        onChange={handleChange}
        className="border p-2 w-full"
        required
      />
      <input
        type="file"
        name="gigImage"
        onChange={handleFileChange}
        className="border p-2 w-full"
        accept="image/*"
        required
      />
      <input
        name="location"
        placeholder="Location"
        type="text"
        value={gig.location}
        onChange={handleChange}
        className="border p-2 w-full"
        required
      />
      <input
        name="category"
        placeholder="Category"
        value={gig.category}
        onChange={handleChange}
        className="border p-2 w-full"
        required
      />
        <h4
          className={`d-flex justify-content-center fw-bold ${
            status === "success" ? "text-blue-500" : "text-red-500"
          }`}
        >
          {message}
        </h4>

      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
      >
        Create Gig
      </button>
    </form>
  );
};

export default CreateGig;
