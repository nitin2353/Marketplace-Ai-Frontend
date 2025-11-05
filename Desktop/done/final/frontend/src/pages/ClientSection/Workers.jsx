import { useEffect, useState } from "react";
import axios from "axios";

const Workers = () => {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (userId) {
      fetchWorkers();
    } else {
      console.warn("No userId found in localStorage");
      setLoading(false);
    }
  }, []);

  const fetchWorkers = async () => {
    setLoading(true);
    try {
      const uid = localStorage.getItem("userId");

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/booking/client/workers/${uid}`,
        { withCredentials: true }
      );

      const bookings = response.data.UserBookings || [];

      const detailedBookings = await Promise.all(
        bookings.map(async (booking) => {
          try {
            const gigRes = await axios.get(
              `${import.meta.env.VITE_API_URL}/api/gigs/${booking.gigId}`,
              { withCredentials: true }
            );

            const freelancerRes = await axios.get(
              `${import.meta.env.VITE_API_URL}/api/user/data/${booking.freelancerId}`,
              { withCredentials: true }
            );

            return {
              ...booking,
              gigTitle: gigRes.data.title,
              freelancerName: freelancerRes.data.user.name,
            };
          } catch (err) {
            console.error("Error fetching gig/freelancer:", err);
            return booking;
          }
        })
      );

      setWorkers(detailedBookings);
    } catch (error) {
      console.error("Error fetching workers:", error);
      setWorkers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async (id) => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/reviews/all/${id}`,
        { withCredentials: true }
      );

      console.log(res)

      if (!res.data || !res.data.success || res.data.message.length === 0) {
        console.log("404 - No rating found");
        setRating(0);
        setReviewText("");
        return;
      }

      const firstReview = res.data.message[0];
      setRating(firstReview.rating);
      setReviewText(firstReview.comment);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  const handleGiveReview = (worker) => {
    setSelectedWorker(worker);
    fetchReviews(worker.freelancerId); 
  };

  const handleCloseModal = () => {
    setSelectedWorker(null);
    setReviewText("");
    setRating(0);
  };

  const handleSubmitReview = async () => {
    if (!reviewText || rating === 0) {
      alert("Please provide both rating and review text!");
      return;
    }

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/reviews`,
        {
          freelancerId: selectedWorker.freelancerId,
          bookingId: selectedWorker._id,
          rating,
          comment: reviewText,
        },
        { withCredentials: true }
      );

      if (res.data.success) {
        alert("Review submitted successfully!");
        handleCloseModal();
      } else {
        alert("Failed to submit review");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Failed to submit review");
    }
  };

  if (loading) {
    return <p className="text-center text-gray-500">Loading Workers...</p>;
  }

  if (!userId) {
    return <p className="text-center text-red-500">User not logged in.</p>;
  }

  return (
    <div className="mt-6 relative">
      <h2 className="text-2xl font-semibold mb-4">Workers & Ratings</h2>
      <div className="bg-white p-6 rounded-lg shadow">
        {workers.length > 0 ? (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b">
                <th className="py-2">Gig Title</th>
                <th className="py-2">Freelancer</th>
                <th className="py-2">Status</th>
                <th className="py-2">Price</th>
                <th className="py-2">Review</th>
              </tr>
            </thead>
            <tbody>
              {workers.map((rev) => (
              
                <tr key={rev._id} className="border-b hover:bg-gray-50">
                  <td className="py-2">{rev.gigTitle}</td>
                  <td className="py-2">{rev.freelancerName}</td>
                  <td className="py-2">{rev.status}</td>
                  <td className="py-2">{rev.amount}</td>
                  <td className="py-2">
                    <button
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                      onClick={() => handleGiveReview(rev)}
                    >
                      Your Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-500 text-center">No Workers yet.</p>
        )}
      </div>

      {selectedWorker && (
        <div className="fixed inset-0 bg-opacity-10 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow w-96">
            <h3 className="text-xl font-semibold mb-3">
              Review {selectedWorker.freelancerName}
            </h3>

            <div className="flex mb-3 space-x-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <span
                  key={i}
                  className={`cursor-pointer text-2xl ${
                    i < rating ? "text-yellow-400" : "text-gray-300"
                  }`}
                  onClick={() => setRating(i + 1)}
                >
                  ★
                </span>
              ))}
            </div>

            <textarea
              className="w-full border p-2 rounded-md mb-3"
              rows="3"
              placeholder="Write your review..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
            />

            <div className="flex justify-end space-x-2">
              <button
                className="bg-gray-300 px-4 py-2 rounded-md hover:bg-gray-400"
                onClick={handleCloseModal}
              >
                Cancel
              </button>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                onClick={handleSubmitReview}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Workers;
