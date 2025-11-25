import { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Clock, 
  Users, 
  Star, 
  Play, 
  BookOpen, 
  Award,
  ChevronRight,
  Bookmark,
  Eye
} from 'lucide-react';

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [courses, setCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [filters, setFilters] = useState({
    category: 'all',
    price: 'all',
    rating: 'all',
    search: ''
  });

  // Mock data - replace with actual API calls
  useEffect(() => {
    // Sample courses data
    const sampleCourses = [
      {
        id: 1,
        title: 'Complete Web Development Bootcamp',
        instructor: 'Sarah Johnson',
        category: 'Development',
        price: 89.99,
        originalPrice: 129.99,
        rating: 4.8,
        students: 12500,
        duration: '42 hours',
        image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=250&fit=crop',
        description: 'Learn web development from scratch with HTML, CSS, JavaScript, React, Node.js and more!',
        level: 'Beginner',
        lessons: 245,
        isFeatured: true,
        isFree: false
      },
      {
        id: 2,
        title: 'Data Science Fundamentals',
        instructor: 'Mike Chen',
        category: 'Data Science',
        price: 0,
        originalPrice: 99.99,
        rating: 4.6,
        students: 8900,
        duration: '36 hours',
        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop',
        description: 'Master the fundamentals of data science with Python, pandas, and machine learning',
        level: 'Intermediate',
        lessons: 180,
        isFeatured: false,
        isFree: true
      },
      {
        id: 3,
        title: 'Mobile App Development with React Native',
        instructor: 'Emily Davis',
        category: 'Development',
        price: 79.99,
        originalPrice: 99.99,
        rating: 4.9,
        students: 6700,
        duration: '48 hours',
        image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=250&fit=crop',
        description: 'Build cross-platform mobile apps using React Native and JavaScript',
        level: 'Intermediate',
        lessons: 210,
        isFeatured: true,
        isFree: false
      },
      {
        id: 4,
        title: 'UI/UX Design Masterclass',
        instructor: 'Alex Rodriguez',
        category: 'Design',
        price: 94.99,
        originalPrice: 119.99,
        rating: 4.7,
        students: 10200,
        duration: '30 hours',
        image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=250&fit=crop',
        description: 'Learn professional UI/UX design principles and tools',
        level: 'Beginner',
        lessons: 150,
        isFeatured: false,
        isFree: false
      },
      {
        id: 5,
        title: 'Python for Beginners',
        instructor: 'David Wilson',
        category: 'Programming',
        price: 0,
        originalPrice: 49.99,
        rating: 4.5,
        students: 15600,
        duration: '24 hours',
        image: 'https://images.unsplash.com/photo-1526379879527-8559ecfcaec0?w=400&h=250&fit=crop',
        description: 'Start your programming journey with Python',
        level: 'Beginner',
        lessons: 120,
        isFeatured: true,
        isFree: true
      },
      {
        id: 6,
        title: 'Advanced JavaScript Concepts',
        instructor: 'Lisa Thompson',
        category: 'Development',
        price: 69.99,
        originalPrice: 89.99,
        rating: 4.8,
        students: 7800,
        duration: '28 hours',
        image: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=400&h=250&fit=crop',
        description: 'Deep dive into advanced JavaScript patterns and best practices',
        level: 'Advanced',
        lessons: 140,
        isFeatured: false,
        isFree: false
      }
    ];

    // Sample enrolled courses with progress
    const sampleEnrolledCourses = [
      {
        ...sampleCourses[0],
        progress: 65,
        lastLesson: 'React Hooks Deep Dive',
        timeSpent: '15 hours'
      },
      {
        ...sampleCourses[2],
        progress: 30,
        lastLesson: 'React Native Navigation',
        timeSpent: '8 hours'
      },
      {
        ...sampleCourses[4],
        progress: 85,
        lastLesson: 'Python Functions',
        timeSpent: '12 hours'
      }
    ];

    setCourses(sampleCourses);
    setEnrolledCourses(sampleEnrolledCourses);
    setFilteredCourses(sampleCourses);
  }, []);

  // Filter courses based on selected filters
  useEffect(() => {
    let filtered = courses;

    // Search filter
    if (filters.search) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        course.instructor.toLowerCase().includes(filters.search.toLowerCase()) ||
        course.category.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter(course => course.category === filters.category);
    }

    // Price filter
    if (filters.price !== 'all') {
      if (filters.price === 'free') {
        filtered = filtered.filter(course => course.isFree);
      } else if (filters.price === 'paid') {
        filtered = filtered.filter(course => !course.isFree);
      }
    }

    // Rating filter
    if (filters.rating !== 'all') {
      const minRating = parseFloat(filters.rating);
      filtered = filtered.filter(course => course.rating >= minRating);
    }

    setFilteredCourses(filtered);
  }, [filters, courses]);

  const categories = ['All', 'Development', 'Data Science', 'Design', 'Programming', 'Business', 'Marketing'];
  const priceOptions = [
    { value: 'all', label: 'All Prices' },
    { value: 'free', label: 'Free' },
    { value: 'paid', label: 'Paid' }
  ];
  const ratingOptions = [
    { value: 'all', label: 'All Ratings' },
    { value: '4.5', label: '4.5+ Stars' },
    { value: '4.0', label: '4.0+ Stars' },
    { value: '3.5', label: '3.5+ Stars' }
  ];

  const achievementBadges = [
    { name: 'Fast Learner', icon: '⚡', earned: true },
    { name: 'Course Explorer', icon: '🔍', earned: true },
    { name: 'Perfect Score', icon: '🎯', earned: false },
    { name: 'Weekend Warrior', icon: '🏆', earned: true },
    { name: 'Early Bird', icon: '🌅', earned: false }
  ];

  const recommendedCourses = courses.filter(course => course.isFeatured).slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900">LearnHub Student Dashboard</h1>
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 text-gray-600 hover:text-indigo-600">
                <Bookmark className="w-5 h-5" />
                <span>Wishlist</span>
              </button>
              <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
                S
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'dashboard'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('catalog')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'catalog'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Course Catalog
            </button>
            <button
              onClick={() => setActiveTab('my-learning')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'my-learning'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              My Learning
            </button>
          </nav>
        </div>

        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Welcome Section */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome back, Student!</h2>
              <p className="text-gray-600">Continue your learning journey where you left off.</p>
            </div>

            {/* Continue Learning Section */}
            <section>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">Continue Learning</h3>
                <button className="text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
                  View All <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {enrolledCourses.map((course) => (
                  <div key={course.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                    <img
                      src={course.image}
                      alt={course.title}
                      className="w-full h-40 object-cover"
                    />
                    <div className="p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">{course.title}</h4>
                      <p className="text-sm text-gray-600 mb-3">Last: {course.lastLesson}</p>
                      
                      {/* Progress Bar */}
                      <div className="mb-3">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Progress</span>
                          <span>{course.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${course.progress}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{course.timeSpent}</span>
                        </div>
                        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm">
                          Continue
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Achievement Badges */}
            <section>
              <h3 className="text-xl font-bold text-gray-900 mb-6">Your Achievements</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {achievementBadges.map((badge, index) => (
                  <div
                    key={index}
                    className={`text-center p-4 rounded-lg border-2 ${
                      badge.earned
                        ? 'border-yellow-400 bg-yellow-50'
                        : 'border-gray-200 bg-gray-50 opacity-50'
                    }`}
                  >
                    <div className="text-2xl mb-2">{badge.icon}</div>
                    <p className="text-sm font-medium text-gray-900">{badge.name}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {badge.earned ? 'Earned' : 'Locked'}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Recommended Courses */}
            <section>
              <h3 className="text-xl font-bold text-gray-900 mb-6">Recommended For You</h3>
              <div className="grid md:grid-cols-3 gap-6">
                {recommendedCourses.map((course) => (
                  <div key={course.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                    <img
                      src={course.image}
                      alt={course.title}
                      className="w-full h-40 object-cover"
                    />
                    <div className="p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">{course.title}</h4>
                      <p className="text-sm text-gray-600 mb-3">{course.instructor}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span>{course.rating}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>{course.students.toLocaleString()}</span>
                          </div>
                        </div>
                        <span className={`font-bold ${
                          course.isFree ? 'text-green-600' : 'text-gray-900'
                        }`}>
                          {course.isFree ? 'FREE' : `$${course.price}`}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {activeTab === 'catalog' && (
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search Bar */}
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search courses, instructors, categories..."
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      value={filters.search}
                      onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    />
                  </div>
                </div>

                {/* Filter Buttons */}
                <div className="flex gap-3">
                  <select
                    className="border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    value={filters.category}
                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  >
                    <option value="all">All Categories</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>

                  <select
                    className="border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    value={filters.price}
                    onChange={(e) => setFilters({ ...filters, price: e.target.value })}
                  >
                    {priceOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>

                  <select
                    className="border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    value={filters.rating}
                    onChange={(e) => setFilters({ ...filters, rating: e.target.value })}
                  >
                    {ratingOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Course Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>

            {filteredCourses.length === 0 && (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
                <p className="text-gray-500">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'my-learning' && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-900">My Enrolled Courses</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledCourses.map((course) => (
                <div key={course.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <img
                    src={course.image}
                    alt={course.title}
                    className="w-full h-40 object-cover"
                  />
                  <div className="p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">{course.title}</h4>
                    <p className="text-sm text-gray-600 mb-3">{course.instructor}</p>
                    
                    <div className="mb-3">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{course.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-indigo-600 h-2 rounded-full"
                          style={{ width: `${course.progress}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button className="flex-1 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm">
                        Continue
                      </button>
                      <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Course Card Component
function CourseCard({ course }) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <img
        src={course.image}
        alt={course.title}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h4 className="font-semibold text-gray-900 flex-1">{course.title}</h4>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-gray-400 hover:text-gray-600 ml-2"
          >
            <Eye className="w-5 h-5" />
          </button>
        </div>
        
        <p className="text-sm text-gray-600 mb-2">{course.instructor}</p>
        
        {showDetails && (
          <div className="mb-3 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">{course.description}</p>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                {course.level}
              </span>
              <span>{course.lessons} lessons</span>
              <span>{course.duration}</span>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span>{course.rating}</span>
            <span className="text-gray-400">({course.students.toLocaleString()})</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{course.duration}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`text-lg font-bold ${
              course.isFree ? 'text-green-600' : 'text-gray-900'
            }`}>
              {course.isFree ? 'FREE' : `$${course.price}`}
            </span>
            {!course.isFree && course.originalPrice > course.price && (
              <span className="text-sm text-gray-500 line-through">
                ${course.originalPrice}
              </span>
            )}
          </div>
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm">
            {course.isFree ? 'Enroll Free' : 'Enroll Now'}
          </button>
        </div>
      </div>
    </div>
  );
}