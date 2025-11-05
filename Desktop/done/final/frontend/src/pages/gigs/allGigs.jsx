import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { data, Navigate } from "react-router-dom";

const AllGigs = () => {
   const navigate = useNavigate();
  const [id, setId] = useState('');
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const fetchGigs = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/gigs`, { withCredentials : true });
        setGigs(res.data);
        if(res){
          
        }
      } catch (err) {
        console.error("Error fetching gigs:", err);
      }
    finally {
        setLoading(false);
      }
    };

    fetchGigs();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600 text-lg">Loading gigs...</div>
      </div>
    );
  }
  
  const handleViewDetails = (id) => {
    navigate(`/GigsDetails/${id}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <h2 className="text-3xl font-bold mb-8 text-gray-800">Available Gigs</h2>

      {gigs.length === 0 ? (
        <div className="text-center text-gray-500">No gigs available right now.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {gigs.map((gig) => (
              <div
                key={gig._id}
                className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-xl transition duration-300"
              >
                <img
                  src={gig.image}
                  alt={gig.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-5">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {gig.title}
                  </h3>
                  <p className="text-sm text-gray-500 mb-3">{gig.category}</p>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {gig.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-600 font-bold">${gig.budget}</span>

                    <button
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                      onClick={() => handleViewDetails(gig._id)} 
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default AllGigs;