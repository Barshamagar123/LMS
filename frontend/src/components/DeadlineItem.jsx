import React from 'react';
import { Calendar, Clock, AlertCircle, CheckCircle, FileText } from 'lucide-react';

const DeadlineItem = ({ deadline, onClick }) => {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-red-500';
      case 'MEDIUM':
        return 'bg-yellow-500';
      case 'LOW':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getPriorityText = (priority) => {
    switch (priority) {
      case 'HIGH':
        return 'High Priority';
      case 'MEDIUM':
        return 'Medium Priority';
      case 'LOW':
        return 'Low Priority';
      default:
        return 'Normal Priority';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateDaysLeft = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysLeft = calculateDaysLeft(deadline.dueDate);
  const isOverdue = daysLeft < 0;
  const isToday = daysLeft === 0;
  const isTomorrow = daysLeft === 1;

  const getDaysText = () => {
    if (isOverdue) return `${Math.abs(daysLeft)} days overdue`;
    if (isToday) return 'Due today';
    if (isTomorrow) return 'Due tomorrow';
    return `${daysLeft} days left`;
  };

  const getStatusColor = () => {
    if (deadline.isCompleted) return 'bg-green-500';
    if (isOverdue) return 'bg-red-500';
    if (isToday) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  const getStatusIcon = () => {
    if (deadline.isCompleted) return <CheckCircle className="h-5 w-5 text-green-600" />;
    if (isOverdue) return <AlertCircle className="h-5 w-5 text-red-600" />;
    return <Clock className="h-5 w-5 text-blue-600" />;
  };

  return (
    <div 
      className="group cursor-pointer animate-fade-in-up"
      onClick={onClick}
    >
      <div className={`p-4 rounded-xl border ${
        deadline.isCompleted 
          ? 'bg-green-50 border-green-200 hover:border-green-300' 
          : isOverdue 
          ? 'bg-red-50 border-red-200 hover:border-red-300'
          : 'bg-white border-gray-200 hover:border-blue-300'
      } transition-all duration-300 hover:shadow-sm`}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start space-x-3">
            <div className={`p-2 rounded-lg ${
              deadline.isCompleted 
                ? 'bg-green-100' 
                : isOverdue 
                ? 'bg-red-100'
                : 'bg-blue-100'
            }`}>
              {getStatusIcon()}
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                {deadline.title}
              </h4>
              <p className="text-sm text-gray-600 mt-1">
                {deadline.courseTitle}
              </p>
            </div>
          </div>
          
          {/* Priority Badge */}
          {!deadline.isCompleted && (
            <span className={`text-xs px-2 py-1 rounded-full text-white font-medium ${getPriorityColor(deadline.priority)}`}>
              {getPriorityText(deadline.priority)}
            </span>
          )}
        </div>
        
        {/* Deadline Details */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-gray-600">
              <Calendar className="h-4 w-4 mr-1" />
              <span>{formatDate(deadline.dueDate)}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <Clock className="h-4 w-4 mr-1" />
              <span>{formatTime(deadline.dueDate)}</span>
            </div>
          </div>
          
          <div className={`font-medium ${
            deadline.isCompleted 
              ? 'text-green-600'
              : isOverdue 
              ? 'text-red-600'
              : 'text-blue-600'
          }`}>
            {getDaysText()}
          </div>
        </div>
        
        {/* Action Button */}
        {!deadline.isCompleted && (
          <button className={`w-full mt-4 py-2 text-white rounded-lg text-sm font-medium transition-colors ${
            isOverdue 
              ? 'bg-red-600 hover:bg-red-700' 
              : 'bg-blue-600 hover:bg-blue-700'
          }`}>
            {deadline.assignmentType === 'quiz' ? 'Take Quiz' : 'Submit Assignment'}
          </button>
        )}
      </div>
    </div>
  );
};

export default DeadlineItem;