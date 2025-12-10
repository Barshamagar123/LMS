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
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [priceType, setPriceType] = useState('free');
  const [price, setPrice] = useState(0);
  const [status, setStatus] = useState('PUBLISHED'); // Changed to PUBLISHED so it shows immediately
  const [categoryId, setCategoryId] = useState('');
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [modules, setModules] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInstructor, setIsInstructor] = useState(false);
  const fileInputRef = useRef(null);
  const thumbnailInputRef = useRef(null);
  const [currentLessonFile, setCurrentLessonFile] = useState(null);
  const [step, setStep] = useState(1); // For multi-step form

  // Check authentication and instructor status
  useEffect(() => {
    checkAuthentication();
    if (isAuthenticated && isInstructor) {
      fetchCategories();
      fetchInstructorInfo();
    }
  }, [isAuthenticated, isInstructor]);

  const checkAuthentication = () => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (user.token && user.token.trim() !== '') {
          setIsAuthenticated(true);
          // Check if user is an instructor
          if (user.role === 'INSTRUCTOR' || user.isInstructor) {
            setIsInstructor(true);
          }
          return true;
        }
      } catch (err) {
        console.error('Error parsing user data:', err);
        setIsAuthenticated(false);
        setIsInstructor(false);
      }
    }
    setIsAuthenticated(false);
    setIsInstructor(false);
    return false;
  };

  const fetchInstructorInfo = async () => {
    try {
      const response = await API.get('/users/me');
      if (response.data.role !== 'INSTRUCTOR') {
        setError('You must be an approved instructor to create courses');
        setIsInstructor(false);
      }
    } catch (err) {
      console.error('Failed to fetch user info:', err);
    }
  };

  // Fetch categories from backend
  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await API.get('/categories');
      setCategories(response.data || []);
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

  // Handle thumbnail upload - FIXED VERSION
  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    console.log('📁 File selected for thumbnail:', {
      name: file.name,
      type: file.type,
      size: (file.size / 1024 / 1024).toFixed(2) + 'MB'
    });

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setError(`Invalid file type: ${file.type}. Please select JPEG, PNG, GIF, or WebP.`);
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError(`Image size (${(file.size / (1024 * 1024)).toFixed(2)}MB) exceeds 5MB limit`);
      return;
    }

    setThumbnailFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      console.log('✅ Thumbnail preview created');
      setThumbnailPreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Auto-upload thumbnail
    uploadThumbnail(file);
  };

  const uploadThumbnail = async (file) => {
    setUploadingThumbnail(true);
    setError('');
    
    try {
      console.log('🚀 Starting thumbnail upload...');
      
      const formData = new FormData();
      formData.append('file', file);
      
      // IMPORTANT: Use the correct endpoint
      const endpoint = '/api/courses/upload-thumbnail';
      console.log('📤 Sending to:', endpoint);
      
      // Get user token
      const storedUser = localStorage.getItem('user');
      let token = '';
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          token = user.token;
          console.log('🔑 Token found:', token ? 'Yes' : 'No');
        } catch (err) {
          console.error('Error parsing user token:', err);
        }
      }

      console.log('📤 Request details:', {
        endpoint,
        fileSize: file.size,
        fileName: file.name,
        hasToken: !!token
      });

      const response = await API.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        timeout: 30000,
      });

      console.log('✅ Thumbnail upload response:', response.data);
      
      if (response.data.success && response.data.url) {
        const thumbnailUrl = response.data.url;
        
        // Log the thumbnail URL format
        console.log('🖼️ Thumbnail URL received:', {
          url: thumbnailUrl,
          isRelative: thumbnailUrl.startsWith('/'),
          isFullUrl: thumbnailUrl.startsWith('http'),
          length: thumbnailUrl.length
        });
        
        setThumbnail(thumbnailUrl);
        setSuccess('Thumbnail uploaded successfully!');
        return thumbnailUrl;
      } else {
        throw new Error(response.data.message || 'Upload failed - no URL returned');
      }
    } catch (err) {
      console.error('❌ Thumbnail upload failed:', err);
      console.error('📊 Error details:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
        config: err.config
      });
      
      // Detailed error messages
      if (err.response?.status === 413) {
        setError('File too large. Maximum size is 5MB for thumbnails');
      } else if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
        setIsAuthenticated(false);
        localStorage.removeItem('user');
        navigate('/login');
      } else if (err.response?.status === 400 && err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.message.includes('Network Error')) {
        setError('Cannot connect to server. Please check your connection.');
      } else if (err.code === 'ECONNABORTED') {
        setError('Upload timeout. Please try a smaller file.');
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError(err.message || 'Failed to upload thumbnail. Please try again.');
      }
      
      // Reset on error
      setThumbnail(null);
      setThumbnailPreview('');
      setThumbnailFile(null);
      return null;
    } finally {
      setUploadingThumbnail(false);
    }
  };

  const removeThumbnail = () => {
    setThumbnail(null);
    setThumbnailPreview('');
    setThumbnailFile(null);
    setError('');
  };

  const triggerThumbnailInput = () => {
    thumbnailInputRef.current?.click();
  };

  // Get file type and icon
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

  // Module and Lesson Management
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

  // Main submit handler - FIXED VERSION
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated || !isInstructor) {
      setError('Please login as an instructor first');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validation
      if (!title.trim()) {
        throw new Error('Please enter a course title');
      }

      if (!description.trim()) {
        throw new Error('Please enter a course description');
      }

      if (!categoryId) {
        throw new Error('Please select a category');
      }

      if (!thumbnail) {
        throw new Error('Please upload a course thumbnail');
      }

      console.log('📝 Creating course with data:', {
        title: title.trim(),
        description: description.trim(),
        shortDescription: shortDescription.trim() || null,
        price: priceType === 'free' ? 0 : Number(price),
        status: 'PUBLISHED', // Force published to show in courses list
        categoryId: parseInt(categoryId),
        thumbnail: thumbnail,
        thumbnailDetails: {
          url: thumbnail,
          isRelative: thumbnail?.startsWith('/'),
          isFullUrl: thumbnail?.startsWith('http')
        }
      });

      // Get user token for request
      const storedUser = localStorage.getItem('user');
      let token = '';
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          token = user.token;
        } catch (err) {
          console.error('Error parsing user token:', err);
        }
      }

      // Create course - IMPORTANT: Send as JSON
      const courseResponse = await API.post('/courses', {
        title: title.trim(),
        description: description.trim(),
        shortDescription: shortDescription.trim() || null,
        price: priceType === 'free' ? 0 : Number(price),
        status: 'PUBLISHED', // Force published
        categoryId: parseInt(categoryId),
        thumbnail: thumbnail,
        level: 'ALL_LEVELS' // Default level
      }, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Course creation response:', courseResponse.data);
      
      const createdCourse = courseResponse.data.course || courseResponse.data.data || courseResponse.data;
      
      // Log the created course details
      console.log('📊 Created course details:', {
        id: createdCourse.id,
        title: createdCourse.title,
        thumbnail: createdCourse.thumbnail,
        thumbnailUrl: createdCourse.thumbnailUrl,
        status: createdCourse.status,
        allFields: Object.keys(createdCourse)
      });
      
      if (createdCourse.id) {
        setSuccess(`Course "${createdCourse.title}" created successfully! Redirecting...`);
        
        // Call the callback if provided
        if (onCourseCreated) {
          onCourseCreated(createdCourse);
        }
        
        // Redirect to courses page after 3 seconds
        setTimeout(() => {
          navigate('/courses');
        }, 3000);
      } else {
        throw new Error('Course creation failed - no course ID returned');
      }

    } catch (err) {
      console.error('❌ Course creation error:', err);
      console.error('📊 Error details:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
        config: err.config
      });
      
      if (err.response?.status === 401) {
        setError('Session expired. Please login again.');
        setIsAuthenticated(false);
        localStorage.removeItem('user');
        navigate('/login');
      } else if (err.response?.status === 400) {
        // Show validation errors
        const errorData = err.response.data;
        if (errorData.errors && Array.isArray(errorData.errors)) {
          const errorMessages = errorData.errors.map(e => `${e.field}: ${e.message}`).join(', ');
          setError(`Validation errors: ${errorMessages}`);
        } else if (errorData.message) {
          setError(errorData.message);
        } else {
          setError('Invalid data. Please check your inputs.');
        }
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
    setShortDescription('');
    setPriceType('free');
    setPrice(0);
    setStatus('PUBLISHED');
    setCategoryId('');
    setThumbnail(null);
    setThumbnailPreview('');
    setThumbnailFile(null);
    setModules([]);
    setSuccess('');
    setError('');
    setStep(1);
  };

  // Debug function
  const debugThumbnail = () => {
    console.log('🔍 Thumbnail debug info:', {
      thumbnail,
      thumbnailFile,
      thumbnailPreview: thumbnailPreview?.substring(0, 50) + '...',
      hasThumbnail: !!thumbnail,
      thumbnailType: typeof thumbnail,
      thumbnailLength: thumbnail?.length
    });
    
    // Test if thumbnail URL is accessible
    if (thumbnail) {
      fetch(thumbnail, { method: 'HEAD' })
        .then(response => {
          console.log('✅ Thumbnail URL is accessible:', response.ok);
        })
        .catch(error => {
          console.error('❌ Thumbnail URL is not accessible:', error);
        });
    }
  };

  // Login required screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 bg-white rounded-2xl px-6 py-3 shadow-sm border border-gray-200 mb-4">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <h1 className="text-2xl font-bold text-gray-900">Create New Course</h1>
                <p className="text-sm text-gray-600">Authentication required</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
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
              <button
                onClick={() => navigate('/login')}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-semibold shadow-lg"
              >
                Go to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Not an instructor screen
  if (!isInstructor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 bg-white rounded-2xl px-6 py-3 shadow-sm border border-gray-200 mb-4">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <h1 className="text-2xl font-bold text-gray-900">Create New Course</h1>
                <p className="text-sm text-gray-600">Instructor access required</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-amber-600 to-orange-600 px-8 py-6">
              <h2 className="text-2xl font-bold text-white">Instructor Access Required</h2>
              <p className="text-amber-100 mt-1">You need to be an approved instructor</p>
            </div>

            <div className="p-12 text-center">
              <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <BookOpen className="w-12 h-12 text-amber-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Become an Instructor</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                You need to apply and be approved as an instructor to create courses.
                Contact the administrator or apply through your profile.
              </p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => navigate('/profile')}
                  className="px-8 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl hover:from-amber-700 hover:to-orange-700 transition-all font-semibold"
                >
                  Apply as Instructor
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="px-8 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-semibold"
                >
                  Back to Home
                </button>
              </div>
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
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 bg-white rounded-2xl px-6 py-3 shadow-sm border border-gray-200 mb-4">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-bold text-gray-900">Create New Course</h1>
              <p className="text-sm text-gray-600">Build your course step by step</p>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= stepNum ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                  {stepNum}
                </div>
                {stepNum < 3 && (
                  <div className={`w-16 h-1 mx-2 ${step > stepNum ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Basic Info</span>
            <span>Content</span>
            <span>Review</span>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span className="text-red-700 font-semibold">Error</span>
            </div>
            <div className="text-red-700">{error}</div>
            <button
              onClick={debugThumbnail}
              className="mt-2 text-sm text-blue-600 hover:text-blue-800"
            >
              Debug Thumbnail (Check Console)
            </button>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
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

        <form className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden" onSubmit={handleSubmit}>
          {/* Form Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
            <h2 className="text-2xl font-bold text-white">Course Information</h2>
            <p className="text-blue-100 mt-1">Fill in the basic details about your course</p>
          </div>

          <div className="p-8 space-y-8">
            {/* Step 1: Basic Information */}
            {step === 1 && (
              <>
                {/* Thumbnail Upload Section */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
                    <Camera className="w-4 h-4 text-purple-600" />
                    Course Thumbnail *
                    {thumbnail && (
                      <span className="text-xs font-normal text-green-600 ml-2 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Uploaded
                      </span>
                    )}
                  </label>
                  
                  <div className="grid md:grid-cols-2 gap-8">
                    {/* Upload Area */}
                    <div>
                      {thumbnailPreview ? (
                        <div className="relative">
                          <div className="border-2 border-gray-200 rounded-xl overflow-hidden">
                            <img 
                              src={thumbnailPreview} 
                              alt="Thumbnail preview" 
                              className="w-full h-64 object-cover"
                            />
                          </div>
                          <div className="absolute top-3 right-3 flex gap-2">
                            <button
                              type="button"
                              onClick={triggerThumbnailInput}
                              className="p-2 bg-white/80 backdrop-blur-sm rounded-lg hover:bg-white transition-colors shadow-sm"
                              title="Change thumbnail"
                            >
                              <Camera className="w-4 h-4 text-gray-700" />
                            </button>
                            <button
                              type="button"
                              onClick={removeThumbnail}
                              className="p-2 bg-red-500/80 backdrop-blur-sm text-white rounded-lg hover:bg-red-600 transition-colors shadow-sm"
                              title="Remove thumbnail"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          {thumbnail && (
                            <div className="absolute bottom-3 left-3 right-3 bg-black/70 text-white text-xs p-2 rounded opacity-0 hover:opacity-100 transition-opacity">
                              URL: {thumbnail.length > 50 ? `${thumbnail.substring(0, 50)}...` : thumbnail}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div 
                          onClick={triggerThumbnailInput}
                          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all hover:border-blue-500 hover:bg-blue-50 ${
                            uploadingThumbnail ? 'border-blue-300 bg-blue-50' : 'border-gray-300'
                          }`}
                        >
                          {uploadingThumbnail ? (
                            <div className="space-y-3">
                              <Loader className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
                              <div className="text-sm text-blue-600">Uploading thumbnail...</div>
                            </div>
                          ) : (
                            <>
                              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Upload className="w-6 h-6 text-blue-600" />
                              </div>
                              <div className="text-sm font-medium text-gray-700 mb-1">
                                Click to upload thumbnail
                              </div>
                              <div className="text-xs text-gray-500">
                                Recommended: 1280x720px, JPG, PNG, or WebP (max 5MB)
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Thumbnail Guidelines */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900">Thumbnail Guidelines</h4>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li className="flex items-start gap-2">
                          <div className="w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                            ✓
                          </div>
                          <span>Use high-quality, relevant images</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                            ✓
                          </div>
                          <span>Optimal size: 1280x720 pixels (16:9 ratio)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                            ✓
                          </div>
                          <span>Max file size: 5MB</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                            ✓
                          </div>
                          <span>Include text overlay for better visibility</span>
                        </li>
                      </ul>
                      
                      {thumbnail && (
                        <div className="pt-4 border-t border-gray-200">
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <Image className="w-4 h-4" />
                            <span className="font-medium">Uploaded thumbnail:</span>
                          </div>
                          <div className="mt-2 text-xs text-gray-500">
                            <div className="bg-gray-100 p-2 rounded break-all">
                              {thumbnail}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

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

                    {/* Short Description */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        Short Description
                      </label>
                      <textarea
                        value={shortDescription}
                        onChange={(e) => setShortDescription(e.target.value)}
                        placeholder="Brief summary of your course (optional)"
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                        rows={2}
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
                        Full Description *
                      </label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe what students will learn in this course..."
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                        rows={5}
                        required
                      />
                    </div>

                    {/* Status - Set to Published by default */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
                        <Settings className="w-4 h-4 text-gray-600" />
                        Course Status
                      </label>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      >
                        <option value="PUBLISHED">Published (Recommended)</option>
                        <option value="DRAFT">Draft</option>
                        <option value="PENDING_APPROVAL">Pending Approval</option>
                      </select>
                      <div className="text-xs text-gray-500 mt-2">
                        Published courses will be visible to students immediately
                      </div>
                    </div>
                  </div>
                </div>

                {/* Next Button */}
                <div className="flex justify-end pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    disabled={!title || !description || !categoryId || !thumbnail}
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    Next: Add Content
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}

            {/* Step 2: Content */}
            {step === 2 && (
              <>
                <div className="border-t border-gray-200 pt-8">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Course Content</h3>
                      <p className="text-sm text-gray-600">Organize your course into modules and lessons</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddModule}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all shadow-sm"
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
                          <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-4 border-b border-gray-200">
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

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-semibold"
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-semibold shadow-lg flex items-center gap-2"
                  >
                    Next: Review
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </>
            )}

            {/* Step 3: Review and Submit */}
            {step === 3 && (
              <>
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-gray-900">Review Your Course</h3>
                  
                  {/* Course Summary */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Course Summary</h4>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <div className="mb-4">
                          <label className="text-sm text-gray-600">Title</label>
                          <div className="font-medium">{title}</div>
                        </div>
                        <div className="mb-4">
                          <label className="text-sm text-gray-600">Description</label>
                          <div className="font-medium line-clamp-3">{description}</div>
                        </div>
                        <div className="mb-4">
                          <label className="text-sm text-gray-600">Category</label>
                          <div className="font-medium">
                            {categories.find(c => c.id == categoryId)?.name || 'Not selected'}
                          </div>
                        </div>
                      </div>
                      <div>
                        <div className="mb-4">
                          <label className="text-sm text-gray-600">Price</label>
                          <div className="font-medium">
                            {priceType === 'free' ? 'Free' : `$${price}`}
                          </div>
                        </div>
                        <div className="mb-4">
                          <label className="text-sm text-gray-600">Status</label>
                          <div className="font-medium">{status}</div>
                        </div>
                        <div className="mb-4">
                          <label className="text-sm text-gray-600">Thumbnail</label>
                          <div className="font-medium">
                            {thumbnail ? 'Uploaded ✓' : 'Not uploaded'}
                          </div>
                        </div>
                        <div className="mb-4">
                          <label className="text-sm text-gray-600">Modules</label>
                          <div className="font-medium">{modules.length} module(s)</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Thumbnail Preview */}
                  {thumbnailPreview && (
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h4 className="font-semibold text-gray-900 mb-4">Thumbnail Preview</h4>
                      <div className="max-w-md mx-auto">
                        <img 
                          src={thumbnailPreview} 
                          alt="Course thumbnail" 
                          className="w-full h-auto rounded-lg shadow-md"
                        />
                        <div className="mt-2 text-sm text-gray-600 text-center">
                          This is how your course will appear to students
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Modules Summary */}
                  {modules.length > 0 && (
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h4 className="font-semibold text-gray-900 mb-4">Modules & Lessons</h4>
                      <div className="space-y-4">
                        {modules.map((module, index) => (
                          <div key={module.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="font-medium mb-2">Module {index + 1}: {module.title || 'Untitled'}</div>
                            <div className="text-sm text-gray-600">
                              {module.lessons?.length || 0} lesson(s)
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Final Actions */}
                  <div className="pt-6 border-t border-gray-200">
                    <div className="flex items-center gap-4">
                      <input
                        type="checkbox"
                        id="confirm"
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        required
                      />
                      <label htmlFor="confirm" className="text-sm text-gray-700">
                        I confirm that all information provided is accurate and I have the rights to publish this course.
                      </label>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex gap-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="flex-1 px-6 py-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-semibold"
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !thumbnail}
                    className="flex-1 px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin" />
                        Creating Course...
                      </>
                    ) : (
                      <>
                        <BookOpen className="w-5 h-5" />
                        Create & Publish Course
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </form>

        {/* Debug Panel */}
        <div className="mt-8 p-4 bg-gray-100 rounded-lg">
          <details>
            <summary className="cursor-pointer font-semibold text-gray-700">
              Debug Information
            </summary>
            <div className="mt-2 text-sm space-y-2">
              <div>
                <strong>Thumbnail State:</strong>
                <pre className="bg-gray-800 text-gray-100 p-2 rounded mt-1 overflow-auto max-h-40">
                  {JSON.stringify({
                    thumbnail,
                    hasThumbnail: !!thumbnail,
                    thumbnailFile: thumbnailFile?.name,
                    thumbnailPreview: thumbnailPreview ? 'Set' : 'Not set'
                  }, null, 2)}
                </pre>
              </div>
              <div>
                <strong>Form State:</strong>
                <pre className="bg-gray-800 text-gray-100 p-2 rounded mt-1 overflow-auto max-h-40">
                  {JSON.stringify({
                    title,
                    descriptionLength: description.length,
                    categoryId,
                    price: priceType === 'free' ? 0 : price,
                    status,
                    modulesCount: modules.length,
                    lessonsCount: modules.reduce((total, module) => total + (module.lessons?.length || 0), 0)
                  }, null, 2)}
                </pre>
              </div>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
};

export default CourseForm;