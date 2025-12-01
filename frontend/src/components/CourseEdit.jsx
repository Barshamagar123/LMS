import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ArrowLeft, Save, X, Plus, Trash2, Upload, Video, FileText, 
  Music, File, FileQuestion, BookOpen, DollarSign, Tag, 
  Settings, Loader, AlertCircle, CheckCircle, Calendar,
  Eye, Users, Star, Clock, ChevronRight,
  TrendingUp
} from 'lucide-react';
import API from '../api/axios';

const CourseEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: 0,
    status: 'DRAFT',
    categoryId: ''
  });
  
  const [modules, setModules] = useState([]);
  const [categories, setCategories] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  
  // Course stats for sidebar
  const [courseStats, setCourseStats] = useState({
    enrollmentsCount: 0,
    revenue: 0,
    rating: 0,
    createdAt: ''
  });

  // Fetch course data
  const fetchCourseData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Get user from localStorage
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        navigate('/login');
        return;
      }
      setCurrentUser(JSON.parse(storedUser));
      
      // Fetch course details
      const [courseRes, categoriesRes, statsRes] = await Promise.all([
        API.get(`/courses/${id}`),
        API.get('/categories'),
        API.get(`/courses/${id}/stats`).catch(() => null) // Optional stats endpoint
      ]);
      
      const course = courseRes.data.course || courseRes.data;
      console.log('Course data:', course);
      
      // Set form data - ensure categoryId is string for select input
      setFormData({
        title: course.title || '',
        description: course.description || '',
        price: course.price || 0,
        status: course.status || 'DRAFT',
        categoryId: String(course.categoryId || course.category?.id || '') // Keep as string for input
      });
      
      // Set modules if they exist
      if (course.modules && Array.isArray(course.modules)) {
        setModules(course.modules.map(module => ({
          id: module.id,
          title: module.title || '',
          order: module.order || 0,
          lessons: module.lessons ? module.lessons.map(lesson => ({
            id: lesson.id,
            title: lesson.title || '',
            contentType: lesson.contentType || 'VIDEO',
            order: lesson.order || 0,
            contentUrl: lesson.contentUrl || '',
            duration: lesson.duration || 0
          })) : []
        })));
      }
      
      // Set categories
      setCategories(categoriesRes.data || []);
      
      // Set course stats
      if (statsRes?.data) {
        setCourseStats({
          enrollmentsCount: statsRes.data.enrollmentsCount || 0,
          revenue: statsRes.data.revenue || 0,
          rating: statsRes.data.rating || 0,
          createdAt: course.createdAt || ''
        });
      } else {
        setCourseStats({
          enrollmentsCount: course.enrollments?.length || 0,
          revenue: course.revenue || 0,
          rating: course.rating || 0,
          createdAt: course.createdAt || ''
        });
      }
      
    } catch (error) {
      console.error('Error fetching course data:', error);
      if (error.response?.status === 404) {
        setError('Course not found');
      } else if (error.response?.status === 401) {
        setError('Session expired. Please login again.');
        localStorage.removeItem('user');
        navigate('/login');
      } else {
        setError('Failed to load course. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseData();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      // Validate
      if (!formData.title.trim() || !formData.description.trim() || !formData.categoryId) {
        throw new Error('Please fill in all required fields');
      }

      // ✅ FIX: Prepare data with proper types for Prisma
      const dataToSend = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: Number(formData.price),
        status: formData.status,
        categoryId: parseInt(formData.categoryId, 10) // Convert string to number for Prisma
      };

      console.log('Sending data to backend:', dataToSend);

      // Update course using PATCH
      const response = await API.patch(`/courses/${id}`, dataToSend);
      console.log('Update response:', response.data);
      
      setSuccess('Course updated successfully!');
      
      // Refresh data after a delay
      setTimeout(() => {
        fetchCourseData();
      }, 1500);
      
    } catch (error) {
      console.error('Error updating course:', error);
      console.error('Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      if (error.response?.status === 401) {
        setError('Session expired. Please login again.');
        localStorage.removeItem('user');
        navigate('/login');
      } else if (error.response?.status === 500) {
        // Handle Prisma validation errors
        const serverError = error.response?.data?.error || error.response?.data?.message;
        if (serverError?.includes('categoryId') || serverError?.includes('Int')) {
          setError('Category ID must be a valid number. Please select a category again.');
        } else {
          setError(`Server error: ${serverError || 'Internal server error'}`);
        }
      } else {
        setError(error.response?.data?.message || error.message || 'Failed to update course');
      }
    } finally {
      setSaving(false);
    }
  };

  // Module management
  const handleAddModule = () => {
    setModules([...modules, {
      id: `temp-${Date.now()}`,
      title: '',
      order: modules.length + 1,
      lessons: []
    }]);
  };

  const handleRemoveModule = (index) => {
    setModules(modules.filter((_, i) => i !== index));
  };

  const handleModuleChange = (index, field, value) => {
    const updated = [...modules];
    updated[index][field] = value;
    setModules(updated);
  };

  // Lesson management
  const handleAddLesson = (moduleIndex) => {
    const updated = [...modules];
    updated[moduleIndex].lessons.push({
      id: `temp-lesson-${Date.now()}`,
      title: '',
      contentType: 'VIDEO',
      order: updated[moduleIndex].lessons.length + 1,
      contentUrl: '',
      duration: 0
    });
    setModules(updated);
  };

  const handleRemoveLesson = (moduleIndex, lessonIndex) => {
    const updated = [...modules];
    updated[moduleIndex].lessons = updated[moduleIndex].lessons.filter((_, i) => i !== lessonIndex);
    setModules(updated);
  };

  const handleLessonChange = (moduleIndex, lessonIndex, field, value) => {
    const updated = [...modules];
    updated[moduleIndex].lessons[lessonIndex][field] = value;
    setModules(updated);
  };

  const getContentTypeIcon = (type) => {
    switch(type) {
      case 'VIDEO': return <Video className="w-4 h-4" />;
      case 'PDF': return <FileText className="w-4 h-4" />;
      case 'DOC': return <File className="w-4 h-4" />;
      case 'AUDIO': return <Music className="w-4 h-4" />;
      default: return <FileQuestion className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'DRAFT': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'PENDING_APPROVAL': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'PUBLISHED': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return 'Invalid date';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading course data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link
                to="/instructor-dashboard"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Dashboard</span>
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(`/courses/${id}`)}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              >
                <Eye className="w-4 h-4" />
                Preview
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="lg:w-2/3">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Edit Course</h1>
              <p className="text-gray-600 mt-2">Update your course details and content</p>
            </div>

            {/* Error/Success Messages */}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <span className="text-red-700">{error}</span>
              </div>
            )}

            {success && (
              <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-green-700">{success}</span>
              </div>
            )}

            {/* Course Form */}
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Course Information</h2>
                
                <div className="space-y-6">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Course Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      required
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Description *
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                      required
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Price */}
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Price ($)
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                        <input
                          type="number"
                          name="price"
                          value={formData.price}
                          onChange={handleInputChange}
                          min="0"
                          step="0.01"
                          className="w-full border border-gray-300 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        />
                      </div>
                    </div>

                    {/* Category */}
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Category *
                      </label>
                      <select
                        name="categoryId"
                        value={formData.categoryId}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        required
                      >
                        <option value="">Select Category</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={String(cat.id)}> {/* Ensure value is string */}
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Status
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className={`w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${getStatusColor(formData.status)}`}
                    >
                      <option value="DRAFT">Draft</option>
                      <option value="PENDING_APPROVAL">Pending Approval</option>
                      <option value="PUBLISHED">Published</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Course Content */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Course Content</h2>
                  <button
                    type="button"
                    onClick={handleAddModule}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    Add Module
                  </button>
                </div>

                {modules.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-2xl">
                    <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No modules yet</h3>
                    <p className="text-gray-600 mb-4">Add your first module to organize your course content</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {modules.map((module, mIndex) => (
                      <div key={module.id} className="border border-gray-200 rounded-2xl overflow-hidden">
                        {/* Module Header */}
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                <span className="text-blue-600 font-semibold text-sm">{mIndex + 1}</span>
                              </div>
                              <input
                                type="text"
                                placeholder={`Module ${mIndex + 1} Title`}
                                value={module.title}
                                onChange={(e) => handleModuleChange(mIndex, 'title', e.target.value)}
                                className="bg-transparent text-lg font-semibold text-gray-900 placeholder-gray-500 focus:outline-none"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveModule(mIndex)}
                              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Lessons */}
                        <div className="p-6 space-y-4">
                          {module.lessons.map((lesson, lIndex) => (
                            <div key={lesson.id} className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-6 h-6 bg-white border border-gray-300 rounded-lg flex items-center justify-center">
                                    <span className="text-gray-600 text-xs font-medium">{lIndex + 1}</span>
                                  </div>
                                  <input
                                    type="text"
                                    placeholder="Lesson Title"
                                    value={lesson.title}
                                    onChange={(e) => handleLessonChange(mIndex, lIndex, 'title', e.target.value)}
                                    className="bg-transparent text-gray-900 placeholder-gray-500 focus:outline-none border-b border-transparent focus:border-gray-300 pb-1"
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveLesson(mIndex, lIndex)}
                                  className="p-1 text-red-500 hover:bg-red-50 rounded"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>

                              <div className="grid md:grid-cols-2 gap-3">
                                <div>
                                  <label className="text-xs font-medium text-gray-700 mb-1 block">
                                    Content Type
                                  </label>
                                  <select
                                    value={lesson.contentType}
                                    onChange={(e) => handleLessonChange(mIndex, lIndex, 'contentType', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500"
                                  >
                                    <option value="VIDEO">Video</option>
                                    <option value="PDF">PDF</option>
                                    <option value="DOC">Document</option>
                                    <option value="AUDIO">Audio</option>
                                    <option value="OTHER">Other</option>
                                  </select>
                                </div>

                                <div>
                                  <label className="text-xs font-medium text-gray-700 mb-1 block">
                                    Content URL
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="https://..."
                                    value={lesson.contentUrl}
                                    onChange={(e) => handleLessonChange(mIndex, lIndex, 'contentUrl', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500"
                                  />
                                </div>
                              </div>

                              {lesson.contentUrl && (
                                <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded-lg">
                                  <div className="flex items-center gap-2">
                                    {getContentTypeIcon(lesson.contentType)}
                                    <span className="text-sm text-green-800">
                                      Content uploaded: {lesson.contentUrl.substring(0, 50)}...
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}

                          <button
                            type="button"
                            onClick={() => handleAddLesson(mIndex)}
                            className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                          >
                            <Plus className="w-4 h-4" />
                            Add Lesson
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => navigate('/instructor-dashboard')}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-6 py-3 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Saving Changes...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Sidebar */}
          <div className="lg:w-1/3">
            <div className="space-y-6">
              {/* Course Stats */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Statistics</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Users className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Enrollments</p>
                        <p className="text-xl font-semibold text-gray-900">
                          {courseStats.enrollmentsCount}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Revenue</p>
                        <p className="text-xl font-semibold text-gray-900">
                          ${courseStats.revenue.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <Star className="w-5 h-5 text-yellow-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Rating</p>
                        <p className="text-xl font-semibold text-gray-900">
                          {courseStats.rating.toFixed(1)}
                          <span className="text-yellow-500 ml-1">★</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Created</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {formatDate(courseStats.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => navigate(`/courses/${id}`)}
                    className="w-full flex items-center justify-between p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Eye className="w-5 h-5 text-blue-600" />
                      <span>Preview Course</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>

                  <button
                    onClick={() => navigate(`/instructor/courses/${id}/analytics`)}
                    className="w-full flex items-center justify-between p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                      <span>View Analytics</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>

                  <button
                    onClick={() => navigate(`/instructor/courses/${id}/students`)}
                    className="w-full flex items-center justify-between p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-purple-600" />
                      <span>Manage Students</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Course Status */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Information</h3>
                <div className="space-y-3">
                  <div className={`px-4 py-3 rounded-lg ${getStatusColor(formData.status)}`}>
                    <p className="font-medium">Current Status</p>
                    <p className="text-sm capitalize">{formData.status.toLowerCase().replace('_', ' ')}</p>
                  </div>
                  
                  <div className="text-sm text-gray-600 space-y-2">
                    <p>
                      <span className="font-medium">Draft:</span> Only visible to you
                    </p>
                    <p>
                      <span className="font-medium">Pending Approval:</span> Submitted for review
                    </p>
                    <p>
                      <span className="font-medium">Published:</span> Live and available to students
                    </p>
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-red-800 mb-4">Danger Zone</h3>
                <p className="text-sm text-red-700 mb-4">
                  Once you delete a course, there is no going back. Please be certain.
                </p>
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
                      // Implement delete functionality
                      console.log('Delete course:', id);
                    }
                  }}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Delete Course
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseEdit;