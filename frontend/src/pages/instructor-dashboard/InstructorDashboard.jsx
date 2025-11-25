import { useState, useEffect } from 'react';
import {
  Plus,
  BookOpen,
  Users,
  DollarSign,
  Star,
  BarChart3,
  Edit3,
  Archive,
  Eye,
  MoreVertical,
  PlayCircle,
  FileText,
  Download,
  Filter,
  Search,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  Target,
  PieChart,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

export default function InstructorDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [showCreateCourse, setShowCreateCourse] = useState(false);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [newCourse, setNewCourse] = useState({
    title: '',
    category: '',
    description: '',
    price: 0,
    isFree: false,
    level: 'beginner',
    category: 'development'
  });

  // Mock data - replace with actual API calls
  useEffect(() => {
    const sampleCourses = [
      {
        id: 1,
        title: 'Complete Web Development Bootcamp',
        status: 'published',
        students: 12500,
        revenue: 45250,
        rating: 4.8,
        reviews: 1247,
        progress: 85,
        image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=250&fit=crop',
        category: 'Development',
        price: 89.99,
        createdAt: '2024-01-15',
        lastUpdated: '2024-03-20',
        modules: 12,
        lessons: 245,
        assignments: 15
      },
      {
        id: 2,
        title: 'Advanced JavaScript Patterns',
        status: 'published',
        students: 7800,
        revenue: 31200,
        rating: 4.9,
        reviews: 892,
        progress: 92,
        image: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=400&h=250&fit=crop',
        category: 'Development',
        price: 69.99,
        createdAt: '2024-02-10',
        lastUpdated: '2024-03-18',
        modules: 8,
        lessons: 140,
        assignments: 8
      },
      {
        id: 3,
        title: 'React Native Mobile Development',
        status: 'draft',
        students: 0,
        revenue: 0,
        rating: 0,
        reviews: 0,
        progress: 45,
        image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=250&fit=crop',
        category: 'Mobile',
        price: 79.99,
        createdAt: '2024-03-15',
        lastUpdated: '2024-03-22',
        modules: 6,
        lessons: 85,
        assignments: 5
      },
      {
        id: 4,
        title: 'Python Data Science Masterclass',
        status: 'archived',
        students: 3200,
        revenue: 12800,
        rating: 4.6,
        reviews: 456,
        progress: 100,
        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop',
        category: 'Data Science',
        price: 94.99,
        createdAt: '2023-11-20',
        lastUpdated: '2024-02-15',
        modules: 10,
        lessons: 180,
        assignments: 12
      }
    ];

    setCourses(sampleCourses);
  }, []);

  const stats = {
    totalStudents: 23500,
    totalRevenue: 89250,
    averageRating: 4.8,
    totalCourses: 4,
    activeStudents: 18760,
    completionRate: 78
  };

  const recentStudents = [
    { id: 1, name: 'Alex Johnson', email: 'alex@example.com', course: 'Web Development', progress: 65, lastActive: '2 hours ago' },
    { id: 2, name: 'Sarah Miller', email: 'sarah@example.com', course: 'JavaScript Patterns', progress: 92, lastActive: '5 hours ago' },
    { id: 3, name: 'Mike Chen', email: 'mike@example.com', course: 'Web Development', progress: 45, lastActive: '1 day ago' },
    { id: 4, name: 'Emily Davis', email: 'emily@example.com', course: 'JavaScript Patterns', progress: 78, lastActive: '2 days ago' }
  ];

  const revenueData = [
    { month: 'Jan', revenue: 12500 },
    { month: 'Feb', revenue: 18700 },
    { month: 'Mar', revenue: 23450 },
    { month: 'Apr', revenue: 18900 },
    { month: 'May', revenue: 15600 }
  ];

  const handleCreateCourse = () => {
    // Add course creation logic here
    console.log('Creating course:', newCourse);
    setShowCreateCourse(false);
    setNewCourse({
      title: '',
      category: '',
      description: '',
      price: 0,
      isFree: false,
      level: 'beginner',
      category: 'development'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'published': return <CheckCircle className="w-4 h-4" />;
      case 'draft': return <Edit3 className="w-4 h-4" />;
      case 'archived': return <Archive className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Instructor Dashboard</h1>
              <p className="text-sm text-gray-600">Manage your courses and track performance</p>
            </div>
            <button
              onClick={() => setShowCreateCourse(true)}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create Course
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {['overview', 'courses', 'students', 'analytics'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                  activeTab === tab
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                icon={<Users className="w-8 h-8 text-blue-600" />}
                title="Total Students"
                value={stats.totalStudents.toLocaleString()}
                change="+12%"
                trend="up"
                description="Across all courses"
              />
              <StatCard
                icon={<DollarSign className="w-8 h-8 text-green-600" />}
                title="Total Revenue"
                value={`$${stats.totalRevenue.toLocaleString()}`}
                change="+18%"
                trend="up"
                description="Lifetime earnings"
              />
              <StatCard
                icon={<Star className="w-8 h-8 text-yellow-600" />}
                title="Average Rating"
                value={stats.averageRating}
                change="+0.2"
                trend="up"
                description="From student reviews"
              />
              <StatCard
                icon={<Target className="w-8 h-8 text-purple-600" />}
                title="Completion Rate"
                value={`${stats.completionRate}%`}
                change="+5%"
                trend="up"
                description="Course completion"
              />
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Revenue Chart */}
              <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Revenue Overview</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span>18% increase this month</span>
                  </div>
                </div>
                <div className="h-64">
                  <RevenueChart data={revenueData} />
                </div>
              </div>

              {/* Recent Students */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Students</h3>
                  <button className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                    View All
                  </button>
                </div>
                <div className="space-y-4">
                  {recentStudents.map((student) => (
                    <div key={student.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {student.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{student.name}</p>
                          <p className="text-xs text-gray-500">{student.course}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{ width: `${student.progress}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{student.progress}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Course Overview */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Your Courses</h3>
                <button 
                  onClick={() => setActiveTab('courses')}
                  className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                >
                  Manage All Courses
                </button>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {courses.slice(0, 4).map((course) => (
                  <div key={course.id} className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(course.status)}`}>
                        {getStatusIcon(course.status)}
                        {course.status}
                      </span>
                      <div className="text-2xl font-bold text-gray-900">
                        ${course.revenue > 1000 ? `${(course.revenue / 1000).toFixed(0)}k` : course.revenue}
                      </div>
                    </div>
                    <h4 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2">{course.title}</h4>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{course.students} students</span>
                      <span>{course.rating > 0 ? `${course.rating} ★` : 'No ratings'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'courses' && (
          <div className="space-y-6">
            {/* Courses Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Course Management</h2>
                <p className="text-gray-600">Create, edit, and manage your courses</p>
              </div>
              <div className="flex gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search courses..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <select className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                  <option>All Status</option>
                  <option>Published</option>
                  <option>Draft</option>
                  <option>Archived</option>
                </select>
              </div>
            </div>

            {/* Courses Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Students</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {courses.map((course) => (
                      <tr key={course.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <img
                              className="h-10 w-16 object-cover rounded"
                              src={course.image}
                              alt={course.title}
                            />
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 line-clamp-1">
                                {course.title}
                              </div>
                              <div className="text-sm text-gray-500">{course.category}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(course.status)}`}>
                            {getStatusIcon(course.status)}
                            {course.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {course.students.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${course.revenue.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="text-sm text-gray-900">{course.rating || '-'}</span>
                            <span className="text-sm text-gray-500">({course.reviews})</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button className="text-indigo-600 hover:text-indigo-900">
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button className="text-gray-600 hover:text-gray-900">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="text-gray-600 hover:text-gray-900">
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'students' && (
          <StudentProgressView students={recentStudents} />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsView courses={courses} stats={stats} />
        )}
      </div>

      {/* Create Course Modal */}
      {showCreateCourse && (
        <CreateCourseModal
          newCourse={newCourse}
          setNewCourse={setNewCourse}
          onClose={() => setShowCreateCourse(false)}
          onSubmit={handleCreateCourse}
        />
      )}
    </div>
  );
}

// Stat Card Component
function StatCard({ icon, title, value, change, trend, description }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          <div className={`flex items-center gap-1 mt-2 text-sm ${
            trend === 'up' ? 'text-green-600' : 'text-red-600'
          }`}>
            {trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            <span>{change}</span>
            <span className="text-gray-500 ml-1">from last month</span>
          </div>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">
          {icon}
        </div>
      </div>
      <p className="text-xs text-gray-500 mt-3">{description}</p>
    </div>
  );
}

// Revenue Chart Component
function RevenueChart({ data }) {
  const maxRevenue = Math.max(...data.map(d => d.revenue));
  
  return (
    <div className="h-full flex items-end justify-between gap-2">
      {data.map((item, index) => (
        <div key={index} className="flex flex-col items-center flex-1">
          <div className="text-xs text-gray-500 mb-2">{item.month}</div>
          <div
            className="w-full bg-linear-to-t from-indigo-500 to-purple-600 rounded-t-lg transition-all duration-500 hover:opacity-80"
            style={{ height: `${(item.revenue / maxRevenue) * 100}%` }}
          ></div>
          <div className="text-xs text-gray-600 mt-2">${(item.revenue / 1000).toFixed(0)}k</div>
        </div>
      ))}
    </div>
  );
}

// Student Progress View Component
function StudentProgressView({ students }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Student Progress</h2>
          <p className="text-gray-600">Track your students' learning journey</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search students..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <select className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
            <option>All Courses</option>
            <option>Web Development</option>
            <option>JavaScript Patterns</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Active</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-linear-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {student.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{student.name}</div>
                        <div className="text-sm text-gray-500">{student.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {student.course}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${student.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 w-8">{student.progress}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.lastActive}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-indigo-600 hover:text-indigo-900 text-sm font-medium">
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Analytics View Component
function AnalyticsView({ courses, stats }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Advanced Analytics</h2>
        <p className="text-gray-600">Deep insights into your teaching performance</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Course Performance</h3>
          <div className="space-y-4">
            {courses.map((course) => (
              <div key={course.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <img
                    className="h-12 w-16 object-cover rounded"
                    src={course.image}
                    alt={course.title}
                  />
                  <div>
                    <div className="font-medium text-gray-900 text-sm">{course.title}</div>
                    <div className="text-xs text-gray-500">{course.students} students</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900">${course.revenue.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">{course.rating} ★</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Engagement Metrics</h3>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Completion Rate</span>
                <span>{stats.completionRate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-green-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${stats.completionRate}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Student Satisfaction</span>
                <span>{stats.averageRating}/5</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-yellow-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${(stats.averageRating / 5) * 100}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Active Students</span>
                <span>{((stats.activeStudents / stats.totalStudents) * 100).toFixed(0)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${(stats.activeStudents / stats.totalStudents) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Create Course Modal Component
function CreateCourseModal({ newCourse, setNewCourse, onClose, onSubmit }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-900">Create New Course</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Course Title
            </label>
            <input
              type="text"
              value={newCourse.title}
              onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter course title..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={newCourse.description}
              onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Describe what students will learn..."
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={newCourse.category}
                onChange={(e) => setNewCourse({ ...newCourse, category: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="development">Development</option>
                <option value="design">Design</option>
                <option value="business">Business</option>
                <option value="marketing">Marketing</option>
                <option value="data-science">Data Science</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Level
              </label>
              <select
                value={newCourse.level}
                onChange={(e) => setNewCourse({ ...newCourse, level: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center gap-2 mb-4">
                <input
                  type="checkbox"
                  checked={newCourse.isFree}
                  onChange={(e) => setNewCourse({ ...newCourse, isFree: e.target.checked, price: 0 })}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm font-medium text-gray-700">Free Course</span>
              </label>
            </div>

            {!newCourse.isFree && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price ($)
                </label>
                <input
                  type="number"
                  value={newCourse.price}
                  onChange={(e) => setNewCourse({ ...newCourse, price: parseFloat(e.target.value) || 0 })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={onSubmit}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              Create Course
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}