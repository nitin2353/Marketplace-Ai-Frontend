import React, { useEffect, useState } from "react";
import axios from "axios";

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [message, setMessage] = useState("");
  const [bookingId, setBookingId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/booking/admin/all`,
          { withCredentials: true }
        );

        if (!response.data || response.data.total === 0) {
          setMessage("No bookings found");
        } else {
          setBookings(response.data.bookings);
        }
      } catch (error) {
        console.error("Error fetching bookings:", error);
        setMessage("Failed to fetch bookings. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, []);

  async function deleteHandler() {

      if(!bookingId){
        alert("Select First")
      }

        try {
            const res = await axios.delete(`${import.meta.env.VITE_API_URL}/booking/admin/delete/${bookingId}`,
              {withCredentials : true}
            )
            if(!res){
              console.log(error);
              alert("Booking not Deleted");
            }
            else{
              alert("Booking Successfully Deleted");
            }
        } catch (error) {
            console.log(error);
        }
  }


  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">All Bookings</h2>

      {loading ? (
        <p className="text-gray-500 text-center">Loading bookings...</p>
      ) : (
        <table className="min-w-full bg-white border rounded-lg shadow">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-3">Gig Title</th>
              <th className="p-3">Client Name</th>
              <th className="p-3">Freelancer Name</th>
              <th className="p-3">Status</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {bookings.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  className="text-center py-8 text-gray-500 text-lg font-medium"
                >
                  {message || "No bookings yet"}
                </td>
              </tr>
            ) : (
              bookings.map((gig) => (
                <tr key={gig._id} className={`border-t hover:bg-gray-50" ${bookingId === gig.bookingId ? "bg-blue-300" : ""}`} onClick = {() => {setBookingId(gig.bookingId);}}>
                  <td className="p-3">{gig.title}</td>
                  <td className="p-3">{gig.clientName}</td>
                  <td className="p-3">{gig.freelancerName}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded text-sm font-medium ${
                        gig.status === "open"
                          ? "bg-green-100 text-green-700"
                          : gig.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {gig.status}
                    </span>
                  </td>
                  <td className="p-3">₹{gig.amount}</td>
                  <td className="p-3 space-x-2">
                    <button className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      onClick={() => deleteHandler()}  
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default MyBookings;
