import React, { useState } from 'react';
import { Play, Users, Star, Clock, BookOpen, CheckCircle } from 'lucide-react';

const CourseCard = () => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Static course data - student focused
  const course = {
    id: 1,
    title: "Web Development Masterclass",
    description: "Learn React, Node.js, and build real projects",
    price: 89.99,
    originalPrice: 129.99,
    rating: 4.8,
    totalReviews: 1247,
    category: "Development",
    enrollments: 12450,
    duration: "28h",
    lessons: 24,
    instructor: "Sarah Johnson",
    features: ["Certificate", "Lifetime Access", "Projects"]
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const calculateDiscount = () => {
    const discount = ((course.originalPrice - course.price) / course.originalPrice) * 100;
    return Math.round(discount);
  };

  return (
    <div 
      className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 overflow-hidden group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Video Preview Section */}
      <div className="relative h-40 bg-linear-to-br from-blue-500 to-purple-600 overflow-hidden">
        {/* Video Thumbnail */}
        <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center transition-opacity duration-300 group-hover:bg-opacity-10">
          <div className={`transform transition-all duration-300 ${isHovered ? 'scale-110' : 'scale-100'}`}>
            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-full p-3 border border-white border-opacity-30">
              <Play className="w-6 h-6 text-white ml-0.5" fill="white" />
            </div>
          </div>
        </div>
        
        {/* Discount Badge */}
        {course.originalPrice > course.price && (
          <div className="absolute top-3 left-3">
            <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
              {calculateDiscount()}% OFF
            </span>
          </div>
        )}

        {/* Quick Stats */}
        <div className="absolute bottom-3 left-3 right-3 flex justify-between">
          <div className="flex items-center gap-1 text-white text-xs bg-black bg-opacity-50 backdrop-blur-sm rounded px-2 py-1">
            <Users className="w-3 h-3" />
            <span>{(course.enrollments / 1000).toFixed(1)}k</span>
          </div>
          <div className="flex items-center gap-1 text-white text-xs bg-black bg-opacity-50 backdrop-blur-sm rounded px-2 py-1">
            <Clock className="w-3 h-3" />
            <span>{course.duration}</span>
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="p-4">
        {/* Category */}
        <div className="mb-2">
          <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">
            {course.category}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-tight mb-2 group-hover:text-blue-600 transition-colors">
          {course.title}
        </h3>

        {/* Description */}
        <p className="text-xs text-gray-600 line-clamp-2 mb-3 leading-relaxed">
          {course.description}
        </p>

        {/* Instructor */}
        <div className="flex items-center mb-3">
          <div className="w-6 h-6 bg-linear-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-2">
            <span className="text-white text-xs font-semibold">
              {course.instructor.charAt(0)}
            </span>
          </div>
          <span className="text-xs text-gray-600 truncate">{course.instructor}</span>
        </div>

        {/* Key Features */}
        <div className="flex flex-wrap gap-1 mb-3">
          {course.features.slice(0, 2).map((feature, index) => (
            <span 
              key={index}
              className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-md"
            >
              <CheckCircle className="w-3 h-3 text-green-500" />
              {feature}
            </span>
          ))}
          {course.features.length > 2 && (
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
              +{course.features.length - 2} more
            </span>
          )}
        </div>

        {/* Rating and Lessons */}
        <div className="flex items-center justify-between mb-3 text-xs">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-yellow-500 fill-current" />
              <span className="font-semibold text-gray-900">{course.rating}</span>
              <span className="text-gray-500">({(course.totalReviews / 1000).toFixed(1)}k)</span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-gray-600">
            <BookOpen className="w-3 h-3" />
            <span>{course.lessons} lessons</span>
          </div>
        </div>

        {/* Price and Enroll Button */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-gray-900">
              {course.price === 0 ? 'Free' : formatPrice(course.price)}
            </span>
            {course.originalPrice > course.price && (
              <span className="text-sm text-gray-500 line-through">
                {formatPrice(course.originalPrice)}
              </span>
            )}
          </div>
          <button 
            className={`
              px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
              ${isHovered 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'bg-blue-500 text-white hover:bg-blue-600'
              }
            `}
          >
            Enroll Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;