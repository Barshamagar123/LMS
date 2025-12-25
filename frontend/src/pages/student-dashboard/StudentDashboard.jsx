// import React, { useState, useEffect } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import {
//   BookOpen,
//   PlayCircle,
//   Clock,
//   Star,
//   Search,
//   Award,
//   ChevronRight,
//   UserCircle,
//   Menu,
//   X,
//   LogOut,
//   RefreshCw,
//   AlertCircle,
//   CheckCircle,
//   Bell
// } from 'lucide-react';
// import API from '../../api/axios';

// const StudentDashboard = () => {
//   const navigate = useNavigate();
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');
//   const [currentUser, setCurrentUser] = useState(null);
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
//   // Dashboard data
//   const [enrolledCourses, setEnrolledCourses] = useState([]);
//   const [recommendedCourses, setRecommendedCourses] = useState([]);
//   const [achievements, setAchievements] = useState([]);
//   const [continueLearning, setContinueLearning] = useState([]);
  
//   // Statistics
//   const [stats, setStats] = useState({
//     enrolledCourses: 0,
//     completedCourses: 0,
//     totalLearningHours: 0,
//     averageRating: 0,
//     streakDays: 7,
//     achievementCount: 0
//   });

//   // Get current user from API
//   useEffect(() => {
//     const fetchCurrentUser = async () => {
//       try {
//         const response = await API.get('/users/me');
//         setCurrentUser(response.data);
//         localStorage.setItem('user', JSON.stringify(response.data));
//       } catch (err) {
//         console.error('Error fetching user:', err);
//         // If no user, redirect to login
//         localStorage.removeItem('user');
//         localStorage.removeItem('token');
//         navigate('/login');
//       }
//     };
//     fetchCurrentUser();
//   }, [navigate]);

//   // Fetch student dashboard data
//   const fetchDashboardData = async () => {
//     try {
//       setLoading(true);
//       setError('');
//       setSuccess('');
      
//       // Check if user is logged in
//       const token = localStorage.getItem('token');
//       if (!token) {
//         setError('Please login first');
//         navigate('/login');
//         return;
//       }

//       console.log('Fetching student dashboard data...');
      
//       // 1. Fetch enrolled courses - CORRECTED ENDPOINT
//       const enrolledRes = await API.get('/enrollments/me');
//       console.log('Enrollments response:', enrolledRes);
      
//       let enrolledData = [];
//       if (enrolledRes.data && enrolledRes.data.success) {
//         enrolledData = enrolledRes.data.data || [];
//       } else {
//         enrolledData = enrolledRes.data || [];
//       }
      
//       console.log('Enrolled courses:', enrolledData);
//       setEnrolledCourses(enrolledData);
      
//       // Filter courses in progress for "Continue Learning"
//       const inProgressCourses = enrolledData.filter(course => 
//         (course.progress || 0) > 0 && (course.progress || 0) < 100
//       ).slice(0, 3);
//       setContinueLearning(inProgressCourses);
      
//       // Calculate statistics
//       const completedCourses = enrolledData.filter(course => (course.progress || 0) === 100);
//       const totalHours = enrolledData.reduce((sum, course) => sum + (course.duration || 0), 0);
//       const averageRating = enrolledData.length > 0 
//         ? enrolledData.reduce((sum, course) => sum + (course.rating || 0), 0) / enrolledData.length 
//         : 0;
      
//       setStats({
//         enrolledCourses: enrolledData.length,
//         completedCourses: completedCourses.length,
//         totalLearningHours: Math.round(totalHours / 60),
//         averageRating: averageRating.toFixed(1),
//         streakDays: enrolledData.reduce((max, course) => Math.max(max, course.streak || 0), 0) || 7,
//         achievementCount: completedCourses.length
//       });
      
//       // 2. Fetch recommended courses - CORRECTED ENDPOINT
//       try {
//         const recommendedRes = await API.get('/courses/recommended');
//         console.log('Recommended courses response:', recommendedRes);
        
//         let recommendedData = [];
//         if (recommendedRes.data && recommendedRes.data.success) {
//           recommendedData = recommendedRes.data.data || [];
//         } else {
//           recommendedData = recommendedRes.data || [];
//         }
        
//         setRecommendedCourses(recommendedData);
//       } catch (recError) {
//         console.warn('Could not fetch recommended courses:', recError);
//         // Generate mock recommendations if API fails
//         setRecommendedCourses([
//           { id: 1, title: 'Advanced JavaScript', instructor: 'John Doe', price: 49, rating: 4.7, category: 'Programming' },
//           { id: 2, title: 'UI/UX Design Fundamentals', instructor: 'Jane Smith', price: 39, rating: 4.5, category: 'Design' },
//           { id: 3, title: 'Data Science Bootcamp', instructor: 'Mike Johnson', price: 99, rating: 4.8, category: 'Data Science' }
//         ]);
//       }
      
//       // 3. Fetch user statistics - CORRECTED ENDPOINT
//       try {
//         const statsRes = await API.get('/users/me/stats');
//         console.log('User stats response:', statsRes);
        
//         if (statsRes.data && statsRes.data.success) {
//           setStats(prev => ({
//             ...prev,
//             ...statsRes.data.data
//           }));
//         }
//       } catch (statsError) {
//         console.warn('Could not fetch user stats:', statsError);
//       }
      
//       // 4. Fetch achievements - Check if this endpoint exists
//       try {
//         const achievementsRes = await API.get('/users/me/achievements');
//         console.log('Achievements response:', achievementsRes);
        
//         let achievementsData = [];
//         if (achievementsRes.data && achievementsRes.data.success) {
//           achievementsData = achievementsRes.data.data || [];
//         } else {
//           achievementsData = achievementsRes.data || [];
//         }
        
//         setAchievements(achievementsData);
//       } catch (achError) {
//         console.warn('Could not fetch achievements:', achError);
//         // Default achievements
//         const defaultAchievements = [
//           { id: 1, title: 'First Course Completed', icon: '🎓', unlocked: completedCourses.length >= 1, date: null },
//           { id: 2, title: '3-Day Streak', icon: '🔥', unlocked: true, date: new Date().toISOString() },
//           { id: 3, title: 'Perfect Progress', icon: '⭐', unlocked: false, date: null },
//           { id: 4, title: 'Course Explorer', icon: '🧭', unlocked: enrolledData.length >= 3, date: null }
//         ];
//         setAchievements(defaultAchievements);
//       }
      
//     } catch (error) {
//       console.error('Error fetching dashboard data:', error);
//       handleFetchError(error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Handle API errors
//   const handleFetchError = (error) => {
//     if (error.response) {
//       if (error.response.status === 401) {
//         setError('Session expired. Please login again.');
//         localStorage.removeItem('user');
//         localStorage.removeItem('token');
//         navigate('/login');
//       } else if (error.response.status === 403) {
//         setError('You do not have permission to access student dashboard.');
//       } else if (error.response.status === 404) {
//         // If enrollments endpoint returns 404, user has no enrollments yet
//         if (error.config.url.includes('/enrollments/me')) {
//           setEnrolledCourses([]);
//           setContinueLearning([]);
//           setError('');
//         } else {
//           setError(`Resource not found: ${error.response.data?.message || 'Please try again later.'}`);
//         }
//       } else {
//         setError(`Server error: ${error.response.status} - ${error.response.data?.message || 'Unknown error'}`);
//       }
//     } else if (error.request) {
//       setError('Cannot connect to server. Please check your network connection.');
//     } else {
//       setError(`Request error: ${error.message}`);
//     }
//   };

//   useEffect(() => {
//     fetchDashboardData();
//   }, []);

//   // Handle course enrollment - CORRECTED ENDPOINT
//   const handleEnrollCourse = async (courseId) => {
//     try {
//       setError('');
//       setSuccess('');
      
//       const response = await API.post('/enrollments/free', {
//         courseId: courseId
//       });
      
//       if (response.data.success) {
//         setSuccess('Successfully enrolled in the course!');
        
//         // Refresh dashboard data
//         setTimeout(() => {
//           fetchDashboardData();
//         }, 1500);
        
//         // Clear success message after 3 seconds
//         setTimeout(() => setSuccess(''), 3000);
//       } else {
//         setError(response.data.message || 'Failed to enroll in course.');
//       }
      
//     } catch (error) {
//       console.error('Error enrolling in course:', error);
      
//       if (error.response) {
//         if (error.response.status === 409) {
//           setError('You are already enrolled in this course.');
//         } else if (error.response.status === 400) {
//           setError(error.response.data.message || 'Invalid request. Please check course details.');
//         } else {
//           setError(error.response.data?.message || 'Failed to enroll in course. Please try again.');
//         }
//       } else if (error.request) {
//         setError('Cannot connect to server. Please check your network connection.');
//       } else {
//         setError(`Request error: ${error.message}`);
//       }
//     }
//   };

//   // Handle logout
//   const handleLogout = () => {
//     localStorage.removeItem('user');
//     localStorage.removeItem('token');
//     navigate('/login');
//   };

//   // Format date
//   const formatDate = (dateString) => {
//     if (!dateString) return 'N/A';
//     try {
//       const date = new Date(dateString);
//       return date.toLocaleDateString('en-US', {
//         month: 'short',
//         day: 'numeric'
//       });
//     } catch (error) {
//       return 'Invalid date';
//     }
//   };

//   // Format time
//   const formatTime = (minutes) => {
//     if (!minutes) return '0h';
//     const hours = Math.floor(minutes / 60);
//     const mins = minutes % 60;
//     return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-linear-to-br from-gray-50 to-blue-50 flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
//           <p className="text-gray-600">Loading your learning dashboard...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-linear-to-br from-gray-50 to-blue-50">
//       {/* Header/Navbar */}
//       <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex items-center justify-between h-16">
//             {/* Logo/Left side */}
//             <div className="flex items-center">
//               <button
//                 onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
//                 className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 mr-2"
//               >
//                 {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
//               </button>
//               <div className="flex items-center">
//                 <BookOpen className="h-8 w-8 text-blue-600" />
//                 <div className="ml-3">
//                   <h1 className="text-xl font-bold text-gray-900">Student Dashboard</h1>
//                   <p className="text-xs text-gray-600">Welcome, {currentUser?.name || 'Student'}!</p>
//                 </div>
//               </div>
//             </div>

//             {/* Desktop Navigation */}
//             <div className="hidden lg:flex items-center space-x-4">
//               <button
//                 onClick={fetchDashboardData}
//                 className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
//               >
//                 <RefreshCw className="w-4 h-4" />
//                 Refresh
//               </button>
              
//               <Link
//                 to="/courses"
//                 className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
//               >
//                 <BookOpen className="w-4 h-4" />
//                 Browse Courses
//               </Link>
              
//               {/* Profile Dropdown */}
//               <div className="relative group">
//                 <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors">
//                   <div className="w-8 h-8 bg-linear-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center text-white font-semibold">
//                     {currentUser?.name?.charAt(0) || 'S'}
//                   </div>
//                   <div className="text-left hidden md:block">
//                     <p className="text-sm font-medium text-gray-900">{currentUser?.name || 'Student'}</p>
//                     <p className="text-xs text-gray-500">{stats.enrolledCourses} courses enrolled</p>
//                   </div>
//                   <ChevronRight className="w-4 h-4 text-gray-400 group-hover:rotate-90 transition-transform" />
//                 </button>
                
//                 {/* Dropdown Menu */}
//                 <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
//                   <Link
//                     to="/student/profile"
//                     className="flex items-center gap-2 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
//                   >
//                     <UserCircle className="w-4 h-4" />
//                     My Profile
//                   </Link>
//                   <div className="border-t border-gray-200 my-1"></div>
//                   <button
//                     onClick={handleLogout}
//                     className="flex items-center gap-2 w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 transition-colors"
//                   >
//                     <LogOut className="w-4 h-4" />
//                     Logout
//                   </button>
//                 </div>
//               </div>
//             </div>

//             {/* Mobile menu button */}
//             <div className="lg:hidden flex items-center gap-2">
//               <Link
//                 to="/courses"
//                 className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
//               >
//                 <BookOpen className="w-4 h-4" />
//                 <span>Browse</span>
//               </Link>
//             </div>
//           </div>

//           {/* Mobile Navigation Menu */}
//           {mobileMenuOpen && (
//             <div className="lg:hidden border-t border-gray-200 py-4">
//               <div className="space-y-2">
//                 <button
//                   onClick={fetchDashboardData}
//                   className="flex items-center gap-3 w-full px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
//                 >
//                   <RefreshCw className="w-5 h-5" />
//                   Refresh Dashboard
//                 </button>
//                 <Link
//                   to="/courses"
//                   className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
//                   onClick={() => setMobileMenuOpen(false)}
//                 >
//                   <BookOpen className="w-5 h-5" />
//                   Browse All Courses
//                 </Link>
//                 <Link
//                   to="/student/profile"
//                   className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
//                   onClick={() => setMobileMenuOpen(false)}
//                 >
//                   <UserCircle className="w-5 h-5" />
//                   My Profile
//                 </Link>
//                 <button
//                   onClick={handleLogout}
//                   className="flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
//                 >
//                   <LogOut className="w-5 h-5" />
//                   Logout
//                 </button>
//               </div>
              
//               {/* User Info in Mobile Menu */}
//               <div className="mt-4 pt-4 border-t border-gray-200 px-4">
//                 <div className="flex items-center gap-3">
//                   <div className="w-10 h-10 bg-linear-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center text-white font-semibold">
//                     {currentUser?.name?.charAt(0) || 'S'}
//                   </div>
//                   <div>
//                     <p className="font-medium text-gray-900">{currentUser?.name || 'Student'}</p>
//                     <p className="text-sm text-gray-500">{stats.enrolledCourses} courses enrolled</p>
//                     <p className="text-xs text-green-600 mt-1">
//                       {stats.completedCourses} completed • {stats.enrolledCourses - stats.completedCourses} in progress
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       </header>

//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         {/* Success Messages */}
//         {success && (
//           <div className="mb-6 bg-green-50 border-green-200 rounded-xl p-4 flex items-start gap-3">
//             <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
//             <div>
//               <p className="text-green-700 font-medium">{success}</p>
//             </div>
//           </div>
//         )}

//         {/* Error Messages */}
//         {error && (
//           <div className="mb-6 bg-red-50 border-red-200 rounded-xl p-4 flex items-start gap-3">
//             <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
//             <div>
//               <p className="text-red-700 font-medium">{error}</p>
//             </div>
//           </div>
//         )}

//         {/* Quick Stats */}
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
//           <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-gray-600 text-sm">Enrolled Courses</p>
//                 <p className="text-2xl font-bold text-gray-900 mt-1">{stats.enrolledCourses}</p>
//               </div>
//               <div className="bg-blue-100 p-2 rounded-lg">
//                 <BookOpen className="w-5 h-5 text-blue-600" />
//               </div>
//             </div>
//           </div>

//           <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-gray-600 text-sm">Completed</p>
//                 <p className="text-2xl font-bold text-gray-900 mt-1">{stats.completedCourses}</p>
//               </div>
//               <div className="bg-green-100 p-2 rounded-lg">
//                 <CheckCircle className="w-5 h-5 text-green-600" />
//               </div>
//             </div>
//           </div>

//           <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-gray-600 text-sm">Learning Hours</p>
//                 <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalLearningHours}h</p>
//               </div>
//               <div className="bg-purple-100 p-2 rounded-lg">
//                 <Clock className="w-5 h-5 text-purple-600" />
//               </div>
//             </div>
//           </div>

//           <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-gray-600 text-sm">Achievements</p>
//                 <p className="text-2xl font-bold text-gray-900 mt-1">{stats.achievementCount}</p>
//               </div>
//               <div className="bg-yellow-100 p-2 rounded-lg">
//                 <Award className="w-5 h-5 text-yellow-600" />
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Main Content Grid */}
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//           {/* Left Column - Main Content */}
//           <div className="lg:col-span-2 space-y-8">
//             {/* Continue Learning Section */}
//             {continueLearning.length > 0 && (
//               <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
//                 <div className="flex items-center justify-between mb-6">
//                   <div>
//                     <h2 className="text-xl font-bold text-gray-900">Continue Learning</h2>
//                     <p className="text-gray-600 text-sm mt-1">Pick up where you left off</p>
//                   </div>
//                   <Link 
//                     to="/courses?filter=in-progress" 
//                     className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
//                   >
//                     View All <ChevronRight className="w-4 h-4" />
//                   </Link>
//                 </div>
                
//                 <div className="space-y-4">
//                   {continueLearning.map((course) => (
//                     <div key={course.id || course._id} className="bg-gray-50 rounded-xl border border-gray-200 p-4 hover:border-blue-300 transition-colors">
//                       <div className="flex items-start gap-4">
//                         <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
//                           <BookOpen className="w-8 h-8 text-blue-600" />
//                         </div>
//                         <div className="flex-1">
//                           <div className="flex justify-between items-start mb-2">
//                             <div>
//                               <h3 className="font-semibold text-gray-900">{course.title || 'Untitled Course'}</h3>
//                               <p className="text-sm text-gray-600">{course.instructor || 'Unknown Instructor'}</p>
//                             </div>
//                             <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
//                               {course.progress || 0}% Complete
//                             </span>
//                           </div>
                          
//                           {/* Progress Bar */}
//                           <div className="mb-3">
//                             <div className="w-full bg-gray-200 rounded-full h-2">
//                               <div 
//                                 className="bg-blue-600 h-2 rounded-full"
//                                 style={{ width: `${course.progress || 0}%` }}
//                               ></div>
//                             </div>
//                           </div>
                          
//                           <div className="flex items-center justify-between">
//                             <div className="flex items-center gap-4 text-sm text-gray-500">
//                               <div className="flex items-center gap-1">
//                                 <Clock className="w-4 h-4" />
//                                 <span>{formatTime(course.duration || 0)} remaining</span>
//                               </div>
//                               <div className="flex items-center gap-1">
//                                 <Star className="w-4 h-4 text-yellow-500" />
//                                 <span>{course.rating || 'N/A'}</span>
//                               </div>
//                             </div>
//                             <Link
//                               to={`/courses/${course.id || course._id}/learn?enrollment=${course.enrollmentId}`}
//                               className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
//                             >
//                               <PlayCircle className="w-4 h-4" />
//                               Continue
//                             </Link>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}

//             {/* Enrolled Courses Grid */}
//             <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
//               <div className="flex items-center justify-between mb-6">
//                 <div>
//                   <h2 className="text-xl font-bold text-gray-900">My Courses ({enrolledCourses.length})</h2>
//                   <p className="text-gray-600 text-sm mt-1">All your enrolled courses</p>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <div className="relative">
//                     <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
//                     <input
//                       type="text"
//                       placeholder="Search courses..."
//                       className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                     />
//                   </div>
//                 </div>
//               </div>

//               {/* Course Grid */}
//               {enrolledCourses.length === 0 ? (
//                 <div className="py-12 text-center">
//                   <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
//                   <h3 className="text-lg font-semibold text-gray-900 mb-2">No courses enrolled yet</h3>
//                   <p className="text-gray-600 mb-6 max-w-md mx-auto">
//                     Start your learning journey by enrolling in courses from our catalog!
//                   </p>
//                   <Link
//                     to="/courses"
//                     className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg font-medium"
//                   >
//                     <BookOpen className="w-5 h-5" />
//                     Browse Courses
//                   </Link>
//                 </div>
//               ) : (
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   {enrolledCourses.map((course) => (
//                     <div key={course.id || course._id} className="border border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-colors">
//                       <div className="flex items-start justify-between mb-3">
//                         <div className="flex items-center gap-3">
//                           <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
//                             <BookOpen className="w-6 h-6 text-blue-600" />
//                           </div>
//                           <div>
//                             <h3 className="font-semibold text-gray-900 line-clamp-1">{course.title || 'Untitled Course'}</h3>
//                             <p className="text-sm text-gray-600">{course.instructor || 'Unknown Instructor'}</p>
//                           </div>
//                         </div>
//                         <span className={`px-2 py-1 rounded text-xs font-medium ${
//                           course.progress === 100 
//                             ? 'bg-green-100 text-green-800' 
//                             : course.progress > 0 
//                               ? 'bg-blue-100 text-blue-800' 
//                               : 'bg-gray-100 text-gray-800'
//                         }`}>
//                           {course.progress === 100 ? 'Completed' : `${course.progress || 0}%`}
//                         </span>
//                       </div>
                      
//                       {/* Progress Bar */}
//                       <div className="mb-4">
//                         <div className="w-full bg-gray-200 rounded-full h-2">
//                           <div 
//                             className={`h-2 rounded-full ${
//                               course.progress === 100 ? 'bg-green-500' :
//                               course.progress >= 50 ? 'bg-blue-500' :
//                               'bg-yellow-500'
//                             }`}
//                             style={{ width: `${course.progress || 0}%` }}
//                           ></div>
//                         </div>
//                       </div>
                      
//                       <div className="flex items-center justify-between">
//                         <div className="text-sm text-gray-600">
//                           <div className="flex items-center gap-2">
//                             <div className="flex items-center gap-1">
//                               <Clock className="w-4 h-4" />
//                               <span>{formatTime(course.duration || 0)}</span>
//                             </div>
//                             <div className="flex items-center gap-1">
//                               <Star className="w-4 h-4 text-yellow-500" />
//                               <span>{course.rating || 'N/A'}</span>
//                             </div>
//                           </div>
//                         </div>
//                         <Link
//                           to={`/courses/${course.id || course._id}/learn?enrollment=${course.enrollmentId}`}
//                           className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
//                         >
//                           {course.progress === 100 ? 'Review' : 'Continue'} <ChevronRight className="w-4 h-4" />
//                         </Link>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Right Column - Sidebar */}
//           <div className="space-y-6">
//             {/* Course Recommendations */}
//             <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
//               <div className="flex items-center justify-between mb-4">
//                 <h3 className="text-lg font-semibold text-gray-900">Recommended Courses</h3>
//                 <Link 
//                   to="/courses" 
//                   className="text-blue-600 hover:text-blue-800 text-sm"
//                 >
//                   View All
//                 </Link>
//               </div>
              
//               <div className="space-y-4">
//                 {recommendedCourses.slice(0, 3).map((course) => (
//                   <div key={course.id || course._id} className="border border-gray-200 rounded-lg p-3 hover:border-blue-300 transition-colors">
//                     <div className="flex items-start gap-3">
//                       <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
//                         <BookOpen className="w-5 h-5 text-green-600" />
//                       </div>
//                       <div className="flex-1">
//                         <h4 className="font-medium text-gray-900 text-sm">{course.title}</h4>
//                         <p className="text-xs text-gray-600">{course.instructor}</p>
//                         <div className="flex items-center justify-between mt-2">
//                           <div className="flex items-center gap-2">
//                             <span className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-800 rounded">
//                               {course.category || 'General'}
//                             </span>
//                             <span className="text-xs text-gray-600 flex items-center gap-1">
//                               <Star className="w-3 h-3 text-yellow-500" />
//                               {course.rating}
//                             </span>
//                           </div>
//                           <span className="text-xs font-medium text-gray-900">
//                             {course.price === 0 ? 'Free' : `$${course.price}`}
//                           </span>
//                         </div>
//                       </div>
//                     </div>
//                     <button
//                       onClick={() => handleEnrollCourse(course.id || course._id)}
//                       className="w-full mt-3 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
//                     >
//                       Enroll Now
//                     </button>
//                   </div>
//                 ))}
//               </div>
              
//               <div className="mt-4 pt-4 border-t border-gray-200">
//                 <Link
//                   to="/courses"
//                   className="flex items-center justify-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
//                 >
//                   <BookOpen className="w-4 h-4" />
//                   Browse All Courses
//                 </Link>
//               </div>
//             </div>

//             {/* Achievement Badges */}
//             <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
//               <h3 className="text-lg font-semibold text-gray-900 mb-4">Achievement Badges</h3>
              
//               <div className="grid grid-cols-3 gap-3">
//                 {achievements.slice(0, 6).map((achievement) => (
//                   <div 
//                     key={achievement.id} 
//                     className={`p-3 rounded-xl border text-center ${achievement.unlocked ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-200 opacity-50'}`}
//                   >
//                     <div className="text-2xl mb-1">{achievement.icon || '🏆'}</div>
//                     <p className="text-xs font-medium text-gray-900">{achievement.title}</p>
//                     {achievement.unlocked && achievement.date && (
//                       <p className="text-xs text-gray-500 mt-1">{formatDate(achievement.date)}</p>
//                     )}
//                   </div>
//                 ))}
//               </div>
              
//               <div className="mt-4 pt-4 border-t border-gray-200">
//                 <div className="flex items-center justify-between">
//                   <span className="text-sm text-gray-600">
//                     {achievements.filter(a => a.unlocked).length} of {achievements.length} unlocked
//                   </span>
//                   <Link
//                     to="/student/achievements"
//                     className="text-blue-600 hover:text-blue-800 text-sm font-medium"
//                   >
//                     View All
//                   </Link>
//                 </div>
//               </div>
//             </div>

//             {/* Learning Goals */}
//             <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
//               <h3 className="text-lg font-semibold text-gray-900 mb-4">Learning Goals</h3>
              
//               <div className="space-y-4">
//                 <div>
//                   <div className="flex items-center justify-between mb-1">
//                     <span className="text-sm text-gray-700">Complete 5 courses</span>
//                     <span className="text-sm font-medium text-gray-900">{stats.completedCourses}/5</span>
//                   </div>
//                   <div className="w-full bg-gray-200 rounded-full h-2">
//                     <div 
//                       className="h-2 rounded-full bg-green-500"
//                       style={{ width: `${(stats.completedCourses / 5) * 100}%` }}
//                     ></div>
//                   </div>
//                 </div>
                
//                 <div>
//                   <div className="flex items-center justify-between mb-1">
//                     <span className="text-sm text-gray-700">30-day learning streak</span>
//                     <span className="text-sm font-medium text-gray-900">{stats.streakDays}/30 days</span>
//                   </div>
//                   <div className="w-full bg-gray-200 rounded-full h-2">
//                     <div 
//                       className="h-2 rounded-full bg-blue-500"
//                       style={{ width: `${(stats.streakDays / 30) * 100}%` }}
//                     ></div>
//                   </div>
//                 </div>
                
//                 <div>
//                   <div className="flex items-center justify-between mb-1">
//                     <span className="text-sm text-gray-700">10 learning hours</span>
//                     <span className="text-sm font-medium text-gray-900">{stats.totalLearningHours}/10h</span>
//                   </div>
//                   <div className="w-full bg-gray-200 rounded-full h-2">
//                     <div 
//                       className="h-2 rounded-full bg-purple-500"
//                       style={{ width: `${(stats.totalLearningHours / 10) * 100}%` }}
//                     ></div>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Quick Actions */}
//             <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
//               <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
//               <div className="space-y-2">
//                 <Link
//                   to="/courses"
//                   className="flex items-center gap-3 p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
//                 >
//                   <BookOpen className="w-5 h-5 text-blue-600" />
//                   <div>
//                     <p className="font-medium">Browse Course Catalog</p>
//                     <p className="text-sm text-gray-500">Explore all available courses</p>
//                   </div>
//                 </Link>
//                 <Link
//                   to="/student/certificates"
//                   className="flex items-center gap-3 p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
//                 >
//                   <Award className="w-5 h-5 text-yellow-600" />
//                   <div>
//                     <p className="font-medium">View Certificates</p>
//                     <p className="text-sm text-gray-500">{stats.completedCourses} certificates earned</p>
//                   </div>
//                 </Link>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default StudentDashboard;