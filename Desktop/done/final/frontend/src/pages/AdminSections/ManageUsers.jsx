import React, { useState, useEffect } from "react";
import axios from "axios";

function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");
  const [userId, setUserId] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/user/admin/data/all`,
          { withCredentials: true }
        );

        if (!response.data || response.data.users.length === 0) {
          setMessage("No users found");
        } else {
          setUsers(response.data.users);
        }
      } catch (error) {
        setMessage(error.message);
      }
    };

    fetchUsers();
  }, []);

  async function deleteHandler(){

    if(!userId){
      alert("Select First")
    }

    try {
        const res = await axios.delete(`${import.meta.env.VITE_API_URL}/api/user/admin/delete/${userId}`,
          {withCredentials : true}
        )
        if(!res){
          console.log(error);
          alert("User not Deleted");
        }
        else{
          alert("User Successfully Deleted");
        }
    } catch (error) {
        console.log(error);
    }
  }


  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4">All Users</h2>

      {message && (
        <p className="text-center text-gray-500 mb-4 font-medium">{message}</p>
      )}

      <table className="min-w-full bg-white border rounded-lg shadow">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-3">Profile</th>
            <th className="p-3">Name</th>
            <th className="p-3">Email</th>
            <th className="p-3">Role</th>
            <th className="p-3">Action</th>
          </tr>
        </thead>
        <tbody>
          {users && users.length > 0 ? (
            users.map((e) => (
              (e.role == "admin") ? "" : (
                <tr key={e._id} className={`border-t hover:bg-gray-50" ${userId === e._id ? "bg-blue-300" : ""}`} onClick = {() => {setUserId(e._id); console.log(e._id)}}>
                <td className="p-3">
                  {e.profileImage ? (
                    <img
                      src={e.profileImage}
                      alt={e.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                  )}
                </td>
                <td className="p-3">{e.name}</td>
                <td className="p-3">{e.email}</td>
                <td className="p-3 capitalize">{e.role}</td>
                <button 
                  className="bg-red-600 text-white px-4 rounded hover:bg-blue-700 p-2 mt-3"
                  onClick={() => deleteHandler()}
                >Delete</button>
              </tr>
              )
            ))
          ) : (
              <tr>
              <td
                colSpan="4"
                className="text-center py-8 text-gray-500 text-lg font-medium"
              >
                No users yet
              </td>
            </tr>
          )}
          
        </tbody>
      </table>
    </div>
  );
}

export default ManageUsers;
