import axios from "axios";
import React from "react";
import { useEffect, useState } from "react";



const MyBookings = () => {
 
  const [bookings , setBookings] = useState([]);
  const [status , setStatus] = useState("Pending")
  const [message, setMessage] = useState("");
  useEffect(()=> {
    
    const fetchBooking = async () => {
      
      try{
         const response = await axios.get(
            `${import.meta.env.VITE_API_URL}/booking/all`,
            { withCredentials: true }
          );

          if (!response.data || response.data.length === 0) {
            setMessage("404 No bookings found");
          } else {
            setBookings(response.data.bookings);
          }
      
        } catch (error) {
            setMessage(error.message);
        }
      }

      fetchBooking()

  },[])


  async function statusUpdate(bookId, value){

      try {
        let bookingId = bookId;
        let status = value;
        const response = await axios.put(`${import.meta.env.VITE_API_URL}/booking/status`,
          {status, bookingId},
          {withCredentials : true}
        )

        if(response){
            setMessage(response.message);
        }

      } catch (error) {
          setMessage(error.message);
      }
  }


  return(
  <div>
    <h2 className="text-2xl font-semibold mb-4">My Bookings</h2>
    <table className="min-w-full bg-white border rounded-lg shadow">
      <thead>
        <tr className="bg-gray-100 text-left">
          <th className="p-3">Gig Title</th>
          <th className="p-3">Client Name</th>
          <th className="p-3">Status</th>
          <th className="p-3">Amount</th>
          <th className="p-3">Action</th>
        </tr>
      </thead>
      <tbody>

        {bookings.length === 0 ? (
            <tr>
              <td colSpan="5" className="text-center py-8 text-gray-500 text-lg font-medium">
                🚫 No bookings yet
              </td>
            </tr>
          ) : (
            bookings.map((gig) => (
              <tr className="border-t" key={gig.bookingId}>
                <td className="p-3">{gig.title}</td>
                <td className="p-3">{gig.name}</td>
                <td className="p-3">{gig.status}</td>
                <td className="p-3">${gig.amount}</td>
                <td className="p-3 space-x-2">
                  <button className="px-3 py-1 bg-green-500 text-white rounded-lg">Chat</button>
                  <select
                    className="px-3 py-1 bg-blue-500 text-white rounded-lg"
                    onChange={(e) => statusUpdate(gig.bookingId, e.target.value)}
                  >
                    <option
                      value="Pending"
                      selected
                      disabled
                      className="bg-blue-500 text-white"
                    >
                      {gig.status}
                    </option>
                    <option value="Pending">Pending</option>
                    <option value="Completed">Completed</option>
                  </select>
                </td>
              </tr>
            ))
          )}

      </tbody>
    </table>    
  </div>
  )
};
export default MyBookings;
