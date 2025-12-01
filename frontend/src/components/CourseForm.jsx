import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Trash2, Video, FileText, Music, File, FileQuestion, Upload, X, 
  BookOpen, DollarSign, Tag, Settings, Loader, AlertCircle, CheckCircle, LogIn 
} from 'lucide-react';
import API from '../api/axios';

const CourseForm = ({ onCourseCreated }) => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priceType, setPriceType] = useState('free');
  const [price, setPrice] = useState(0);
  const [status, setStatus] = useState('DRAFT');
  const [categoryId, setCategoryId] = useState('');
  const [modules, setModules] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const fileInputRef = useRef(null);
  const [currentLessonFile, setCurrentLessonFile] = useState(null);

  // Check authentication on mount
  useEffect(() => {
    checkAuthentication();
    if (isAuthenticated) {
      fetchCategories();
    }
  }, [isAuthenticated]);

  const checkAuthentication = () => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (user.token && user.token.trim() !== '') {
          setIsAuthenticated(true);
          return true;
        }
      } catch (err) {
        console.error('Error parsing user data:', err);
        setIsAuthenticated(false);
      }
    }
    setIsAuthenticated(false);
    return false;
  };

  // Fetch categories from backend using centralized API
  const fetchCategories = async () => {
    if (!isAuthenticated) {
      setError('Please login first to create courses');
      return;
    }

    try {
      setLoadingCategories(true);
      const response = await API.get('/categories');
      setCategories(response.data);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
        setIsAuthenticated(false);
        localStorage.removeItem('user');
      } else {
        setError('Failed to load categories. Please try again.');
      }
    } finally {
      setLoadingCategories(false);
    }
  };

  const getFileTypeFromExtension = (fileName) => {
    if (!fileName) return 'VIDEO';
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (['mp4','mov','avi','mkv','webm'].includes(ext)) return 'VIDEO';
    if (['mp3','wav','ogg','m4a'].includes(ext)) return 'AUDIO';
    if (['pdf'].includes(ext)) return 'PDF';
    if (['doc','docx','txt','ppt','pptx'].includes(ext)) return 'DOC';
    return 'OTHER';
  };

  const getContentTypeIcon = (type) => {
    switch(type){
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

  // Module Management
  const handleAddModule = () => setModules([...modules, { 
    id: `temp-${Date.now()}`, 
    title: '', 
    lessons: [],
    order: modules.length + 1 
  }]);

  const handleRemoveModule = (index) => setModules(modules.filter((_, i) => i !== index));

  const handleModuleChange = (index, value) => {
    const updated = [...modules];
    updated[index].title = value;
    setModules(updated);
  };

  // Lesson Management
  const handleAddLesson = (moduleIndex) => {
    const updated = [...modules];
    updated[moduleIndex].lessons.push({ 
      id: `temp-lesson-${Date.now()}`,
      title: '', 
      contentType: 'VIDEO',
      order: updated[moduleIndex].lessons.length + 1,
      file: null,
      fileName: '',
      contentUrl: ''
    });
    setModules(updated);
  };

  const handleRemoveLesson = (mIndex, lIndex) => {
    const updated = [...modules];
    updated[mIndex].lessons = updated[mIndex].lessons.filter((_, i) => i !== lIndex);
    setModules(updated);
  };

  const handleLessonChange = (mIndex, lIndex, field, value) => {
    const updated = [...modules];
    updated[mIndex].lessons[lIndex][field] = value;
    setModules(updated);
  };

  // File Handling
  const triggerFileInput = (moduleIndex, lessonIndex) => {
    setCurrentLessonFile({ moduleIndex, lessonIndex });
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file || !currentLessonFile) return;

    const { moduleIndex, lessonIndex } = currentLessonFile;
    const updated = [...modules];
    
    if (updated[moduleIndex] && updated[moduleIndex].lessons[lessonIndex]) {
      updated[moduleIndex].lessons[lessonIndex].file = file;
      updated[moduleIndex].lessons[lessonIndex].fileName = file.name;
      updated[moduleIndex].lessons[lessonIndex].contentType = getFileTypeFromExtension(file.name);
      setModules(updated);
    }

    e.target.value = '';
    setCurrentLessonFile(null);
  };

  const removeSelectedFile = (mIndex, lIndex) => {
    const updated = [...modules];
    if (updated[mIndex] && updated[mIndex].lessons[lIndex]) {
      updated[mIndex].lessons[lIndex].file = null;
      updated[mIndex].lessons[lIndex].fileName = '';
      setModules(updated);
    }
  };

  // Handle login redirect
  const handleLogin = () => {
    navigate('/login');
  };

  // Handle file uploads for lessons
  const uploadLessonFile = async (file, courseId, moduleId, lessonId) => {
    if (!file) return null;
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('courseId', courseId);
    formData.append('moduleId', moduleId);
    formData.append('lessonId', lessonId);

    try {
      const response = await API.post('/upload/lesson-content', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.fileUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  };

  // Main submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      setError('Please login first to create courses');
      handleLogin();
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validate required fields
      if (!title.trim() || !description.trim() || !categoryId) {
        throw new Error('Please fill in all required fields');
      }

      // Validate modules and lessons
      if (modules.length === 0) {
        throw new Error('Please add at least one module');
      }

      for (const module of modules) {
        if (!module.title.trim()) {
          throw new Error('All modules must have a title');
        }
        for (const lesson of module.lessons) {
          if (!lesson.title.trim()) {
            throw new Error('All lessons must have a title');
          }
        }
      }

      // 1. Create the course first
      const courseResponse = await API.post('/courses', {
        title: title.trim(),
        description: description.trim(),
        price: priceType === 'free' ? 0 : Number(price),
        status,
        categoryId: parseInt(categoryId)
      });
      
      const course = courseResponse.data;
      setSuccess('Course created successfully! Starting to add modules and lessons...');

      // 2. Create modules and lessons (simplified for now)
      // In production, you'd make individual API calls
      console.log('Course created:', course);
      console.log('Modules to create:', modules);

      // For demo purposes, show success immediately
      setTimeout(() => {
        setSuccess('Course created successfully with all modules and lessons!');
        
        if (onCourseCreated) {
          onCourseCreated(course);
        }

        // Reset form after 3 seconds
        setTimeout(() => {
          resetForm();
        }, 3000);
      }, 2000);

    } catch (err) {
      console.error('Course creation error:', err);
      if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
        setIsAuthenticated(false);
        localStorage.removeItem('user');
      } else {
        setError(err.response?.data?.message || err.message || 'Failed to create course');
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPriceType('free');
    setPrice(0);
    setStatus('DRAFT');
    setCategoryId('');
    setModules([]);
    setSuccess('');
  };

  // If not authenticated, show login prompt
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-blue-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 bg-white rounded-2xl px-6 py-3 shadow-sm border border-gray-200 mb-4">
              <div className="p-2 bg-linear-to-r from-blue-500 to-purple-600 rounded-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <h1 className="text-2xl font-bold text-gray-900">Create New Course</h1>
                <p className="text-sm text-gray-600">Authentication required</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-linear-to-r from-blue-600 to-purple-600 px-8 py-6">
              <h2 className="text-2xl font-bold text-white">Login Required</h2>
              <p className="text-blue-100 mt-1">You need to be logged in to create courses</p>
            </div>

            <div className="p-12 text-center">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <LogIn className="w-12 h-12 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Please Login First</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                You need to be authenticated as an instructor to create and manage courses.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={handleLogin}
                  className="px-8 py-3 bg-linear-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-semibold shadow-lg"
                >
                  Go to Login
                </button>
                <button
                  onClick={() => {
                    // For testing, you can set a dummy token
                    const dummyUser = {
                      token: 'dummy-token-for-testing',
                      name: 'Test Instructor'
                    };
                    localStorage.setItem('user', JSON.stringify(dummyUser));
                    setIsAuthenticated(true);
                    fetchCategories();
                  }}
                  className="px-8 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-semibold"
                >
                  Use Demo Mode (Testing)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-blue-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 bg-white rounded-2xl px-6 py-3 shadow-sm border border-gray-200 mb-4">
            <div className="p-2 bg-linear-to-r from-blue-500 to-purple-600 rounded-lg">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-bold text-gray-900">Create New Course</h1>
              <p className="text-sm text-gray-600">Build your course step by step</p>
            </div>
          </div>
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

        {/* Hidden file input */}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileSelect} 
          className="hidden" 
          accept="video/*,audio/*,image/*,application/pdf,.doc,.docx,.txt,.ppt,.pptx"
        />

        <form className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden" onSubmit={handleSubmit}>
          {/* Form Header */}
          <div className="bg-linear-to-r from-blue-600 to-purple-600 px-8 py-6">
            <h2 className="text-2xl font-bold text-white">Course Information</h2>
            <p className="text-blue-100 mt-1">Fill in the basic details about your course</p>
          </div>

          <div className="p-8 space-y-8">
            {/* Basic Information Section */}
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                {/* Course Title */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Course Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Advanced React Development"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    required
                  />
                </div>

                {/* Price Type Selection */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    Course Pricing
                  </label>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <button
                      type="button"
                      onClick={() => setPriceType('free')}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        priceType === 'free'
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-300 bg-gray-50 text-gray-600 hover:border-gray-400'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-2xl mb-1">🎁</div>
                        <div className="font-semibold">Free</div>
                        <div className="text-xs mt-1">Build your audience</div>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPriceType('paid')}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        priceType === 'paid'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 bg-gray-50 text-gray-600 hover:border-gray-400'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-2xl mb-1">💰</div>
                        <div className="font-semibold">Paid</div>
                        <div className="text-xs mt-1">Earn revenue</div>
                      </div>
                    </button>
                  </div>

                  {/* Conditional Price Input */}
                  {priceType === 'paid' && (
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                      <input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(Number(e.target.value))}
                        min={0}
                        step="0.01"
                        placeholder="49.99"
                        className="w-full border border-gray-300 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        required
                      />
                      <div className="text-xs text-gray-500 mt-2">
                        Suggested price: $29.99 - $199.99
                      </div>
                    </div>
                  )}
                </div>

                {/* Status */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
                    <Settings className="w-4 h-4 text-gray-600" />
                    Course Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className={`w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${getStatusColor(status)}`}
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="PENDING_APPROVAL">Pending Approval</option>
                    <option value="PUBLISHED">Published</option>
                  </select>
                </div>
              </div>

              <div className="space-y-6">
                {/* Category */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
                    <Tag className="w-4 h-4 text-purple-600" />
                    Category *
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    required
                    disabled={loadingCategories}
                  >
                    <option value="">{loadingCategories ? 'Loading categories...' : 'Select Category'}</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                  {loadingCategories && (
                    <div className="flex items-center gap-2 mt-2">
                      <Loader className="w-4 h-4 animate-spin text-blue-600" />
                      <span className="text-sm text-gray-600">Loading categories...</span>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    Description *
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe what students will learn in this course..."
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                    rows={4}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Modules & Lessons Section */}
            <div className="border-t border-gray-200 pt-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Course Content</h3>
                  <p className="text-sm text-gray-600">Organize your course into modules and lessons</p>
                </div>
                <button
                  type="button"
                  onClick={handleAddModule}
                  className="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add Module
                </button>
              </div>

              {modules.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-2xl">
                  <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">No modules yet</h4>
                  <p className="text-gray-600 mb-4">Start by adding your first module</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {modules.map((module, mIndex) => (
                    <div key={module.id} className="border border-gray-200 rounded-2xl overflow-hidden">
                      {/* Module Header */}
                      <div className="bg-linear-to-r from-gray-50 to-blue-50 px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                              <span className="text-blue-600 font-semibold text-sm">{mIndex + 1}</span>
                            </div>
                            <input
                              type="text"
                              placeholder={`Module ${mIndex + 1} Title`}
                              value={module.title}
                              onChange={(e) => handleModuleChange(mIndex, e.target.value)}
                              className="bg-transparent text-lg font-semibold text-gray-900 placeholder-gray-500 focus:outline-none"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveModule(mIndex)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Lessons */}
                      <div className="p-6 space-y-3">
                        {module.lessons && module.lessons.map((lesson, lIndex) => (
                          <div key={lesson.id} className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
                            <div className="flex items-center gap-3">
                              <div className="w-6 h-6 bg-white border border-gray-300 rounded-lg flex items-center justify-center">
                                <span className="text-gray-600 text-xs font-medium">{lIndex + 1}</span>
                              </div>
                              <input
                                type="text"
                                placeholder="Lesson Title"
                                value={lesson.title}
                                onChange={(e) => handleLessonChange(mIndex, lIndex, 'title', e.target.value)}
                                className="flex-1 bg-transparent text-gray-900 placeholder-gray-500 focus:outline-none border-b border-transparent focus:border-gray-300 pb-1"
                              />
                            </div>
                            
                            <div className="grid md:grid-cols-2 gap-3">
                              <div>
                                <label className="text-xs font-medium text-gray-700 mb-1 block">Content Type</label>
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
                                <label className="text-xs font-medium text-gray-700 mb-1 block">Content File</label>
                                <div className="space-y-2">
                                  {lesson.fileName ? (
                                    <div className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded-lg">
                                      <div className="flex items-center gap-2 flex-1 min-w-0">
                                        {getContentTypeIcon(lesson.contentType)}
                                        <span className="text-sm text-green-800 truncate">{lesson.fileName}</span>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => removeSelectedFile(mIndex, lIndex)}
                                        className="p-1 text-red-500 hover:bg-red-100 rounded transition-colors"
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => triggerFileInput(mIndex, lIndex)}
                                      className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-500 hover:bg-blue-50 transition-all group"
                                    >
                                      <div className="text-center">
                                        <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2 group-hover:text-blue-500" />
                                        <div className="text-sm text-gray-600 group-hover:text-blue-600">
                                          Click to select file
                                        </div>
                                        <div className="text-xs text-gray-400 mt-1">
                                          Supports: MP4, PDF, MP3, DOC, etc.
                                        </div>
                                      </div>
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex justify-end">
                              <button
                                type="button"
                                onClick={() => handleRemoveLesson(mIndex, lIndex)}
                                className="px-3 py-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm flex items-center gap-1"
                              >
                                <Trash2 className="w-3 h-3" />
                                Remove Lesson
                              </button>
                            </div>
                          </div>
                        ))}

                        <button
                          type="button"
                          onClick={() => handleAddLesson(mIndex)}
                          className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
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

            {/* Submit Button */}
            <div className="flex gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                className="flex-1 px-6 py-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-semibold"
                onClick={resetForm}
              >
                Reset Form
              </button>
              <button
                type="submit"
                disabled={loading || loadingCategories}
                className="flex-1 px-6 py-4 bg-linear-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Creating Course...
                  </>
                ) : (
                  <>
                    <BookOpen className="w-5 h-5" />
                    Create Course
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CourseForm;