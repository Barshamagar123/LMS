import React from 'react';
import { Clock, Users, Star, BookOpen, PlayCircle, Lock, Award } from 'lucide-react';

const CourseCard = ({ course, isEnrolled, onEnroll }) => {
  const isFree = (course.price || 0) === 0;
  const totalLessons = course.totalLessons || course.modules?.reduce((sum, module) => 
    sum + (module.lessons?.length || 0), 0) || 0;
  
  const formatDuration = (minutes) => {
    if (!minutes) return '0h';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getThumbnailUrl = () => {
    if (!course.thumbnail) return null;
    
    let url = course.thumbnail;
    if (url.startsWith('/')) {
      if (window.location.hostname === 'localhost') {
        url = `http://localhost:3000${url}`;
      } else {
        url = `${window.location.origin}${url}`;
      }
    }
    return url;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      {/* Image */}
      <div className="h-40 bg-gradient-to-r from-blue-100 to-purple-100 relative overflow-hidden">
        {getThumbnailUrl() ? (
          <img 
            src={getThumbnailUrl()} 
            alt={course.title}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen className="h-12 w-12 text-blue-400" />
          </div>
        )}
        
        {/* Badges */}
        <div className="absolute top-2 right-2 flex flex-col gap-2">
          {isFree ? (
            <span className="px-2 py-1 bg-green-500 text-white text-xs font-semibold rounded shadow-sm">
              FREE
            </span>
          ) : (
            <span className="px-2 py-1 bg-blue-600 text-white text-xs font-semibold rounded shadow-sm">
              ${course.price || 0}
            </span>
          )}
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4">
        {/* Category */}
        {course.category && (
          <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded mb-2">
            {course.category.name}
          </span>
        )}
        
        {/* Title */}
        <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 text-sm">
          {course.title}
        </h3>
        
        {/* Description */}
        <p className="text-gray-600 text-xs mb-4 line-clamp-2">
          {course.description || 'No description available'}
        </p>
        
        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
          <div className="flex items-center space-x-3">
            <span className="flex items-center">
              <BookOpen className="w-3 h-3 mr-1" />
              {totalLessons}
            </span>
            <span className="flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              {formatDuration(course.totalDuration)}
            </span>
          </div>
          <span className="flex items-center">
            <Star className="w-3 h-3 text-yellow-500 mr-1 fill-yellow-500" />
            {(course.rating || 0).toFixed(1)}
          </span>
        </div>
        
        {/* Action Button */}
        <button
          onClick={onEnroll}
          disabled={isEnrolled}
          className={`w-full py-2 rounded-lg font-semibold text-white text-sm flex items-center justify-center transition-colors ${
            isEnrolled 
              ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800'
              : isFree
              ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
              : 'bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-black'
          }`}
        >
          {isEnrolled ? (
            <>
              <PlayCircle className="w-4 h-4 mr-2" />
              Continue Learning
            </>
          ) : (
            <>
              {isFree ? (
                <>
                  <Award className="w-4 h-4 mr-2" />
                  Enroll Free
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  Enroll Now
                </>
              )}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default CourseCard;