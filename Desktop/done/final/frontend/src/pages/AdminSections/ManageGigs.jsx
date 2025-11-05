import React from "react";
import { useState } from "react";
import { useEffect } from "react";
import axios from "axios";


function ManageGigs() {
  const [gigs, setGigs] = useState([]);
  const [gigId, setGigId] = useState();
  const [filteredGigs, setFilteredGigs] = useState([]);
  const [message, setMessage] = useState("No gig's Found");



  useEffect(() => {
    const fetchGigs = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/gigs`, {
          withCredentials: true,
        });

        if (!response.data || response.data.length === 0) {
          setMessage("No gigs found.");
        } else {
          setGigs(response.data);
          setFilteredGigs(response.data);
          setMessage("");
        }
      } catch (error) {
        console.error("Error fetching gigs:", error);
        setMessage("Failed to load gigs. Please try again later.");
      }
    };

    fetchGigs();
  }, []); 



  async function deleteHandler(){

    if(!gigId){
      alert('Select First');
    }

    try {
        const res = await axios.delete(`${import.meta.env.VITE_API_URL}/api/gigs/${gigId}`,
          {withCredentials : true}
        )
        if(!res){
          console.log(error);
          alert("Gig not Deleted");
        }
        else{
          alert("Gig Successfully Deleted");
        }
    } catch (error) {
        console.log(error);
    }
  }



  

  return (
    <div className="p-4">
  <h2 className="text-2xl font-semibold mb-4">All Gigs</h2>

  {message && (
    <p className="text-center text-gray-500 mb-4 font-medium">{message}</p>
  )}

  <table className="min-w-full bg-white border rounded-lg shadow">
    <thead>
      <tr className="bg-gray-100 text-left">
        <th className="p-3">Image</th>
        <th className="p-3">Title</th>
        <th className="p-3">Description</th>
        <th className="p-3">Category</th>
        <th className="p-3">Location</th>
        <th className="p-3">Price</th>
        <th className="p-3">Action</th>
      </tr>
    </thead>

    <tbody>
      {gigs && gigs.length > 0 ? (
        gigs.map((e) => (
         <tr key={e._id} className={`border-t hover:bg-gray-50" ${gigId === e._id ? "bg-blue-300" : ""}`} onClick = {() => {setGigId(e._id);}}>
            <td className="p-3">
              {e.image ? (
                <img
                  src={e.image}
                  alt={e.title}
                  className="h-9 w-9 rounded-full object-cover"
                />
              ) : (
                <div className="h-9 w-9 bg-gray-300 rounded-full"></div>
              )}
            </td>
            <td className="p-3">{e.title}</td>
            <td className="p-3">{e.description}</td>
            <td className="p-3">{e.category}</td>
            <td className="p-3">{e.location}</td>
            <td className="p-3">{e.budget}</td>
            <td className="p-3">
              <button
                className="bg-red-600 text-white px-4 rounded hover:bg-red-700 p-2"
                onClick={() => deleteHandler()}
              >
                Delete
              </button>
            </td>
          </tr>
        ))
      ) : (
        <tr>
          <td
            colSpan="7"
            className="text-center py-8 text-gray-500 text-lg font-medium"
          >
            No gigs yet
          </td>
        </tr>
      )}
    </tbody>
  </table>
</div>

  );
}

export default ManageGigs;