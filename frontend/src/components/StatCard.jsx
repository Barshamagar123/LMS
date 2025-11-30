import React from "react";

const StatCard = ({ title, value, icon }) => (
  <div className="bg-white shadow-md rounded-lg p-6 flex items-center space-x-4">
    <div className="text-4xl text-blue-500">{icon}</div>
    <div>
      <h4 className="text-gray-500">{title}</h4>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  </div>
);

export default StatCard;
