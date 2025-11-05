import React, { useEffect, useState } from "react";
import axios from "axios";

const ManageGigs = () => {
  const [reviews, setReviews] = useState([]);
  const [rattingId, setRattingId] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/reviews/admin/all`,
          { withCredentials: true }
        );

        if (!response.data || !response.data.message || response.data.message.length === 0) {
          setMessage("No reviews found");
        } else {
          setReviews(response.data.message);
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
        setMessage("No Review Found");
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);


  async function deleteHandler() {

    if(!rattingId){
      alert('Select First')
    }

    try {
      const res = await axios.delete(
        `${import.meta.env.VITE_API_URL}/reviews/admin/delete/${rattingId}`,
        { withCredentials: true }
      );

      if (res.data.success) {
        alert("Review deleted successfully");
      } else {
        alert("No review found");
      }
    } catch (error) {
      console.error("Error deleting review:", error);
    }
  }






  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">All Reviews</h2>

      {loading ? (
        <p className="text-gray-500 text-center">Loading reviews...</p>
      ) : (
        <table className="min-w-full bg-white border rounded-lg shadow">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-3">Client ID</th>
              <th className="p-3">Freelancer ID</th>
              <th className="p-3">Booking ID</th>
              <th className="p-3">Rating</th>
              <th className="p-3">Comment</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>

          <tbody>
            {reviews.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  className="text-center py-8 text-gray-500 text-lg font-medium"
                >
                  {message || "No reviews yet"}
                </td>
              </tr>
            ) : (
              reviews.map((review) => (
                <tr key={review._id} className={`border-t hover:bg-gray-50" ${rattingId === review._id ? "bg-blue-300" : ""}`} onClick = {() => {setRattingId(review._id); console.log(review._id)}}>
                  <td className="p-3">{review.client.name}</td>
                  <td className="p-3">{review.freelancer.name}</td>
                  <td className="p-3">{review._id}</td>
                  <td className="p-3 font-medium text-yellow-600">
                    {
                      Array.from({length : 5}).map((_,i) => (
                          <span
                            key={i}
                            className={`text-lg ${
                              i < review.rating ? "text-yellow-400" : "text-gray-300"
                            }`}
                          >
                            ★
                          </span>
                      ))
                    }
                  </td>
                  <td className="p-3">{review.comment}</td>
                  <td className="p-3">
                    <button className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      onClick={()=> deleteHandler()}
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

export default ManageGigs;
