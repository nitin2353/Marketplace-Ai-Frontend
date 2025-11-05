import React, { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import EditGig from "./EditGig";

const GigsDetails = (prop) => {

  const navigate = useNavigate();
  const { id } = useParams(); 
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [gig, setGig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


    const handleApply = async (amount) => {
  
  
      try {
          const id = amount._id;
          let response = await axios.get(`${import.meta.env.VITE_API_URL}/booking/accept/${id}`,{
            withCredentials : true
          });
          if(!response) {
              setMessage(response.message);
          }
      } catch (error) {
          setMessage(error.message);
      }
  
  
      const {data:keydata} = await axios.get(`${import.meta.env.VITE_API_URL}/api/payment/getkey`)
      const {key} = keydata
      console.log(key);
      
      const {data:orderdata} = await axios.post(`${import.meta.env.VITE_API_URL}/api/payment/create-order`,{
          amount:"500"
      })
      const {order} = orderdata
  
     
      const options = {
          key: key, 
          amount: amount, 
          currency: 'INR',
          name: 'GigConnect',
          description: 'Test Transaction',
          order_id: order.id, 
          callback_url: `${import.meta.env.VITE_API_URL}/api/payment/verification`,
          prefill: {
            name: 'Gaurav Kumar',
            email: 'gaurav.kumar@example.com',
            contact: '9999999999'
          },
          theme: {
            color: '#F37254'
          },
        };
  
        const rzp = new Razorpay(options);
        rzp.open();
    }

  useEffect(() => {
    const fetchGig = async () => {

      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/gigs/${id}`);
        setGig(res.data);
      } catch (err) {
        console.error("Error fetching gig details:", err);
        setError("Failed to load gig details");
      } finally {
        setLoading(false);
      }
    };

    fetchGig();
  },[id]);



  const deleteGig = async () => {
      try {
        const res = await axios.delete(`${import.meta.env.VITE_API_URL}/api/gigs/${id}`);
        if(!res){
          alert(res.message)
        }
      } catch (error) {
        console.log(error)
      }
      navigate('/client-dashboard')
  }



  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="animate-pulse text-gray-600">Loading gig details...</p>
      </div>
    );
  }

  if (error) {
    return <p className="text-center text-red-500 mt-10">{error}</p>;
  }

  if (!gig) {
    return <p className="text-center text-gray-500 mt-10">Gig not found.</p>;
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <EditGig
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
      />
      <div className="grid md:grid-cols-2 gap-10 items-start">
        {/* Gig Image */}
        <div>
          <img
            src={gig.image || ""}
            alt={gig.title}
            className="rounded-lg w-full h-80 object-cover shadow-md"
          />
        </div>

        {/* Gig Info */}
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            {gig.title}
          </h1>
          <p className="text-gray-600 mb-4">{gig.description}</p>

          <div className="mb-4">
            <span className="font-semibold text-gray-700">Category:</span>{" "}
            <span className="text-blue-600">{gig.category}</span>
          </div>

          <div className="mb-4">
            <span className="font-semibold text-gray-700">Price:</span>{" "}
            <span className="text-green-600 font-bold">${gig.budget}</span>
          </div>

          {gig.freelancer && (
            <div className="border-t border-gray-200 pt-4 mt-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Freelancer Information
              </h3>
              <p className="text-gray-600">
                <span className="font-medium">Name:</span>{" "}
                {gig.freelancer.name || "N/A"}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Email:</span>{" "}
                {gig.freelancer.email || "Hidden"}
              </p>
            </div>
          )}
          
          {
            prop.who === "freelancer" ? (
              <div className="mt-6 flex gap-4">
                <button
                  className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 transition"
                  onClick={() => handleApply(gig)}
                >
                  Apply for Gig
                </button>
                <button
                  className="bg-gray-100 text-gray-700 px-5 py-2 rounded-md hover:bg-gray-200 transition"
                  onClick={() => Navigate('')}
                >
                  Message Freelancer
                </button>
              </div>
            ) : (
              <div className="mt-6 flex gap-4">
                <button
                  className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 transition"
                  onClick={() => setIsPopupOpen(true)}
                >
                  Edit Gig
                </button>
                <button
                  className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 transition"
                  onClick={() => deleteGig(true)}
                >
                  Delete Gig
                </button>
              </div>
            )
          }    
        </div>
      </div>
    </div>
  );
};

export default GigsDetails;
