import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ProgressChart = ({ enrollments }) => {
  // Generate sample data from enrollments
  const generateData = () => {
    const data = [];
    const now = new Date();
    
    // Last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      const dayStr = date.toLocaleDateString('en-US', { weekday: 'short' });
      
      // Calculate average progress for each day
      let totalProgress = 0;
      let count = 0;
      
      enrollments.forEach(enrollment => {
        if (enrollment.updatedAt) {
          const updateDate = new Date(enrollment.updatedAt);
          if (updateDate.toDateString() === date.toDateString()) {
            totalProgress += enrollment.progress || enrollment.stats?.progressPercentage || 0;
            count++;
          }
        }
      });
      
      const avgProgress = count > 0 ? Math.round(totalProgress / count) : 0;
      
      data.push({
        day: dayStr,
        progress: avgProgress,
        active: avgProgress > 0 ? 1 : 0
      });
    }
    
    return data;
  };

  const data = generateData();

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{label}</p>
          <p className="text-blue-600 text-sm">
            Avg. Progress: <span className="font-bold">{payload[0].value}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="day" 
            stroke="#6b7280"
            tick={{ fill: '#6b7280', fontSize: 12 }}
          />
          <YAxis 
            stroke="#6b7280"
            tick={{ fill: '#6b7280', fontSize: 12 }}
            domain={[0, 100]}
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="progress"
            stroke="#3b82f6"
            strokeWidth={3}
            dot={{ r: 4, fill: '#3b82f6' }}
            activeDot={{ r: 6, fill: '#3b82f6' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProgressChart;