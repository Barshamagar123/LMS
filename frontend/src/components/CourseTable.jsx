import React from "react";

const CourseTable = ({ courses, onManage }) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">My Courses</h2>
      <table className="w-full table-auto border border-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 text-left">Title</th>
            <th className="px-4 py-2 text-left">Status</th>
            <th className="px-4 py-2">Price</th>
            <th className="px-4 py-2">Students</th>
            <th className="px-4 py-2">Revenue</th>
            <th className="px-4 py-2">Rating</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {courses.length === 0 ? (
            <tr>
              <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                No courses created yet.
              </td>
            </tr>
          ) : (
            courses.map((course) => (
              <tr key={course.id} className="border-b hover:bg-gray-50 transition">
                <td className="px-4 py-2">{course.title}</td>
                <td className="px-4 py-2 text-center">{course.status}</td>
                <td className="px-4 py-2 text-center">{course.price === 0 ? "Free" : `$${course.price}`}</td>
                <td className="px-4 py-2 text-center">{course.enrollmentsCount}</td>
                <td className="px-4 py-2 text-center">${course.revenue}</td>
                <td className="px-4 py-2 text-center">{course.rating}</td>
                <td className="px-4 py-2 text-center space-x-2">
                  <button
                    onClick={() => onManage(course.id)}
                    className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                  >
                    Manage
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CourseTable;
