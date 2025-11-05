import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { data, Navigate } from "react-router-dom";

const MyGigs = () => {
  const [id, setUid ] = useState('') 
  const navigate = useNavigate();
  // const [id, setId] = useState('');
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);


  
  useEffect(() => {
    const uid = localStorage.getItem("userId");  
    setUid(uid);

    const fetchGigs = async () => {
      try {
        console.log("Fetching gigs for:", uid);

        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/gigs/my-gigs/${uid}`,
          { withCredentials: true }
        );

        console.log("Fetched gigs:", res.data.gigs);
        setGigs(res.data.gigs);
      } catch (err) {
        console.error("Error fetching gigs:", err);
      } finally {
        setLoading(false);
      }
    };

    if (uid) fetchGigs(); 
  }, []);


  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600 text-lg">Loading gigs...</div>
      </div>
    );
  }
  
  const handleViewDetails = (id) => {
    navigate(`/client-dashboard/${id}`);
  };

  
  const handlePostGit = () => {
    navigate(`/post-gig`);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <h2 className="text-3xl d-inline font-bold mb-8 text-gray-800">My Gigs</h2>
      <button className=" d-inline float-end font-bold mb-8 text-blue-800" 
        onClick={() => handlePostGit() }
      ><svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="currentColor" className="bi bi-plus-square" viewBox="0 0 16 16">
  <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z"/>
  <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"/>
</svg></button>

      {gigs.length === 0 ? (
        <div className="text-center text-gray-500">No gigs available right now.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mt-5 gap-8">
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

export default MyGigs;