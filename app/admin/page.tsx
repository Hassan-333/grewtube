"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaTrashAlt } from "react-icons/fa"; 
import { signOut } from "next-auth/react";

const AdminPanel = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState(null); 
  const [error, setError] = useState(null);
  const [isLoadingAdminCheck, setIsLoadingAdminCheck] = useState(true); 

  useEffect(() => {
    if (status === "loading") return; // Do nothing while loading
    
    if (status === "unauthenticated" || session?.user?.role !== "admin") {
      // Redirect non-admin users or unauthenticated users to homepage
      router.push("/");
    }
  }, [session, status, router]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/admin/getUsers');
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        const data = await response.json();
        setUsers(data.users); // Set the users in the state
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false); // Stop loading once the users are fetched
      }
    };
  
    fetchUsers(); // Call fetchUsers when the component mounts or after deletion
  }, []);

  const handleDeleteUser = async (userId) => {
    try {
      const response = await fetch(`/api/admin/deleteUsers/${userId}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete user");

      // Remove the user from the state after deletion
      setUsers(users.filter((user) => user._id !== userId));
      setSelectedUserId(null); // Deselect the user after deletion
    } catch (error) {
      setError("Failed to delete user");
      console.error(error);
    }
  };

  // Show loading while verifying if user is an admin
  return (
    <div className="flex min-h-screen bg-[#181A1B] text-white">
      {/* Sidebar */}
      <aside className="bg-[#232527] text-white w-64 p-6 flex flex-col justify-between">
        {/* Logo */}
        <div>
          <div className="mb-10">
            <h1 className="text-2xl font-bold text-center text-[#F8EF6D]">Admin Panel</h1>
          </div>
          {/* Sidebar Links */}
          <nav>
            <ul>
              <li className="mb-6">
                <a href="#" className="text-white text-lg font-semibold hover:text-[#F8EF6D] transition duration-200">
                  Users
                </a>
              </li>
            </ul>
          </nav>
        </div>

        {/* Logout Button */}
        <button
          className="bg-red-600 p-3 rounded-lg mt-auto text-white font-bold hover:bg-red-700 transition duration-200"
          onClick={() => signOut({ callbackUrl: "/" })} // Redirect to login after sign out
        >
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {/* Dashboard Header */}
        <div className="mb-6">
          <h2 className="text-4xl font-bold text-[#F8EF6D]">Admin Dashboard</h2>
        </div>

        {/* User Count Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-[#2B2D32] p-6 rounded-lg shadow-lg text-center">
            <h3 className="text-lg font-semibold text-gray-400">Total Users</h3>
            <p className="text-5xl mt-4 font-bold text-[#F8EF6D]">{users.length}</p>
          </div>
        </div>

        {/* User List */}
        <div className="bg-[#2B2D32] p-6 rounded-lg shadow-lg">
          <h3 className="text-2xl font-bold text-gray-200 mb-4">User List</h3>
          {loading ? (
            <p>Loading users...</p>
          ) : (
            <ul className="space-y-4">
              {users.map((user) => (
                <li key={user._id} className="bg-gray-800 p-4 rounded-md shadow-sm">
                  <div className="flex justify-between items-center">
                    <p
                      className="text-lg cursor-pointer"
                      onClick={() => setSelectedUserId(selectedUserId === user._id ? null : user._id)}
                    >
                      {user.username || user.email}
                    </p>
                    <button
                      onClick={() => handleDeleteUser(user._id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <FaTrashAlt />
                    </button>
                  </div>

                  {/* Display User Details Below Each User */}
                  {selectedUserId === user._id && (
                    <div className="bg-[#1E2022] p-6 mt-4 rounded-lg shadow-lg">
                      <h3 className="text-2xl font-bold text-gray-200 mb-4">User Details</h3>
                      <p className="text-lg mb-2"><strong>Username:</strong> {user.username}</p>
                      <p className="text-lg mb-2"><strong>Email:</strong> {user.email}</p>
                      <p className="text-lg mb-2"><strong>Password:</strong> {user.password}</p>
                      {/* Display YouTube Links */}
                      <p className="text-lg mb-2">
                        <strong>YouTube Links:</strong>
                        {user.links.length > 0 ? (
                          <ul className="list-disc list-inside">
                            {user.links.map((link, index) => (
                              <li key={index}>
                                <a href={link.url} target="_blank" className="text-blue-400 underline">
                                  {link.url}
                                </a> (Added on: {new Date(link.createdAt).toLocaleDateString()})
                              </li>
                            ))}
                          </ul>
                        ) : (
                          'No YouTube links available'
                        )}
                      </p>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Display Error if any */}
        {error && (
          <p className="text-red-500 mt-4">
            {error}
          </p>
        )}
      </main>
    </div>
  );
};

export default AdminPanel;
