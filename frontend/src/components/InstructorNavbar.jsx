import React from "react";
import { NavLink } from "react-router-dom";

const InstructorNavbar = () => {
  return (
    <div className="bg-white shadow-lg w-64 p-4 h-screen">
      <h2 className="text-xl font-bold mb-6">Instructor Panel</h2>
      <nav className="flex flex-col space-y-2">
        <NavLink
          to="/instructor/dashboard"
          className={({ isActive }) =>
            isActive ? "text-blue-500 font-semibold" : "hover:text-blue-400"
          }
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/instructor/courses/create"
          className={({ isActive }) =>
            isActive ? "text-blue-500 font-semibold" : "hover:text-blue-400"
          }
        >
          Create Course
        </NavLink>
      </nav>
    </div>
  );
};

export default InstructorNavbar;
