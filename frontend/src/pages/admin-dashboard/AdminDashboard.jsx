import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import API from "../../api/axios";

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalRevenue: 0,
  });
  const [pendingInstructors, setPendingInstructors] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        // Stats
        const resStats = await API.get("/admin/stats", {
          headers: { Authorization: `Bearer ${user.accessToken}` },
        });
        setStats(resStats.data);

        // Pending instructor approvals
        const resPending = await API.get("/admin/pending-instructors", {
          headers: { Authorization: `Bearer ${user.accessToken}` },
        });
        setPendingInstructors(resPending.data);

        // Recent activities
        const resActivities = await API.get("/admin/activities", {
          headers: { Authorization: `Bearer ${user.accessToken}` },
        });
        setRecentActivities(resActivities.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchAdminData();
  }, [user]);

  const handleApprove = async (id) => {
    try {
      await API.post(`/admin/instructor/${id}/approve`, {}, {
        headers: { Authorization: `Bearer ${user.accessToken}` },
      });
      setPendingInstructors((prev) => prev.filter(inst => inst.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (id) => {
    try {
      await API.post(`/admin/instructor/${id}/reject`, {}, {
        headers: { Authorization: `Bearer ${user.accessToken}` },
      });
      setPendingInstructors((prev) => prev.filter(inst => inst.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
      <p className="mb-6">Welcome, {user.name}</p>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-gray-500 text-sm">Total Users</h2>
          <p className="text-2xl font-bold">{stats.totalUsers}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-gray-500 text-sm">Total Courses</h2>
          <p className="text-2xl font-bold">{stats.totalCourses}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-gray-500 text-sm">Total Revenue</h2>
          <p className="text-2xl font-bold">${stats.totalRevenue}</p>
        </div>
      </div>

      {/* Pending Instructor Approvals */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-bold mb-4">Pending Instructor Approvals</h2>
        {pendingInstructors.length ? (
          <ul>
            {pendingInstructors.map((inst) => (
              <li key={inst.id} className="flex justify-between items-center mb-2 border-b py-2">
                <span>{inst.name} ({inst.email})</span>
                <div>
                  <button
                    onClick={() => handleApprove(inst.id)}
                    className="bg-green-600 text-white px-3 py-1 rounded mr-2 hover:bg-green-700"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(inst.id)}
                    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                  >
                    Reject
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>No pending approvals.</p>
        )}
      </div>

      {/* Recent Activities */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">Recent Activities</h2>
        {recentActivities.length ? (
          <ul>
            {recentActivities.map((act) => (
              <li key={act.id} className="border-b py-2">
                <span className="text-gray-700">{act.message}</span>
                <span className="text-gray-400 text-sm ml-2">{new Date(act.createdAt).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p>No recent activities.</p>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
