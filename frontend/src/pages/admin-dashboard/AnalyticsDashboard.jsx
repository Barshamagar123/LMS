// components/AnalyticsDashboard.jsx
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const AnalyticsDashboard = () => {
  const revenueData = [
    { month: 'Jan', revenue: 125430, courses: 45 },
    { month: 'Feb', revenue: 142890, courses: 52 },
    { month: 'Mar', revenue: 138750, courses: 48 },
    { month: 'Apr', revenue: 156320, courses: 61 },
    { month: 'May', revenue: 162450, courses: 58 },
    { month: 'Jun', revenue: 178900, courses: 67 }
  ];

  const categoryData = [
    { name: 'Web Development', value: 35 },
    { name: 'Data Science', value: 25 },
    { name: 'Business', value: 20 },
    { name: 'Design', value: 15 },
    { name: 'Other', value: 5 }
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue & Course Growth</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                formatter={(value) => [
                  value.toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
                  'Revenue'
                ]}
              />
              <Legend />
              <Bar dataKey="revenue" fill="#4F46E5" name="Revenue" />
              <Bar dataKey="courses" fill="#10B981" name="Courses" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Course Categories</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Additional Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h4 className="text-sm font-medium text-gray-500">Average Course Rating</h4>
          <p className="text-2xl font-bold text-gray-900 mt-2">4.7/5.0</p>
          <p className="text-sm text-green-600 mt-1">+0.2 from last month</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h4 className="text-sm font-medium text-gray-500">Completion Rate</h4>
          <p className="text-2xl font-bold text-gray-900 mt-2">68%</p>
          <p className="text-sm text-green-600 mt-1">+5% from last month</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h4 className="text-sm font-medium text-gray-500">Active Instructors</h4>
          <p className="text-2xl font-bold text-gray-900 mt-2">142</p>
          <p className="text-sm text-green-600 mt-1">+12 from last month</p>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;