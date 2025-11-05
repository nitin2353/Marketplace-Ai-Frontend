import React from "react";
import { useNavigate } from "react-router-dom";

const GigCard = ({ gig, onApply }) => {

  const navigate = useNavigate();
  function showDetail(id){

      navigate(`/freelancer-dashboard/${id}`)
  }

  return (
    <div className="bg-white p-4 rounded-xl shadow hover:shadow-lg transition">
      <img src={gig.image || "notfound"} alt="" className="h-40 w-100"/>
      <h2 className="text-xl font-semibold mb-2">{gig.title}</h2>
      <p className="text-gray-600 mb-1">
        <strong>Category:</strong> {gig.category}
      </p>
      <p className="text-gray-600 mb-1">
        <strong>Location:</strong> {gig.location}
      </p>
      <p className="text-gray-800 mb-2">
        💰 <strong>Budget:</strong> ₹{gig.budget}
      </p>
      <p className="text-sm text-gray-500">Posted by {gig.freelancer}</p>

      <div className="mt-4 flex gap-2">
        <button
          className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          onClick={() => onApply(gig)}
        >
          Apply
        </button>
        <button className="flex-1 bg-gray-200 text-gray-800 py-2 rounded hover:bg-gray-300"
          onClick={() => {showDetail(gig._id)}}  
        >
          View Details
        </button>
      </div>
    </div>
  );
};

export default GigCard;