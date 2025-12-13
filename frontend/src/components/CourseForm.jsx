import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, Trash2, Video, FileText, Music, File, FileQuestion, Upload, X, 
  BookOpen, DollarSign, Tag, Settings, Loader, AlertCircle, CheckCircle, LogIn,
  Image, Eye, Camera, ChevronRight
} from 'lucide-react';
import API from '../api/axios';

const CourseForm = ({ onCourseCreated }) => {
  const navigate = useNavigate();
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    shortDescription: '',
    priceType: 'free',
    price: 0,
    status: 'PUBLISHED',
    categoryId: '',
    thumbnail: '',
    level: 'ALL_LEVELS'
  });
  
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [modules, setModules] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInstructor, setIsInstructor] = useState(false);
  const [step, setStep] = useState(1);
  
  const fileInputRef = useRef(null);
  const thumbnailInputRef = useRef(null);
  const [currentLessonFile, setCurrentLessonFile] = useState(null);

  // Check authentication
  useEffect(() => {
    checkAuth();
  }, []);

  // Fetch categories when authenticated and is instructor
  useEffect(() => {
    if (isAuthenticated && isInstructor) {
      fetchCategories();
    }
  }, [isAuthenticated, isInstructor]);

  const checkAuth = async () => {
    try {
      const storedUser = localStorage.getItem('user');
      if (!storedUser) throw new Error('No user found');
      
      const user = JSON.parse(storedUser);
      if (!user.token) throw new Error('No token found');
      
      // Verify token by calling user endpoint
      const response = await API.get('/users/me');
      const userData = response.data;
      
      if (userData.role === 'INSTRUCTOR') {
        setIsAuthenticated(true);
        setIsInstructor(true);
      } else {
        setIsAuthenticated(true);
        setIsInstructor(false);
        setError('Only instructors can create courses. Please contact admin.');
      }
    } catch (err) {
      console.error('Auth check failed:', err);
      setIsAuthenticated(false);
      setIsInstructor(false);
    }
  };

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await API.get('/categories');
      setCategories(response.data || []);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      setError('Failed to load categories');
    } finally {
      setLoadingCategories(false);
    }
  };

  // Handle form field changes
  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Thumbnail handling - UPDATED
  const handleThumbnailChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setError('Please select a valid image file (JPEG, PNG, GIF, WebP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    setThumbnailFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setThumbnailPreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload thumbnail immediately
    await uploadThumbnail(file);
  };

  // Upload thumbnail - FIXED endpoint
  const uploadThumbnail = async (file) => {
    setUploadingThumbnail(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      
      // Use correct endpoint - remove /api prefix if axios baseURL already includes it
      const response = await API.post('/courses/upload-thumbnail', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success && response.data.url) {
        const thumbnailUrl = response.data.url;
        handleChange('thumbnail', thumbnailUrl);
        setSuccess('Thumbnail uploaded successfully!');
        return thumbnailUrl;
      } else {
        throw new Error(response.data.message || 'Upload failed');
      }
    } catch (err) {
      console.error('Thumbnail upload error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to upload thumbnail');
      return null;
    } finally {
      setUploadingThumbnail(false);
    }
  };

  const removeThumbnail = () => {
    setThumbnailFile(null);
    setThumbnailPreview('');
    handleChange('thumbnail', '');
  };

  // Module and lesson management (simplified)
  const addModule = () => {
    setModules(prev => [...prev, {
      id: Date.now(),
      title: '',
      description: '',
      lessons: [],
      order: prev.length + 1
    }]);
  };

  const updateModule = (index, field, value) => {
    setModules(prev => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  const removeModule = (index) => {
    setModules(prev => prev.filter((_, i) => i !== index));
  };

  const addLesson = (moduleIndex) => {
    setModules(prev => {
      const updated = [...prev];
      updated[moduleIndex].lessons.push({
        id: Date.now(),
        title: '',
        description: '',
        contentType: 'VIDEO',
        duration: 0,
        file: null,
        order: updated[moduleIndex].lessons.length + 1
      });
      return updated;
    });
  };

  const updateLesson = (moduleIndex, lessonIndex, field, value) => {
    setModules(prev => {
      const updated = [...prev];
      updated[moduleIndex].lessons[lessonIndex][field] = value;
      return updated;
    });
  };

  const removeLesson = (moduleIndex, lessonIndex) => {
    setModules(prev => {
      const updated = [...prev];
      updated[moduleIndex].lessons = updated[moduleIndex].lessons.filter((_, i) => i !== lessonIndex);
      return updated;
    });
  };

  // Main submit handler - UPDATED
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validation
      if (!formData.title.trim()) throw new Error('Course title is required');
      if (!formData.description.trim()) throw new Error('Description is required');
      if (!formData.categoryId) throw new Error('Category is required');
      if (!formData.thumbnail) throw new Error('Thumbnail is required');

      // Create course
      const courseData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        shortDescription: formData.shortDescription.trim() || undefined,
        price: formData.priceType === 'free' ? 0 : Number(formData.price),
        status: formData.status,
        categoryId: Number(formData.categoryId),
        thumbnail: formData.thumbnail,
        level: formData.level
      };

      console.log('Creating course with:', courseData);

      const response = await API.post('/courses', courseData);
      const createdCourse = response.data;

      console.log('Course created:', createdCourse);

      // Upload lesson files if any (in background)
      if (modules.length > 0) {
        uploadLessonFiles(createdCourse.id);
      }

      setSuccess(`Course "${createdCourse.title}" created successfully! Redirecting...`);
      
      if (onCourseCreated) {
        onCourseCreated(createdCourse);
      }

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate(`/courses/${createdCourse.id}`);
      }, 2000);

    } catch (err) {
      console.error('Create course error:', err);
      
      if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
        localStorage.removeItem('user');
        navigate('/login');
      } else if (err.response?.status === 400) {
        const errorData = err.response.data;
        if (errorData.errors) {
          const messages = errorData.errors.map(e => `${e.field}: ${e.message}`).join(', ');
          setError(messages);
        } else {
          setError(errorData.message || 'Validation error');
        }
      } else {
        setError(err.response?.data?.message || err.message || 'Failed to create course');
      }
    } finally {
      setLoading(false);
    }
  };

  // Upload lesson files in background
  const uploadLessonFiles = async (courseId) => {
    const lessonFiles = [];
    
    // Collect all lesson files
    modules.forEach((module, mIndex) => {
      module.lessons.forEach((lesson, lIndex) => {
        if (lesson.file) {
          lessonFiles.push({
            moduleIndex: mIndex,
            lessonIndex: lIndex,
            file: lesson.file,
            lesson
          });
        }
      });
    });

    // Upload each file
    for (const item of lessonFiles) {
      try {
        const formData = new FormData();
        formData.append('file', item.file);
        formData.append('lessonId', item.lesson.id);
        formData.append('courseId', courseId);
        formData.append('contentType', item.lesson.contentType);

        await API.post('/lessons/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        console.log(`Uploaded file for lesson: ${item.lesson.title}`);
      } catch (err) {
        console.error('Failed to upload lesson file:', err);
      }
    }
  };

  // Add this function for form validation before step changes
  const validateStep = (stepNumber) => {
    switch (stepNumber) {
      case 1:
        if (!formData.title.trim()) {
          setError('Please enter a course title');
          return false;
        }
        if (!formData.categoryId) {
          setError('Please select a category');
          return false;
        }
        if (!formData.thumbnail) {
          setError('Please upload a thumbnail');
          return false;
        }
        return true;
      case 2:
        // Module validation (optional)
        return true;
      default:
        return true;
    }
  };

  const goToNextStep = () => {
    if (validateStep(step)) {
      setStep(prev => Math.min(prev + 1, 3));
      setError('');
    }
  };

  const goToPrevStep = () => {
    setStep(prev => Math.max(prev - 1, 1));
    setError('');
  };

  // Login required screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12">
        <div className="max-w-md mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Course</h1>
            <p className="text-gray-600">Login required to continue</p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <LogIn className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Authentication Required</h2>
            <p className="text-gray-600 mb-6">
              Please login to create and manage courses.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-semibold shadow-lg"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Not instructor screen
  if (!isInstructor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12">
        <div className="max-w-md mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Course</h1>
            <p className="text-gray-600">Instructor access required</p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-amber-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Instructor Access Required</h2>
            <p className="text-gray-600 mb-6">
              You need to be an approved instructor to create courses.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/profile')}
                className="w-full py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl hover:from-amber-700 hover:to-orange-700 transition-all font-semibold"
              >
                Apply as Instructor
              </button>
              <button
                onClick={() => navigate('/courses')}
                className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-semibold"
              >
                Browse Courses
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-3 bg-white rounded-2xl px-6 py-3 shadow-sm border border-gray-200">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Create New Course</h1>
              <p className="text-sm text-gray-600">Step {step} of 3</p>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8 bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            {['Basic Info', 'Content', 'Review'].map((label, index) => (
              <div key={label} className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                  step > index + 1 ? 'bg-green-500 text-white' :
                  step === index + 1 ? 'bg-blue-600 text-white' :
                  'bg-gray-200 text-gray-600'
                }`}>
                  {step > index + 1 ? '✓' : index + 1}
                </div>
                <span className={`text-sm font-medium ${
                  step >= index + 1 ? 'text-gray-900' : 'text-gray-500'
                }`}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            <span className="text-green-700">{success}</span>
          </div>
        )}

        {/* Hidden file inputs */}
        <input 
          type="file" 
          ref={thumbnailInputRef} 
          onChange={handleThumbnailChange} 
          className="hidden" 
          accept="image/*"
        />
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileSelect} 
          className="hidden" 
          accept="video/*,audio/*,image/*,application/pdf,.doc,.docx,.txt,.ppt,.pptx"
        />

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="p-8 space-y-8">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Course Details
                </h2>
                
                {/* Thumbnail Upload */}
                <div className="mb-8">
                  <label className="block text-sm font-semibold text-gray-900 mb-4">
                    Course Thumbnail *
                  </label>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      {thumbnailPreview ? (
                        <div className="relative">
                          <img 
                            src={thumbnailPreview} 
                            alt="Thumbnail preview" 
                            className="w-full h-64 object-cover rounded-xl border-2 border-gray-200"
                          />
                          <div className="absolute top-2 right-2 flex gap-2">
                            <button
                              type="button"
                              onClick={() => thumbnailInputRef.current?.click()}
                              className="p-2 bg-white rounded-lg shadow hover:bg-gray-50"
                            >
                              <Camera className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={removeThumbnail}
                              className="p-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div
                          onClick={() => thumbnailInputRef.current?.click()}
                          className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all"
                        >
                          {uploadingThumbnail ? (
                            <>
                              <Loader className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
                              <div className="text-sm text-blue-600">Uploading...</div>
                            </>
                          ) : (
                            <>
                              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                              <div className="font-medium text-gray-700 mb-1">Upload Thumbnail</div>
                              <div className="text-sm text-gray-500">16:9 ratio, max 5MB</div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="space-y-4">
                      <h3 className="font-semibold text-gray-900">Guidelines</h3>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li className="flex items-start gap-2">
                          <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">✓</div>
                          <span>Use bright, engaging images</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">✓</div>
                          <span>1280x720px recommended</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">✓</div>
                          <span>Add text overlay if needed</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Course Title *
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => handleChange('title', e.target.value)}
                        placeholder="Enter course title"
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Category *
                      </label>
                      <select
                        value={formData.categoryId}
                        onChange={(e) => handleChange('categoryId', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                        disabled={loadingCategories}
                      >
                        <option value="">{loadingCategories ? 'Loading...' : 'Select Category'}</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Course Level
                      </label>
                      <select
                        value={formData.level}
                        onChange={(e) => handleChange('level', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="ALL_LEVELS">All Levels</option>
                        <option value="BEGINNER">Beginner</option>
                        <option value="INTERMEDIATE">Intermediate</option>
                        <option value="ADVANCED">Advanced</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Description *
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => handleChange('description', e.target.value)}
                        placeholder="Describe what students will learn..."
                        rows={5}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Short Description
                      </label>
                      <textarea
                        value={formData.shortDescription}
                        onChange={(e) => handleChange('shortDescription', e.target.value)}
                        placeholder="Brief summary (optional)"
                        rows={2}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Status
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => handleChange('status', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="DRAFT">Draft</option>
                        <option value="PUBLISHED">Published</option>
                        <option value="PENDING_APPROVAL">Pending Approval</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Pricing */}
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Pricing</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-3">
                        Price Type
                      </label>
                      <div className="flex gap-4">
                        <button
                          type="button"
                          onClick={() => handleChange('priceType', 'free')}
                          className={`px-6 py-3 rounded-lg border-2 ${
                            formData.priceType === 'free'
                              ? 'border-green-500 bg-green-50 text-green-700'
                              : 'border-gray-300 bg-gray-50 text-gray-600 hover:border-gray-400'
                          }`}
                        >
                          Free
                        </button>
                        <button
                          type="button"
                          onClick={() => handleChange('priceType', 'paid')}
                          className={`px-6 py-3 rounded-lg border-2 ${
                            formData.priceType === 'paid'
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-300 bg-gray-50 text-gray-600 hover:border-gray-400'
                          }`}
                        >
                          Paid
                        </button>
                      </div>
                    </div>

                    {formData.priceType === 'paid' && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                          Price ($)
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                          <input
                            type="number"
                            value={formData.price}
                            onChange={(e) => handleChange('price', e.target.value)}
                            min={0}
                            step="0.01"
                            className="w-full border border-gray-300 rounded-lg pl-8 pr-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="49.99"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-end pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={goToNextStep}
                  disabled={!formData.title || !formData.categoryId || !formData.thumbnail}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Content */}
          {step === 2 && (
            <div className="p-8">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Course Content</h2>
                <p className="text-gray-600">Add modules and lessons to your course</p>
              </div>

              {/* Modules */}
              <div className="space-y-6">
                {modules.map((module, mIndex) => (
                  <div key={module.id} className="border border-gray-200 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <span className="text-blue-600 font-semibold">{mIndex + 1}</span>
                        </div>
                        <input
                          type="text"
                          value={module.title}
                          onChange={(e) => updateModule(mIndex, 'title', e.target.value)}
                          placeholder="Module Title"
                          className="text-lg font-semibold bg-transparent focus:outline-none"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeModule(mIndex)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Lessons */}
                    <div className="space-y-3">
                      {module.lessons.map((lesson, lIndex) => (
                        <div key={lesson.id} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-white border border-gray-300 rounded flex items-center justify-center">
                                <span className="text-sm">{lIndex + 1}</span>
                              </div>
                              <input
                                type="text"
                                value={lesson.title}
                                onChange={(e) => updateLesson(mIndex, lIndex, 'title', e.target.value)}
                                placeholder="Lesson Title"
                                className="bg-transparent focus:outline-none"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => removeLesson(mIndex, lIndex)}
                              className="text-red-500 hover:text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          
                          <div className="grid md:grid-cols-2 gap-3">
                            <div>
                              <select
                                value={lesson.contentType}
                                onChange={(e) => updateLesson(mIndex, lIndex, 'contentType', e.target.value)}
                                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                              >
                                <option value="VIDEO">Video</option>
                                <option value="PDF">PDF</option>
                                <option value="AUDIO">Audio</option>
                                <option value="DOC">Document</option>
                              </select>
                            </div>
                            <div>
                              {lesson.file ? (
                                <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded px-3 py-2">
                                  <span className="text-sm text-green-800 truncate">{lesson.file.name}</span>
                                  <button
                                    type="button"
                                    onClick={() => updateLesson(mIndex, lIndex, 'file', null)}
                                    className="text-red-500"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setCurrentLessonFile({ mIndex, lIndex });
                                    fileInputRef.current?.click();
                                  }}
                                  className="w-full border border-dashed border-gray-300 rounded px-3 py-2 text-sm hover:border-blue-500 hover:bg-blue-50"
                                >
                                  + Add File
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      <button
                        type="button"
                        onClick={() => addLesson(mIndex)}
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
                      >
                        <Plus className="w-4 h-4" />
                        Add Lesson
                      </button>
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addModule}
                  className="w-full border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-blue-500 hover:bg-blue-50 transition-all"
                >
                  <div className="text-center">
                    <Plus className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                    <div className="font-medium text-gray-700">Add Module</div>
                    <div className="text-sm text-gray-500">Organize your course content</div>
                  </div>
                </button>
              </div>

              {/* Navigation */}
              <div className="flex justify-between pt-8 mt-8 border-t border-gray-200">
                <button
                  type="button"
                  onClick={goToPrevStep}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={goToNextStep}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Review
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div className="p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Review Course</h2>
              
              <div className="space-y-6">
                {/* Course Summary */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Course Information</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div>
                        <div className="text-sm text-gray-600">Title</div>
                        <div className="font-medium">{formData.title}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Category</div>
                        <div className="font-medium">
                          {categories.find(c => c.id == formData.categoryId)?.name || 'Not selected'}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Level</div>
                        <div className="font-medium">{formData.level}</div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <div className="text-sm text-gray-600">Price</div>
                        <div className="font-medium">
                          {formData.priceType === 'free' ? 'Free' : `$${formData.price}`}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Status</div>
                        <div className="font-medium">{formData.status}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Thumbnail</div>
                        <div className="font-medium">
                          {formData.thumbnail ? 'Uploaded' : 'Not uploaded'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Thumbnail Preview */}
                {thumbnailPreview && (
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Thumbnail Preview</h3>
                    <div className="max-w-md">
                      <img 
                        src={thumbnailPreview} 
                        alt="Course thumbnail" 
                        className="w-full h-auto rounded-lg"
                      />
                    </div>
                  </div>
                )}

                {/* Modules Summary */}
                {modules.length > 0 && (
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Course Content</h3>
                    <div className="space-y-3">
                      {modules.map((module, index) => (
                        <div key={module.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="font-medium mb-2">
                            Module {index + 1}: {module.title || 'Untitled'}
                          </div>
                          <div className="text-sm text-gray-600">
                            {module.lessons.length} lesson(s)
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={goToPrevStep}
                    className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-semibold"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !formData.thumbnail}
                    className="flex-1 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 font-semibold shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create Course'
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default CourseForm;