// // components/InstructorList.jsx
// import React, { useState, useEffect } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import API from '../api/axios';
// import {
//   Users, Star, GraduationCap, BookOpen, Search, Filter,
//   ExternalLink, ArrowRight, Award, Briefcase, MapPin,
//   TrendingUp, Sparkles, Loader2
// } from 'lucide-react';

// const InstructorList = () => {
//   const [instructors, setInstructors] = useState([]);
//   const [filteredInstructors, setFilteredInstructors] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [sortBy, setSortBy] = useState('rating');
//   const [selectedExpertise, setSelectedExpertise] = useState('all');
//   const navigate = useNavigate();

//   useEffect(() => {
//     fetchInstructors();
//   }, []);

//   useEffect(() => {
//     filterAndSortInstructors();
//   }, [instructors, searchTerm, sortBy, selectedExpertise]);

//   const fetchInstructors = async () => {
//     try {
//       setLoading(true);
//       const response = await API.get('/instructor/list'); // You'll need to create this endpoint
//       setInstructors(response.data);
//     } catch (error) {
//       console.error('Error fetching instructors:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const filterAndSortInstructors = () => {
//     let filtered = [...instructors];

//     // Search filter
//     if (searchTerm) {
//       const term = searchTerm.toLowerCase();
//       filtered = filtered.filter(instructor =>
//         instructor.name.toLowerCase().includes(term) ||
//         instructor.title?.toLowerCase().includes(term) ||
//         instructor.company?.toLowerCase().includes(term)
//       );
//     }

//     // Expertise filter
//     if (selectedExpertise !== 'all') {
//       filtered = filtered.filter(instructor => 
//         instructor.title?.toLowerCase().includes(selectedExpertise) ||
//         instructor.expertise?.some(exp => exp.toLowerCase().includes(selectedExpertise))
//       );
//     }

//     // Sorting
//     filtered.sort((a, b) => {
//       switch (sortBy) {
//         case 'rating':
//           return (b.stats?.averageRating || 0) - (a.stats?.averageRating || 0);
//         case 'students':
//           return (b.stats?.totalStudents || 0) - (a.stats?.totalStudents || 0);
//         case 'courses':
//           return (b._count?.courses || 0) - (a._count?.courses || 0);
//         case 'experience':
//           return (b.experience || 0) - (a.experience || 0);
//         default:
//           return 0;
//       }
//     });

//     setFilteredInstructors(filtered);
//   };

//   const getExpertiseTags = () => {
//     const allTags = new Set();
//     instructors.forEach(instructor => {
//       if (instructor.title) allTags.add(instructor.title.toLowerCase());
//       if (instructor.expertise) {
//         instructor.expertise.forEach(tag => allTags.add(tag.toLowerCase()));
//       }
//     });
//     return Array.from(allTags).slice(0, 10);
//   };

//   const expertiseTags = getExpertiseTags();

//   const getImageUrl = (imagePath) => {
//     if (!imagePath) return null;
//     if (imagePath.startsWith('http')) return imagePath;
    
//     // Adjust based on your backend
//     const STATIC_BASE_URL = API.defaults.baseURL?.replace('/api', '') || 'http://localhost:3000';
//     let fixedPath = imagePath;
//     if (!fixedPath.startsWith('/uploads/')) {
//       fixedPath = `/uploads/${fixedPath}`;
//     }
//     return `${STATIC_BASE_URL}${fixedPath}`;
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center">
//           <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
//           <p className="text-gray-600">Loading instructors...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Hero Section */}
//       <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
//           <div className="max-w-3xl">
//             <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
//               <Sparkles className="w-4 h-4" />
//               <span className="text-sm font-medium">Learn from Industry Experts</span>
//             </div>
            
//             <h1 className="text-4xl md:text-5xl font-bold mb-6">
//               Meet Our Expert Instructors
//             </h1>
            
//             <p className="text-xl text-blue-100 mb-8">
//               Learn from experienced professionals who bring real-world knowledge to their teaching.
//               Find the perfect mentor for your learning journey.
//             </p>
            
//             <div className="flex items-center gap-4 text-sm">
//               <div className="flex items-center gap-2">
//                 <Users className="w-5 h-5" />
//                 <span>{instructors.length}+ Expert Instructors</span>
//               </div>
//               <div className="flex items-center gap-2">
//                 <TrendingUp className="w-5 h-5" />
//                 <span>97% Satisfaction Rate</span>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
//         {/* Filters Bar */}
//         <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
//           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//             {/* Search */}
//             <div className="relative">
//               <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//               <input
//                 type="text"
//                 placeholder="Search by name, title, or company..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
//               />
//             </div>

//             {/* Sort */}
//             <div>
//               <select
//                 value={sortBy}
//                 onChange={(e) => setSortBy(e.target.value)}
//                 className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
//               >
//                 <option value="rating">Sort by: Highest Rated</option>
//                 <option value="students">Sort by: Most Students</option>
//                 <option value="courses">Sort by: Most Courses</option>
//                 <option value="experience">Sort by: Experience</option>
//               </select>
//             </div>

//             {/* Expertise Filter */}
//             <div>
//               <select
//                 value={selectedExpertise}
//                 onChange={(e) => setSelectedExpertise(e.target.value)}
//                 className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
//               >
//                 <option value="all">All Expertise Areas</option>
//                 {expertiseTags.map((tag, index) => (
//                   <option key={index} value={tag}>
//                     {tag.charAt(0).toUpperCase() + tag.slice(1)}
//                   </option>
//                 ))}
//               </select>
//             </div>
//           </div>

//           {/* Quick Filter Chips */}
//           <div className="flex flex-wrap gap-2 mt-6">
//             <button
//               onClick={() => setSelectedExpertise('all')}
//               className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
//                 selectedExpertise === 'all'
//                   ? 'bg-blue-600 text-white'
//                   : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//               }`}
//             >
//               All Instructors
//             </button>
//             {expertiseTags.slice(0, 5).map((tag, index) => (
//               <button
//                 key={index}
//                 onClick={() => setSelectedExpertise(tag)}
//                 className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
//                   selectedExpertise === tag
//                     ? 'bg-blue-600 text-white'
//                     : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//                 }`}
//               >
//                 {tag.charAt(0).toUpperCase() + tag.slice(1)}
//               </button>
//             ))}
//           </div>
//         </div>

//         {/* Results Count */}
//         <div className="flex items-center justify-between mb-6">
//           <div className="text-gray-600">
//             Showing {filteredInstructors.length} of {instructors.length} instructors
//           </div>
//           <div className="flex items-center gap-2 text-sm text-gray-600">
//             <Filter className="w-4 h-4" />
//             <span>Sorted by {sortBy}</span>
//           </div>
//         </div>

//         {/* Instructors Grid */}
//         {filteredInstructors.length === 0 ? (
//           <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
//             <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
//             <h3 className="text-xl font-semibold text-gray-700 mb-2">No instructors found</h3>
//             <p className="text-gray-500">Try adjusting your search or filter criteria</p>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {filteredInstructors.map((instructor) => (
//               <div
//                 key={instructor.id}
//                 className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group cursor-pointer"
//                 onClick={() => navigate(`/instructor/${instructor.id}`)}
//               >
//                 {/* Instructor Header */}
//                 <div className="p-8 pb-0">
//                   <div className="flex items-start justify-between mb-6">
//                     {/* Avatar */}
//                     <div className="relative">
//                       <div className="w-20 h-20 rounded-2xl overflow-hidden border-4 border-white shadow-lg">
//                         {getImageUrl(instructor.profilePicture) ? (
//                           <img
//                             src={getImageUrl(instructor.profilePicture)}
//                             alt={instructor.name}
//                             className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
//                           />
//                         ) : (
//                           <div className="w-full h-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
//                             <Users className="w-8 h-8 text-blue-600" />
//                           </div>
//                         )}
//                       </div>
//                       {instructor.stats?.averageRating >= 4.5 && (
//                         <div className="absolute -top-2 -right-2 bg-yellow-400 text-white p-1 rounded-full">
//                           <Star className="w-3 h-3 fill-current" />
//                         </div>
//                       )}
//                     </div>

//                     {/* Stats */}
//                     <div className="text-right">
//                       <div className="flex items-center gap-2 text-sm text-gray-500">
//                         <Star className="w-4 h-4 text-yellow-500 fill-current" />
//                         <span className="font-bold text-gray-900">
//                           {instructor.stats?.averageRating?.toFixed(1) || 'N/A'}
//                         </span>
//                         <span className="text-gray-400">({instructor.stats?.totalStudents || 0})</span>
//                       </div>
//                       <div className="text-xs text-gray-500 mt-1">
//                         {instructor._count?.courses || 0} courses
//                       </div>
//                     </div>
//                   </div>

//                   {/* Name & Title */}
//                   <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
//                     {instructor.name}
//                   </h3>
//                   <div className="flex items-center gap-2 text-gray-600 mb-3">
//                     <Briefcase className="w-4 h-4" />
//                     <span className="text-sm">{instructor.title || 'Professional Instructor'}</span>
//                   </div>

//                   {/* Company & Location */}
//                   {(instructor.company || instructor.location) && (
//                     <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
//                       {instructor.company && (
//                         <span className="inline-flex items-center gap-1">
//                           <Briefcase className="w-3 h-3" />
//                           {instructor.company}
//                         </span>
//                       )}
//                       {instructor.location && (
//                         <span className="inline-flex items-center gap-1">
//                           <MapPin className="w-3 h-3" />
//                           {instructor.location}
//                         </span>
//                       )}
//                     </div>
//                   )}

//                   {/* Bio Excerpt */}
//                   <p className="text-gray-600 text-sm line-clamp-3 mb-6">
//                     {instructor.bio?.substring(0, 120) || 'Experienced instructor passionate about sharing knowledge...'}
//                     {instructor.bio?.length > 120 && '...'}
//                   </p>
//                 </div>

//                 {/* Footer */}
//                 <div className="px-8 py-6 bg-gray-50 border-t border-gray-100">
//                   <div className="flex items-center justify-between">
//                     <div className="flex items-center gap-4">
//                       <div className="flex items-center gap-2 text-sm text-gray-600">
//                         <GraduationCap className="w-4 h-4" />
//                         <span>{instructor.stats?.totalStudents || 0} students</span>
//                       </div>
//                       {instructor.experience && (
//                         <div className="flex items-center gap-2 text-sm text-gray-600">
//                           <Award className="w-4 h-4" />
//                           <span>{instructor.experience}+ yrs</span>
//                         </div>
//                       )}
//                     </div>
                    
//                     <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm">
//                       View Profile
//                       <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}

//         {/* CTA Section */}
//         {filteredInstructors.length > 0 && (
//           <div className="mt-12 mb-8 text-center">
//             <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100">
//               <h3 className="text-2xl font-bold text-gray-900 mb-4">
//                 Ready to Learn from the Best?
//               </h3>
//               <p className="text-gray-600 max-w-2xl mx-auto mb-6">
//                 Browse through our instructors' courses and start your learning journey today.
//               </p>
//               <Link
//                 to="/courses"
//                 className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-lg hover:shadow-xl"
//               >
//                 <BookOpen className="w-5 h-5" />
//                 Browse All Courses
//               </Link>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default InstructorList;