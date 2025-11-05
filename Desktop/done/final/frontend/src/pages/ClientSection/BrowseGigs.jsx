import React, { useState, useEffect } from "react";
import GigCard from "../../components/gigs/GigCard";
import axios from "axios"

const BrowseGigs = () => {
  const [gigs, setGigs] = useState([]);
  const [filteredGigs, setFilteredGigs] = useState([]);
  const [message, setMessage] = useState("No gig's Found");
  const [location, setLocation] = useState("");
  const [category, setCategory] = useState("");
  const [budget, setBudget] = useState("");



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



  const handleFilter = () => {
    let result = gigs;

    
  

    if (location)
      result = result.filter((gig) =>
        gig.location.toLowerCase().includes(location.toLowerCase())
      );
    if (category)
      result = result.filter((gig) =>
        gig.category.toLowerCase().includes(category.toLowerCase())
      );
    if (budget) result = result.filter((gig) => gig.budget <= Number(budget));

    setFilteredGigs(result);
  };

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

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Browse Gigs</h1>

      <div className="mb-6 flex gap-2">
        <input
          type="text"
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="p-2 border rounded flex-1"
        />
        <input
          type="text"
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="p-2 border rounded flex-1"
        />
        <input
          type="number"
          placeholder="Max Budget"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          className="p-2 border rounded w-32"
        />
        <button
          onClick={handleFilter}
          className="bg-blue-600 text-white px-4 rounded hover:bg-blue-700"
        >
          Apply Filters
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredGigs.length > 0 ? (
          filteredGigs.map((gig) => (
            <GigCard key={gig._id} gig={gig} onApply={handleApply} />
          ))
        ) : (
          <p>{message}</p>
        )}
      </div>
    </div>
  );
};

export default BrowseGigs;
