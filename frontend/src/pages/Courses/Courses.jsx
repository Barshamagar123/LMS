import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Star,
  Users,
  Clock,
  BookOpen,
  Award,
  Eye,
  Lock,
  AlertCircle,
  PlayCircle,
  CheckCircle,
  Loader2,
  Info,
  Search,
  Filter,
  ChevronDown,
  X,
  Heart,
  TrendingUp,
  Zap
} from 'lucide-react';
import API from '../../api/axios';

const CoursesPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // State
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [enrollingCourseId, setEnrollingCourseId] = useState(null);
  const [failedImages, setFailedImages] = useState(new Set());
  const [myEnrollments, setMyEnrollments] = useState([]);
  const [loadingEnrollments, setLoadingEnrollments] = useState(false);
  const [courseStats, setCourseStats] = useState({});
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedPrice, setSelectedPrice] = useState('');
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('popular');
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [wishlist, setWishlist] = useState([]);
  const [loadingWishlist, setLoadingWishlist] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCourses, setTotalCourses] = useState(0);
  const coursesPerPage = 12;

  // Check if user is logged in
  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        setIsLoggedIn(!!(token && user));
      } catch (err) {
        console.error('Error checking auth:', err);
        setIsLoggedIn(false);
      }
    };
    checkAuth();
  }, []);

  // Initialize filters from URL
  useEffect(() => {
    const query = searchParams.get('q') || '';
    const category = searchParams.get('category') || '';
    const level = searchParams.get('level') || '';
    const price = searchParams.get('price') || '';
    const rating = searchParams.get('rating') || '0';
    const sort = searchParams.get('sort') || 'popular';
    const page = searchParams.get('page') || '1';

    setSearchQuery(query);
    setSelectedCategory(category);
    setSelectedLevel(level);
    setSelectedPrice(price);
    setMinRating(parseFloat(rating));
    setSortBy(sort);
    setCurrentPage(parseInt(page));
  }, [searchParams]);

  // Fetch categories
  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch courses when filters change
  useEffect(() => {
    fetchCourses();
  }, [currentPage, searchParams]);

  // Fetch enrollments only if logged in
  useEffect(() => {
    if (isLoggedIn) {
      fetchMyEnrollments();
    } else {
      setMyEnrollments([]);
      setCourseStats({});
    }
  }, [isLoggedIn]);

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await API.get('/categories');
      setCategories(response.data?.data || response.data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setLoadingCategories(false);
    }
  };

  // Fetch wishlist (simplified - you need to implement backend)
  const fetchWishlist = async () => {
    if (!isLoggedIn) return;
    
    try {
      setLoadingWishlist(true);
      // For now, using localStorage as fallback
      const savedWishlist = localStorage.getItem('wishlist');
      if (savedWishlist) {
        setWishlist(JSON.parse(savedWishlist));
      }
    } catch (err) {
      console.error('Error fetching wishlist:', err);
    } finally {
      setLoadingWishlist(false);
    }
  };

  // Enhanced fetchMyEnrollments
  const fetchMyEnrollments = async () => {
    if (!isLoggedIn) return;

    try {
      setLoadingEnrollments(true);
      const response = await API.get('/enrollments/me', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      let enrollmentsData = [];
      
      if (response.data) {
        if (response.data.success && Array.isArray(response.data.data)) {
          enrollmentsData = response.data.data;
        } else if (Array.isArray(response.data)) {
          enrollmentsData = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          enrollmentsData = response.data.data;
        }
      }
      
      setMyEnrollments(enrollmentsData);
      
      const stats = {};
      enrollmentsData.forEach(enrollment => {
        const courseId = enrollment.course?.id || enrollment.courseId;
        if (courseId) {
          stats[courseId] = {
            isEnrolled: true,
            progress: enrollment.progress || enrollment.stats?.progressPercentage || 0,
            enrollmentId: enrollment.id,
            status: enrollment.status || 'IN_PROGRESS',
            lastAccessed: enrollment.updatedAt || enrollment.lastAccessed
          };
        }
      });
      setCourseStats(stats);
      
    } catch (err) {
      console.error('Fetch enrollments error:', err);
      setMyEnrollments([]);
      setCourseStats({});
    } finally {
      setLoadingEnrollments(false);
    }
  };

  // Enhanced fetchCourses with filters
  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const filters = {
        page: currentPage,
        per_page: coursesPerPage,
        q: searchQuery,
        category: selectedCategory,
        level: selectedLevel,
        price: selectedPrice,
        rating_min: minRating,
        sort: sortBy
      };

      console.log('Fetching courses with filters:', filters);
      const response = await API.get('/courses', { params: filters });
      
      console.log('Courses API Response:', response);
      
      let coursesData = [];
      let pagination = {};
      
      if (response.data) {
        if (response.data.success && response.data.data) {
          coursesData = response.data.data;
          pagination = response.data.meta || {};
        } else if (response.data.data && Array.isArray(response.data.data)) {
          coursesData = response.data.data;
          pagination = response.data.meta || {};
        } else if (Array.isArray(response.data)) {
          coursesData = response.data;
        }
      }
      
      console.log(`Processed ${coursesData.length} courses`);
      
      setCourses(coursesData);
      setTotalCourses(pagination.total || coursesData.length);
      setTotalPages(pagination.total_pages || Math.ceil(coursesData.length / coursesPerPage));
      
    } catch (err) {
      console.error('Fetch courses error:', err);
      setError(err.response?.data?.message || 'Failed to load courses. Please try again.');
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, selectedCategory, selectedLevel, selectedPrice, minRating, sortBy]);

  // Apply filters locally
  const filteredCourses = useMemo(() => {
    if (!courses.length) return [];
    
    let filtered = [...courses];
    
    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(query) ||
        course.description.toLowerCase().includes(query) ||
        course.instructor?.name?.toLowerCase().includes(query)
      );
    }
    
    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter(course => 
        course.categoryId === parseInt(selectedCategory) ||
        course.category?.id === parseInt(selectedCategory) ||
        course.category?.name?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }
    
    // Apply level filter
    if (selectedLevel) {
      filtered = filtered.filter(course => 
        course.level?.toLowerCase() === selectedLevel.toLowerCase()
      );
    }
    
    // Apply price filter
    if (selectedPrice === 'free') {
      filtered = filtered.filter(course => course.price === 0);
    } else if (selectedPrice === 'paid') {
      filtered = filtered.filter(course => course.price > 0);
    }
    
    // Apply rating filter
    if (minRating > 0) {
      filtered = filtered.filter(course => (course.rating || 0) >= minRating);
    }
    
    // Apply sorting
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'price_low':
        filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'price_high':
        filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case 'popular':
      default:
        filtered.sort((a, b) => (b.enrollmentsCount || 0) - (a.enrollmentsCount || 0));
        break;
    }
    
    return filtered;
  }, [courses, searchQuery, selectedCategory, selectedLevel, selectedPrice, minRating, sortBy]);

  // Update URL with filters
  const updateURLFilters = useCallback(() => {
    const params = new URLSearchParams();
    
    if (searchQuery) params.set('q', searchQuery);
    if (selectedCategory) params.set('category', selectedCategory);
    if (selectedLevel) params.set('level', selectedLevel);
    if (selectedPrice) params.set('price', selectedPrice);
    if (minRating > 0) params.set('rating', minRating.toString());
    if (sortBy !== 'popular') params.set('sort', sortBy);
    if (currentPage > 1) params.set('page', currentPage.toString());
    
    setSearchParams(params);
  }, [searchQuery, selectedCategory, selectedLevel, selectedPrice, minRating, sortBy, currentPage, setSearchParams]);

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    setCurrentPage(1); // Reset to first page when filters change
    
    switch (filterType) {
      case 'search':
        setSearchQuery(value);
        break;
      case 'category':
        setSelectedCategory(value);
        break;
      case 'level':
        setSelectedLevel(value);
        break;
      case 'price':
        setSelectedPrice(value);
        break;
      case 'rating':
        setMinRating(value);
        break;
      case 'sort':
        setSortBy(value);
        break;
    }
    
    updateURLFilters();
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedLevel('');
    setSelectedPrice('');
    setMinRating(0);
    setSortBy('popular');
    setCurrentPage(1);
    setSearchParams({});
  };

  // Pagination handlers
  const goToPage = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Enhanced enrollment handler
  const handleEnroll = async (courseId, e) => {
    if (e) e.stopPropagation();
    
    if (!isLoggedIn) {
      navigate('/login', {
        state: {
          from: `/courses/${courseId}`,
          message: 'Please login to enroll in this course'
        }
      });
      return;
    }
    
    try {
      setEnrollingCourseId(courseId);
      setError('');
      setSuccess('');
      
      const course = courses.find(c => c.id === courseId);
      
      if (!course) {
        setError('Course not found');
        return;
      }
      
      const isFree = (course.price || 0) === 0;
      const enrollmentStatus = getEnrollmentStatus(courseId);
      
      // Check if already enrolled
      if (enrollmentStatus.isEnrolled) {
        navigate(`/courses/${courseId}/learn${enrollmentStatus.enrollmentId ? `?enrollment=${enrollmentStatus.enrollmentId}` : ''}`);
        return;
      }

      if (isFree) {
        const response = await API.post('/enrollments/free', { courseId }, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.data?.success) {
          // Update local state
          await fetchMyEnrollments();
          
          setCourses(prev => prev.map(c => 
            c.id === courseId ? { 
              ...c, 
              enrollmentsCount: (c.enrollmentsCount || 0) + 1 
            } : c
          ));
          
          setSuccess('Successfully enrolled in the course!');
          
          const enrollmentData = response.data.data || response.data;
          const newEnrollmentId = enrollmentData.id || enrollmentData.enrollment?.id;
          
          // Navigate after delay
          setTimeout(() => {
            navigate(`/courses/${courseId}/learn${newEnrollmentId ? `?enrollment=${newEnrollmentId}` : ''}`);
          }, 1500);
          
        } else {
          setError(response.data?.message || 'Failed to enroll');
        }
        
      } else {
        navigate(`/checkout/${courseId}`);
      }
    } catch (err) {
      console.error('Enrollment error:', err);
      const status = err.response?.status;
      const errorData = err.response?.data;

      if (status === 401) {
        setIsLoggedIn(false);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login', { 
          state: { 
            from: `/courses/${courseId}`, 
            message: 'Session expired. Please login again.' 
          } 
        });
      } else if (status === 409) {
        setError(errorData?.message || 'You are already enrolled in this course');
        await fetchMyEnrollments();
        setTimeout(() => setError(''), 3000);
      } else {
        setError(errorData?.message || 'Failed to enroll. Please try again.');
      }
    } finally {
      setEnrollingCourseId(null);
    }
  };

  // Wishlist handlers (local storage fallback)
  const toggleWishlist = (courseId, e) => {
    if (e) e.stopPropagation();
    
    if (!isLoggedIn) {
      navigate('/login', {
        state: {
          from: '/courses',
          message: 'Please login to save courses to your wishlist'
        }
      });
      return;
    }
    
    const isInWishlist = wishlist.includes(courseId);
    
    if (isInWishlist) {
      const updated = wishlist.filter(id => id !== courseId);
      setWishlist(updated);
      localStorage.setItem('wishlist', JSON.stringify(updated));
    } else {
      const updated = [...wishlist, courseId];
      setWishlist(updated);
      localStorage.setItem('wishlist', JSON.stringify(updated));
    }
  };

  // Navigation
  const goToCourseDetails = (courseId, e) => {
    if (e) e.stopPropagation(); 
    navigate(`/courses/${courseId}`);
  };

  const goToLearning = (courseId, e) => {
    if (e) e.stopPropagation();
    const enrollmentStatus = getEnrollmentStatus(courseId);
    navigate(`/courses/${courseId}/learn${enrollmentStatus.enrollmentId ? `?enrollment=${enrollmentStatus.enrollmentId}` : ''}`);
  };

  // Helper functions
  const getEnrollmentStatus = useCallback((courseId) => {
    const stats = courseStats[courseId];
    if (stats) {
      return {
        isEnrolled: true,
        progress: stats.progress || 0,
        enrollmentId: stats.enrollmentId,
        status: stats.status || 'IN_PROGRESS',
        lastAccessed: stats.lastAccessed
      };
    }
    
    return {
      isEnrolled: false,
      progress: 0,
      status: null,
      lastAccessed: null
    };
  }, [courseStats]);

  const isUserEnrolled = useCallback((courseId) => {
    return !!courseStats[courseId]?.isEnrolled;
  }, [courseStats]);

  const isInWishlist = useCallback((courseId) => {
    return wishlist.includes(courseId);
  }, [wishlist]);

  const formatDuration = useMemo(() => (minutes) => {
    if (!minutes) return '0h';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  }, []);

  const getDifficultyBadge = useMemo(() => (level) => {
    if (!level) return { text: 'All Levels', bg: 'bg-gray-100 text-gray-700' };
    
    const levelLower = level.toLowerCase();
    const badges = {
      'beginner': { text: 'Beginner', bg: 'bg-green-100 text-green-700' },
      'intermediate': { text: 'Intermediate', bg: 'bg-yellow-100 text-yellow-700' },
      'advanced': { text: 'Advanced', bg: 'bg-red-100 text-red-700' },
      'all_levels': { text: 'All Levels', bg: 'bg-gray-100 text-gray-700' },
      'all': { text: 'All Levels', bg: 'bg-gray-100 text-gray-700' }
    };
    return badges[levelLower] || { text: 'All Levels', bg: 'bg-gray-100 text-gray-700' };
  }, []);

  const getTotalLessons = useMemo(() => (course) => {
    if (!course.modules) return 0;
    
    if (course.totalLessons !== undefined) {
      return course.totalLessons;
    }
    
    return course.modules.reduce((total, module) => {
      if (module.lessonsCount !== undefined) {
        return total + module.lessonsCount;
      }
      return total + (module.lessons?.length || 0);
    }, 0);
  }, []);

  const getTotalCourseDuration = useMemo(() => (course) => {
    if (!course.modules) return '0h';
    
    if (course.totalDuration !== undefined) {
      return formatDuration(course.totalDuration);
    }
    
    let totalMinutes = 0;
    course.modules.forEach(module => {
      if (module.lessons) {
        module.lessons.forEach(lesson => {
          totalMinutes += lesson.duration || 0;
        });
      }
      totalMinutes += module.totalDuration || 0;
    });
    
    return formatDuration(totalMinutes);
  }, [formatDuration]);

  const getThumbnailUrl = useMemo(() => (course) => {
    if (!course) return null;
    
    if (course.thumbnail && typeof course.thumbnail === 'string' && course.thumbnail.trim() !== '') {
      let url = course.thumbnail;
      
      if (url.startsWith('/')) {
        if (window.location.hostname === 'localhost') {
          url = `http://localhost:3000${url}`;
        } else {
          url = `${window.location.origin}${url}`;
        }
      }
      
      return url;
    }
    
    return null;
  }, []);

  // Loading skeleton
  const renderSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
          <div className="h-48 bg-gray-200"></div>
          <div className="p-6">
            <div className="h-4 bg-gray-200 rounded mb-4"></div>
            <div className="h-3 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 rounded mb-6"></div>
            <div className="flex justify-between">
              <div className="h-4 w-24 bg-gray-200 rounded"></div>
              <div className="h-4 w-16 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Explore Our Courses</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover professional courses taught by industry experts. Learn at your own pace and advance your career.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search Bar */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  placeholder="Search courses, instructors, topics..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                />
                {searchQuery && (
                  <button
                    onClick={() => handleFilterChange('search', '')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-5 h-5" />
              <span>Filters</span>
              <ChevronDown className={`w-5 h-5 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
                className="appearance-none w-full md:w-auto px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white pr-10"
              >
                <option value="popular">Most Popular</option>
                <option value="newest">Newest</option>
                <option value="rating">Highest Rated</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
            </div>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  >
                    <option value="">All Categories</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Level Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Level
                  </label>
                  <select
                    value={selectedLevel}
                    onChange={(e) => handleFilterChange('level', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  >
                    <option value="">All Levels</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                {/* Price Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price
                  </label>
                  <select
                    value={selectedPrice}
                    onChange={(e) => handleFilterChange('price', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  >
                    <option value="">All Prices</option>
                    <option value="free">Free</option>
                    <option value="paid">Paid</option>
                  </select>
                </div>

                {/* Rating Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Rating
                  </label>
                  <div className="flex items-center gap-2">
                    {[0, 1, 2, 3, 4].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => handleFilterChange('rating', rating)}
                        className={`flex items-center px-3 py-2 rounded-md border ${
                          minRating === rating
                            ? 'bg-blue-50 border-blue-500 text-blue-600'
                            : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <Star className={`w-4 h-4 ${minRating > rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                        <span className="ml-1">{rating}+</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Active Filters and Clear Button */}
              {(selectedCategory || selectedLevel || selectedPrice || minRating > 0) && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm text-gray-600">Active filters:</span>
                      {selectedCategory && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                          Category: {categories.find(c => c.id === parseInt(selectedCategory))?.name || selectedCategory}
                          <button onClick={() => handleFilterChange('category', '')}>
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      )}
                      {selectedLevel && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                          Level: {selectedLevel}
                          <button onClick={() => handleFilterChange('level', '')}>
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      )}
                      {selectedPrice && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                          Price: {selectedPrice === 'free' ? 'Free' : 'Paid'}
                          <button onClick={() => handleFilterChange('price', '')}>
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      )}
                      {minRating > 0 && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                          Rating: {minRating}+
                          <button onClick={() => handleFilterChange('rating', 0)}>
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      )}
                    </div>
                    <button
                      onClick={clearAllFilters}
                      className="text-sm text-red-600 hover:text-red-800 flex items-center gap-1"
                    >
                      <X className="w-4 h-4" />
                      Clear all
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Messages */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg border border-green-200 flex items-start gap-3 animate-fade-in">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="font-semibold">Success!</div>
              <div>{success}</div>
            </div>
            <button 
              onClick={() => setSuccess('')}
              className="text-green-600 hover:text-green-800"
            >
              ×
            </button>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 flex items-start gap-3 animate-fade-in">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="font-semibold">Error:</div>
              <div>{error}</div>
            </div>
            <button 
              onClick={() => setError('')}
              className="text-red-600 hover:text-red-800"
            >
              ×
            </button>
          </div>
        )}

        {/* Authentication Status */}
        {!isLoggedIn && (
          <div className="mb-6 p-4 bg-blue-50 text-blue-700 rounded-lg border border-blue-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <div>
                <div className="font-semibold">Not Logged In</div>
                <div className="text-sm">Login to enroll in courses, track progress, and save to wishlist</div>
              </div>
            </div>
            <button 
              onClick={() => navigate('/login', { state: { from: '/courses' } })}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Login Now
            </button>
          </div>
        )}

        {/* Results Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {searchQuery ? `Search results for "${searchQuery}"` : 'Featured Courses'}
            </h2>
            <p className="text-gray-600 mt-1">
              Showing {filteredCourses.length} of {totalCourses} courses
              {filteredCourses.length !== courses.length && ' (filtered)'}
            </p>
          </div>
          
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <div className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </div>
          </div>
        </div>

        {/* Courses Grid */}
        {loading ? (
          renderSkeleton()
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Courses Found</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {searchQuery 
                ? `No courses match "${searchQuery}". Try different keywords or clear filters.`
                : 'There are no courses to display at the moment.'}
            </p>
            <div className="flex justify-center gap-3">
              {searchQuery || selectedCategory || selectedLevel || selectedPrice || minRating > 0 ? (
                <button 
                  onClick={clearAllFilters}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Clear Filters
                </button>
              ) : (
                <button 
                  onClick={fetchCourses}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Try Again
                </button>
              )}
              <button 
                onClick={() => navigate('/')}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Go Home
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCourses.map((course) => {
                const id = course.id;
                const enrollmentStatus = getEnrollmentStatus(id);
                const isEnrolled = enrollmentStatus.isEnrolled;
                const progress = enrollmentStatus.progress;
                const enrollmentStatusText = enrollmentStatus.status;
                const lastAccessed = enrollmentStatus.lastAccessed;
                
                const difficulty = getDifficultyBadge(course.level);
                const isFree = (course.price || 0) === 0;
                const isEnrolling = enrollingCourseId === id;
                const totalLessons = getTotalLessons(course);
                const totalDuration = getTotalCourseDuration(course);
                const thumbnailUrl = getThumbnailUrl(course);
                const enrollmentCount = course.enrollmentsCount || 0;
                const inWishlist = isInWishlist(id);
                const isNew = course.createdAt && (new Date(course.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));

                return (
                  <div key={id} className="group animate-fade-in-up">
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 h-full flex flex-col hover:border-blue-300 hover:-translate-y-1">
                      
                      {/* Course Image with Overlays */}
                      <div 
                        className="h-48 relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 cursor-pointer group flex-shrink-0"
                        onClick={() => goToCourseDetails(id)}
                      >
                        {thumbnailUrl ? (
                          <img
                            src={thumbnailUrl}
                            alt={course.title || 'Course image'}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center p-4">
                            <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                              <BookOpen className="w-8 h-8 text-gray-500" />
                            </div>
                            <p className="text-gray-700 font-medium text-center text-sm">{course.title || 'Untitled Course'}</p>
                          </div>
                        )}
                        
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        
                        {/* Top Badges */}
                        <div className="absolute top-3 left-3 flex flex-col gap-2">
                          {isNew && (
                            <span className="px-2 py-1 bg-red-500 text-white text-xs font-semibold rounded shadow-sm">
                              NEW
                            </span>
                          )}
                          <span className={`px-2 py-1 rounded text-xs font-semibold shadow-sm ${difficulty.bg}`}>
                            {difficulty.text}
                          </span>
                        </div>
                        
                        {/* Right Side Badges */}
                        <div className="absolute top-3 right-3 flex flex-col gap-2">
                          {isFree ? (
                            <span className="px-2 py-1 bg-green-500 text-white text-xs font-semibold rounded shadow-sm">
                              FREE
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-blue-600 text-white text-xs font-semibold rounded shadow-sm">
                              ${course.price || 0}
                            </span>
                          )}
                          
                          {/* Wishlist Button */}
                          <button
                            onClick={(e) => toggleWishlist(id, e)}
                            className={`p-2 rounded-full shadow-sm transition-colors ${
                              inWishlist
                                ? 'bg-red-100 text-red-600 hover:bg-red-200'
                                : 'bg-white/90 text-gray-600 hover:bg-white hover:text-red-500'
                            }`}
                            title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                          >
                            <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} />
                          </button>
                        </div>
                        
                        {/* Enrollment Status */}
                        {isEnrolled && (
                          <div className="absolute top-14 right-3">
                            <div className={`px-2 py-1 text-xs font-semibold rounded shadow-sm ${
                              enrollmentStatusText === 'COMPLETED' 
                                ? 'bg-purple-500 text-white' 
                                : 'bg-green-500 text-white'
                            }`}>
                              {enrollmentStatusText === 'COMPLETED' ? 'COMPLETED' : 'ENROLLED'}
                            </div>
                          </div>
                        )}
                        
                        {/* Progress Overlay */}
                        {isEnrolled && progress > 0 && (
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-white text-xs font-medium">Your Progress</span>
                              <span className="text-white text-xs font-bold">{progress}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-white/30 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-green-400 rounded-full transition-all duration-500"
                                style={{ width: `${progress}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Course Content */}
                      <div className="p-6 flex-1 flex flex-col">
                        {/* Category */}
                        {course.category && (
                          <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded mb-3 self-start">
                            {course.category.name}
                          </span>
                        )}
                        
                        {/* Title */}
                        <h3 
                          className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 cursor-pointer hover:text-blue-600 transition-colors duration-200"
                          onClick={() => goToCourseDetails(id)}
                          title={course.title}
                        >
                          {course.title || 'Untitled Course'}
                        </h3>
                        
                        {/* Description */}
                        <p className="text-gray-600 text-sm line-clamp-2 mb-4 flex-1">
                          {course.description || 'No description available'}
                        </p>
                        
                        {/* Instructor Info */}
                        {course.instructor && (
                          <div className="flex items-center mb-4 text-sm text-gray-500">
                            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-xs font-medium text-gray-600 mr-2">
                              {course.instructor.name?.charAt(0) || 'I'}
                            </div>
                            <div>
                              <div className="font-medium">{course.instructor.name || 'Instructor'}</div>
                              {lastAccessed && isEnrolled && (
                                <div className="text-xs text-gray-400">
                                  Last accessed: {new Date(lastAccessed).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {/* Course Stats */}
                        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                          <div className="flex items-center space-x-4">
                            <span className="flex items-center" title="Total Lessons">
                              <BookOpen className="w-4 h-4 mr-1 text-gray-400" />
                              {totalLessons}
                            </span>
                            <span className="flex items-center" title="Total Duration">
                              <Clock className="w-4 h-4 mr-1 text-gray-400" />
                              {totalDuration}
                            </span>
                            <span className="flex items-center" title="Total Enrollments">
                              <Users className="w-4 h-4 mr-1 text-gray-400" />
                              {enrollmentCount.toLocaleString()}
                            </span>
                          </div>
                          <span className="flex items-center" title="Course Rating">
                            <Star className="w-4 h-4 text-yellow-500 mr-1 fill-yellow-500" />
                            {(course.rating || 0).toFixed(1)}
                          </span>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-3 mt-auto pt-4 border-t border-gray-100">
                          <button
                            onClick={(e) => goToCourseDetails(id, e)}
                            className="w-full py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg font-medium transition-all duration-200 text-sm flex items-center justify-center border border-gray-200 hover:border-gray-300 hover:shadow-sm"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </button>

                          {isEnrolled ? (
                            <button
                              onClick={(e) => goToLearning(id, e)}
                              className={`w-full py-2.5 rounded-lg font-semibold text-white transition-all duration-200 text-sm flex items-center justify-center ${
                                enrollmentStatusText === 'COMPLETED'
                                  ? 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800'
                                  : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800'
                              }`}
                            >
                              <PlayCircle className="w-4 h-4 mr-2" />
                              {enrollmentStatusText === 'COMPLETED' 
                                ? 'Review Course' 
                                : progress > 0 
                                  ? 'Continue Learning' 
                                  : 'Start Learning'
                              }
                            </button>
                          ) : (
                            <button
                              onClick={(e) => handleEnroll(id, e)}
                              disabled={isEnrolling || !isLoggedIn}
                              className={`w-full py-2.5 rounded-lg font-semibold text-white transition-all duration-200 text-sm flex items-center justify-center ${
                                isEnrolling || !isLoggedIn ? 'opacity-70 cursor-not-allowed' : ''
                              } ${isFree 
                                ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800' 
                                : 'bg-gradient-to-r from-gray-800 to-gray-900 hover:from-gray-900 hover:to-black'
                              }`}
                            >
                              {isEnrolling ? (
                                <>
                                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                  Processing...
                                </>
                              ) : !isLoggedIn ? (
                                <>
                                  <Lock className="w-4 h-4 mr-2" />
                                  Login to Enroll
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
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center">
                <nav className="flex items-center gap-2">
                  <button
                    onClick={prevPage}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-lg border ${
                      currentPage === 1
                        ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                    }`}
                  >
                    Previous
                  </button>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => goToPage(pageNum)}
                        className={`px-4 py-2 rounded-lg border ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <>
                      <span className="px-2 text-gray-500">...</span>
                      <button
                        onClick={() => goToPage(totalPages)}
                        className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                      >
                        {totalPages}
                      </button>
                    </>
                  )}
                  
                  <button
                    onClick={nextPage}
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 rounded-lg border ${
                      currentPage === totalPages
                        ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                    }`}
                  >
                    Next
                  </button>
                </nav>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CoursesPage;