import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Save, X, Plus, Trash2, Upload, Video, FileText,
  Music, File, FileQuestion, BookOpen, DollarSign, Tag,
  Settings, Loader, AlertCircle, CheckCircle, Calendar,
  Eye, Users, Star, Clock, ChevronRight,
  TrendingUp, Image, Layers, Check, ChevronLeft, AlertTriangle,
  FileVideo, FileAudio, FileImage
} from 'lucide-react';
import API from '../api/axios';

const CourseForm = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Store field-specific errors
  const [fieldErrors, setFieldErrors] = useState({
    title: '',
    description: '',
    categoryId: '',
    price: ''
  });
  
  // Store file upload errors per lesson
  const [fileErrors, setFileErrors] = useState({});
  
  // Form states
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: 0,
    status: 'DRAFT',
    categoryId: '',
    level: 'ALL_LEVELS',
    thumbnail: null,
    thumbnailPreview: null
  });
  
  // Initialize with one module that has a lesson
  const [modules, setModules] = useState([{
    id: `module-${Date.now()}`,
    title: 'Introduction',
    order: 1,
    lessons: [{
      id: `lesson-${Date.now()}`,
      title: 'Introduction Video',
      contentUrl: '',
      contentType: 'VIDEO',
      file: null,
      order: 1,
      isFileUploaded: false
    }]
  }]);
  
  const [categories, setCategories] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  
  // Refs
  const thumbnailInputRef = useRef(null);
  const lessonFileInputRefs = useRef({});

  // Level options
  const levelOptions = [
    { value: 'ALL_LEVELS', label: 'All Levels' },
    { value: 'BEGINNER', label: 'Beginner' },
    { value: 'INTERMEDIATE', label: 'Intermediate' },
    { value: 'ADVANCED', label: 'Advanced' }
  ];

  // Status options
  const statusOptions = [
    { value: 'DRAFT', label: 'Draft' },
    { value: 'PENDING_APPROVAL', label: 'Pending Approval' },
    { value: 'PUBLISHED', label: 'Published' },
    { value: 'ARCHIVED', label: 'Archived' }
  ];

  // Check authentication and fetch categories
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
      return;
    }

    const user = JSON.parse(storedUser);
    setCurrentUser(user);

    if (user.role !== 'INSTRUCTOR') {
      setError('Only instructors can create courses');
      return;
    }

    fetchCategories();
  }, [navigate]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await API.get('/categories');
      setCategories(response.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' ? Number(value) : value
    }));
  };

  // Validate individual fields
  const validateField = (name, value) => {
    const errors = { ...fieldErrors };
    
    switch (name) {
      case 'title':
        if (!value.trim()) {
          errors.title = 'Title is required';
        } else if (value.trim().length < 3) {
          errors.title = 'Title must be at least 3 characters';
        } else if (value.trim().length > 200) {
          errors.title = 'Title cannot exceed 200 characters';
        } else {
          errors.title = '';
        }
        break;
        
      case 'description':
        if (!value.trim()) {
          errors.description = 'Description is required';
        } else if (value.trim().length < 5) {
          errors.description = 'Description must be at least 5 characters';
        } else if (value.trim().length > 5000) {
          errors.description = 'Description cannot exceed 5000 characters';
        } else {
          errors.description = '';
        }
        break;
        
      case 'categoryId':
        if (!value) {
          errors.categoryId = 'Please select a category';
        } else {
          errors.categoryId = '';
        }
        break;
        
      case 'price':
        if (isNaN(value) || value < 0) {
          errors.price = 'Price must be a non-negative number';
        } else {
          errors.price = '';
        }
        break;
    }
    
    setFieldErrors(errors);
    return errors[name] === '';
  };

  const handleThumbnailUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Only image files are allowed (JPEG, PNG, GIF, WebP)');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError('Image size should be less than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({
        ...prev,
        thumbnail: file,
        thumbnailPreview: reader.result
      }));
    };
    reader.readAsDataURL(file);
  };

  const removeThumbnail = () => {
    setFormData(prev => ({
      ...prev,
      thumbnail: null,
      thumbnailPreview: null
    }));
  };

  // Module management
  const addModule = () => {
    const newModuleId = `module-${Date.now() + Math.random()}`;
    setModules([...modules, {
      id: newModuleId,
      title: '',
      order: modules.length + 1,
      lessons: []
    }]);
  };

  const removeModule = (moduleId) => {
    if (modules.length <= 1) {
      setError('Course must have at least one module');
      return;
    }
    setModules(modules.filter(module => module.id !== moduleId));
  };

  const updateModule = (moduleId, field, value) => {
    setModules(modules.map(module => 
      module.id === moduleId ? { ...module, [field]: value } : module
    ));
  };

  // Lesson management
  const addLesson = (moduleId) => {
    const newLessonId = `lesson-${Date.now() + Math.random()}`;
    setModules(modules.map(module =>
      module.id === moduleId
        ? {
            ...module,
            lessons: [...module.lessons, {
              id: newLessonId,
              title: '',
              contentUrl: '',
              contentType: 'VIDEO',
              file: null,
              order: module.lessons.length + 1,
              isFileUploaded: false
            }]
          }
        : module
    ));
  };

  const removeLesson = (moduleId, lessonId) => {
    setModules(modules.map(module =>
      module.id === moduleId
        ? {
            ...module,
            lessons: module.lessons.filter(lesson => lesson.id !== lessonId)
          }
        : module
    ));
    
    setFileErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[lessonId];
      return newErrors;
    });
  };

  const updateLesson = (moduleId, lessonId, field, value) => {
    setModules(modules.map(module =>
      module.id === moduleId
        ? {
            ...module,
            lessons: module.lessons.map(lesson =>
              lesson.id === lessonId ? { ...lesson, [field]: value } : lesson
            )
          }
        : module
    ));
  };

  // File upload handler
  const handleLessonFileUpload = (moduleId, lessonId, e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = [
      'video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo',
      'audio/mpeg', 'audio/wav', 'audio/ogg',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!validTypes.includes(file.type)) {
      const errorMsg = 'Please upload a valid file (video, audio, PDF, or document)';
      setFileErrors(prev => ({ ...prev, [lessonId]: errorMsg }));
      return;
    }

    const maxSize = file.type.startsWith('video/') ? 500 * 1024 * 1024 : 50 * 1024 * 1024;
    if (file.size > maxSize) {
      const errorMsg = `File too large. Maximum size: ${file.type.startsWith('video/') ? '500MB' : '50MB'}`;
      setFileErrors(prev => ({ ...prev, [lessonId]: errorMsg }));
      return;
    }

    let contentType = 'VIDEO';
    if (file.type.startsWith('audio/')) contentType = 'AUDIO';
    else if (file.type === 'application/pdf') contentType = 'PDF';
    else if (file.type.includes('document')) contentType = 'DOC';

    const tempFilePath = `/temp-uploads/${Date.now()}-${file.name}`;
    
    setModules(prevModules => 
      prevModules.map(module =>
        module.id === moduleId
          ? {
              ...module,
              lessons: module.lessons.map(lesson =>
                lesson.id === lessonId
                  ? {
                      ...lesson,
                      file: file,
                      contentUrl: tempFilePath,
                      contentType: contentType,
                      isFileUploaded: true,
                      lastUpdated: Date.now()
                    }
                  : lesson
              )
            }
          : module
      )
    );

    setFileErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[lessonId];
      return newErrors;
    });
    
    setError('');
  };

  const createFileInput = (moduleId, lessonId) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'video/*,audio/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/*';
    
    input.onchange = (e) => {
      handleLessonFileUpload(moduleId, lessonId, e);
      input.value = '';
    };
    
    return input;
  };

  // Navigation
  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // Step validation - IMPROVED
  const validateStep = (step) => {
    setError('');
    setFileErrors({});
    
    let isValid = true;
    
    switch (step) {
      case 1:
        // Validate all fields
        const titleValid = validateField('title', formData.title);
        const descriptionValid = validateField('description', formData.description);
        const categoryValid = validateField('categoryId', formData.categoryId);
        const priceValid = validateField('price', formData.price.toString());
        
        if (!titleValid || !descriptionValid || !categoryValid || !priceValid) {
          isValid = false;
          setError('Please fix all validation errors before proceeding');
        }
        return isValid;
      
      case 2:
        for (const module of modules) {
          if (!module.title.trim()) {
            setError(`Module "${module.order}" title is required`);
            return false;
          }
          
          for (const lesson of module.lessons) {
            if (!lesson.title.trim()) {
              setError(`Lesson title in module "${module.order}" is required`);
              return false;
            }
            
            if (!lesson.file && !lesson.isFileUploaded) {
              const errorMsg = `Please upload a file for lesson "${lesson.title || `Lesson ${lesson.order}`}"`;
              setFileErrors(prev => ({ ...prev, [lesson.id]: errorMsg }));
              
              if (!error) {
                setError(`Please upload files for all lessons. Missing file for: "${lesson.title || `Lesson ${lesson.order}`}"`);
              }
              isValid = false;
            }
          }
        }
        
        if (Object.keys(fileErrors).length > 0) {
          if (!error) {
            setError('Please fix all file upload errors before proceeding');
          }
          isValid = false;
        }
        
        return isValid;
      
      default:
        return true;
    }
  };

  // Get file icon
  const getFileIcon = (contentType) => {
    switch (contentType) {
      case 'VIDEO': return <FileVideo className="w-5 h-5 text-blue-600" />;
      case 'AUDIO': return <FileAudio className="w-5 h-5 text-purple-600" />;
      case 'PDF': return <FileText className="w-5 h-5 text-red-600" />;
      case 'DOC': return <File className="w-5 h-5 text-gray-600" />;
      default: return <FileQuestion className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'DRAFT': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'PENDING_APPROVAL': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'PUBLISHED': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'ARCHIVED': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // ========== UPDATED handleSubmit FUNCTION ==========
  const handleSubmit = async () => {
    // Validate all fields before submitting
    if (!validateStep(1) || !validateStep(2)) {
      setError('Please fix all validation errors before submitting');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      console.log('🚀 Starting course creation...');
      console.log('Form data:', formData);
      
      // Get category ID - must be a valid number
      const categoryId = formData.categoryId ? parseInt(formData.categoryId, 10) : null;
      
      if (!categoryId) {
        throw new Error('Please select a valid category');
      }

      // Prepare course data - EXACTLY as backend expects
      const courseData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price) || 0,
        status: formData.status,
        categoryId: categoryId,
        level: formData.level
        // instructorId will be added by backend middleware
      };

      console.log('📤 Sending course data:', courseData);
      console.log('Validation check:', {
        titleLength: courseData.title.length,
        descriptionLength: courseData.description.length,
        categoryIdType: typeof courseData.categoryId,
        priceType: typeof courseData.price
      });

      // Send course creation request
      const courseResponse = await API.post('/courses', courseData);
      console.log('✅ Course creation response:', courseResponse.data);

      const courseId = courseResponse.data.id || courseResponse.data.data?.id;
      
      if (!courseId) {
        throw new Error('No course ID returned from server');
      }

      console.log('🎉 Course created with ID:', courseId);

      // 2. Upload thumbnail if exists
      if (formData.thumbnail) {
        setUploading(true);
        console.log('📤 Uploading thumbnail...');
        
        try {
          const thumbnailFormData = new FormData();
          thumbnailFormData.append('file', formData.thumbnail);
          
          await API.post(`/courses/${courseId}/thumbnail`, thumbnailFormData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          console.log('✅ Thumbnail uploaded');
        } catch (thumbnailError) {
          console.warn('⚠️ Thumbnail upload failed:', thumbnailError.message);
        } finally {
          setUploading(false);
        }
      }

      // 3. Create modules and lessons (if any)
      if (modules.length > 0) {
        console.log(`📚 Creating ${modules.length} modules...`);
        
        for (const [moduleIndex, module] of modules.entries()) {
          console.log(`Creating module ${moduleIndex + 1}: "${module.title}"`);
          
          try {
            // Create module
            const moduleData = {
              title: module.title.trim(),
              order: module.order,
              courseId: courseId
            };
            
            const moduleResponse = await API.post('/modules', moduleData);
            console.log(`✅ Module created:`, moduleResponse.data);
            
            const moduleId = moduleResponse.data.id || moduleResponse.data.data?.id;
            
            if (!moduleId) {
              console.warn(`⚠️ No module ID returned`);
              continue;
            }

            // Create lessons for this module
            if (module.lessons.length > 0) {
              console.log(`Creating ${module.lessons.length} lessons...`);
              
              for (const [lessonIndex, lesson] of module.lessons.entries()) {
                console.log(`Creating lesson ${lessonIndex + 1}: "${lesson.title}"`);
                
                if (lesson.file) {
                  setUploading(true);
                  
                  try {
                    // Upload lesson file
                    const lessonFormData = new FormData();
                    lessonFormData.append('file', lesson.file);
                    lessonFormData.append('title', lesson.title.trim());
                    lessonFormData.append('contentType', lesson.contentType);
                    lessonFormData.append('order', lesson.order);

                    await API.post(`/modules/${moduleId}/lessons/upload`, lessonFormData, {
                      headers: { 'Content-Type': 'multipart/form-data' }
                    });
                    
                    console.log(`✅ Lesson uploaded`);
                  } catch (lessonError) {
                    console.warn(`⚠️ Lesson upload failed:`, lessonError.message);
                  } finally {
                    setUploading(false);
                  }
                }
              }
            }
          } catch (moduleError) {
            console.warn(`⚠️ Module creation failed:`, moduleError.message);
          }
        }
      }

      setSuccess('✅ Course created successfully! Redirecting...');
      console.log('🎉 Course creation complete!');

      // Redirect
      setTimeout(() => {
        navigate(`/instructor/courses/${courseId}/edit`);
      }, 2000);

    } catch (error) {
      console.error('❌ Error creating course:', error);
      
      let errorMessage = 'Failed to create course';
      let fieldErrors = {};
      
      if (error.response?.data?.errors) {
        // Handle backend validation errors
        error.response.data.errors.forEach(err => {
          fieldErrors[err.field] = err.message;
        });
        
        setFieldErrors(prev => ({ ...prev, ...fieldErrors }));
        errorMessage = error.response.data.message || 'Validation failed';
        
        // Show first error as main error
        if (error.response.data.errors.length > 0) {
          const firstError = error.response.data.errors[0];
          errorMessage = `${firstError.field}: ${firstError.message}`;
        }
        
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.request) {
        errorMessage = 'Cannot connect to server. Please check if backend is running.';
      } else {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };
  // ========== END OF handleSubmit ==========

  // Render Step 1: Basic Information - WITH VALIDATION
  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Course Title * (3-200 characters)
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          onBlur={() => validateField('title', formData.title)}
          className={`w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
            fieldErrors.title ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="e.g., Complete Web Development Bootcamp"
          minLength={3}
          maxLength={200}
          required
        />
        {fieldErrors.title && (
          <p className="mt-1 text-sm text-red-600">{fieldErrors.title}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          {formData.title.length}/200 characters • Minimum 3 characters
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Description * (5-5000 characters)
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          onBlur={() => validateField('description', formData.description)}
          rows={6}
          className={`w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none ${
            fieldErrors.description ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Detailed course description..."
          minLength={5}
          maxLength={5000}
          required
        />
        {fieldErrors.description && (
          <p className="mt-1 text-sm text-red-600">{fieldErrors.description}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          {formData.description.length}/5000 characters • Minimum 5 characters
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Price ($) - Optional
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              onBlur={() => validateField('price', formData.price.toString())}
              min="0"
              step="0.01"
              className={`w-full border rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                fieldErrors.price ? 'border-red-500' : 'border-gray-300'
              }`}
            />
          </div>
          {fieldErrors.price && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.price}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Category *
          </label>
          <select
            name="categoryId"
            value={formData.categoryId}
            onChange={handleInputChange}
            onBlur={() => validateField('categoryId', formData.categoryId)}
            className={`w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
              fieldErrors.categoryId ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={String(cat.id)}>
                {cat.name}
              </option>
            ))}
          </select>
          {fieldErrors.categoryId && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.categoryId}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Level
          </label>
          <select
            name="level"
            value={formData.level}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          >
            {levelOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

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
          {statusOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Course Thumbnail (Optional)
        </label>
        <div className="flex flex-col sm:flex-row gap-4 items-start">
          <div className="flex-1">
            <div
              onClick={() => thumbnailInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-blue-500 transition-colors"
            >
              <input
                type="file"
                ref={thumbnailInputRef}
                onChange={handleThumbnailUpload}
                accept="image/*"
                className="hidden"
              />
              <Upload className="w-12 h-12 mx-auto text-gray-400 mb-2" />
              <p className="text-gray-600">Click to upload thumbnail</p>
              <p className="text-sm text-gray-500 mt-1">Recommended: 1280x720px, max 2MB</p>
            </div>
          </div>

          {formData.thumbnailPreview && (
            <div className="relative">
              <img
                src={formData.thumbnailPreview}
                alt="Thumbnail preview"
                className="w-48 h-32 object-cover rounded-xl"
              />
              <button
                type="button"
                onClick={removeThumbnail}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Validation requirements summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h4 className="font-medium text-blue-800 mb-2">Validation Requirements:</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>✓ Title: 3-200 characters (currently: {formData.title.length})</li>
          <li>✓ Description: 5-5000 characters (currently: {formData.description.length})</li>
          <li>✓ Category: Required</li>
          <li>✓ Price: Optional (default 0)</li>
        </ul>
      </div>
    </div>
  );

  // Render Step 2: Course Content
  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Course Content</h3>
        <button
          type="button"
          onClick={addModule}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Module
        </button>
      </div>

      {modules.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-2xl">
          <Layers className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No modules yet</h3>
          <p className="text-gray-600">Add your first module to organize your course content</p>
        </div>
      ) : (
        <div className="space-y-4">
          {modules.map((module, mIndex) => (
            <div key={`${module.id}-${module.lastUpdated || ''}`} className="border border-gray-200 rounded-2xl overflow-hidden">
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
                      onChange={(e) => updateModule(module.id, 'title', e.target.value)}
                      className="bg-transparent text-lg font-semibold text-gray-900 placeholder-gray-500 focus:outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeModule(module.id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                {module.lessons.map((lesson, lIndex) => (
                  <div key={`${lesson.id}-${lesson.lastUpdated || ''}`} className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-white border border-gray-300 rounded-lg flex items-center justify-center">
                          <span className="text-gray-600 text-xs font-medium">{lIndex + 1}</span>
                        </div>
                        <input
                          type="text"
                          placeholder="Lesson Title"
                          value={lesson.title}
                          onChange={(e) => updateLesson(module.id, lesson.id, 'title', e.target.value)}
                          className="bg-transparent text-gray-900 placeholder-gray-500 focus:outline-none border-b border-transparent focus:border-gray-300 pb-1"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeLesson(module.id, lesson.id)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div className="grid md:grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-medium text-gray-700 mb-1 block">
                            Content Type
                          </label>
                          <select
                            value={lesson.contentType}
                            onChange={(e) => updateLesson(module.id, lesson.id, 'contentType', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="VIDEO">Video</option>
                            <option value="AUDIO">Audio</option>
                            <option value="PDF">PDF</option>
                            <option value="DOC">Document</option>
                            <option value="OTHER">Other</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-xs font-medium text-gray-700 mb-1 block">
                            File Upload *
                          </label>
                          <div
                            onClick={() => {
                              const input = createFileInput(module.id, lesson.id);
                              input.click();
                            }}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 transition-colors"
                          >
                            {lesson.file ? (
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  {getFileIcon(lesson.contentType)}
                                  <div className="flex flex-col">
                                    <span className="font-medium text-gray-700 truncate max-w-[150px]">
                                      {lesson.file?.name || 'Uploaded file'}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      {lesson.file?.size ? formatFileSize(lesson.file.size) : ''}
                                    </span>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateLesson(module.id, lesson.id, 'file', null);
                                    updateLesson(module.id, lesson.id, 'contentUrl', '');
                                    updateLesson(module.id, lesson.id, 'isFileUploaded', false);
                                  }}
                                  className="text-red-500 hover:text-red-700 p-1"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-gray-500">
                                <Upload className="w-4 h-4" />
                                <span>Click to upload file</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {fileErrors[lesson.id] && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-xs text-red-600 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {fileErrors[lesson.id]}
                          </p>
                        </div>
                      )}

                      {lesson.file && (
                        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                          <p className="text-xs text-green-700 flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            File uploaded successfully
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => addLesson(module.id)}
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
  );

  // Render Step 3: Review
  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gray-50 rounded-xl p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Course Summary
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Title</p>
              <p className="font-medium text-gray-900">{formData.title || 'Not set'}</p>
              <p className="text-xs text-gray-500">{formData.title.length}/200 characters</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Description</p>
              <p className="font-medium text-gray-900">{formData.description.substring(0, 100)}...</p>
              <p className="text-xs text-gray-500">{formData.description.length}/5000 characters</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Price</p>
                <p className="font-medium text-gray-900">${formData.price}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Level</p>
                <p className="font-medium text-gray-900">
                  {levelOptions.find(l => l.value === formData.level)?.label}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <p className="font-medium text-gray-900">
                  {statusOptions.find(s => s.value === formData.status)?.label}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Category</p>
                <p className="font-medium text-gray-900">
                  {categories.find(c => c.id == formData.categoryId)?.name || 'Not selected'}
                </p>
              </div>
            </div>
            {formData.thumbnailPreview && (
              <div>
                <p className="text-sm text-gray-600 mb-2">Thumbnail</p>
                <img
                  src={formData.thumbnailPreview}
                  alt="Thumbnail"
                  className="w-32 h-20 object-cover rounded-lg"
                />
              </div>
            )}
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Layers className="w-5 h-5" />
            Modules ({modules.length})
          </h3>
          <div className="space-y-3">
            {modules.map((module, index) => (
              <div key={module.id} className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-800">
                    {module.title || `Module ${index + 1}`}
                  </h4>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {module.lessons.length} lessons
                  </span>
                </div>
                <div className="space-y-1">
                  {module.lessons.map((lesson, lessonIndex) => (
                    <div key={lesson.id} className="flex items-center gap-2 text-sm">
                      {getFileIcon(lesson.contentType)}
                      <span className="text-gray-700">
                        {lesson.title || `Lesson ${lessonIndex + 1}`}
                      </span>
                      {lesson.file && (
                        <span className="text-xs text-gray-500 ml-auto">
                          {lesson.contentType.toLowerCase()}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-yellow-800">Ready to create your course?</h4>
            <p className="text-sm text-yellow-700 mt-1">
              Please review all information carefully. Once submitted, you'll be able to edit the course from your dashboard.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Check if user is instructor
  if (currentUser?.role !== 'INSTRUCTOR') {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">
            Only instructors can create courses. Please log in with an instructor account.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Main return
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-blue-50">
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
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {[1, 2, 3].map((step) => (
                  <React.Fragment key={step}>
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                      ${currentStep >= step 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-200 text-gray-400'
                      }
                    `}>
                      {step}
                    </div>
                    {step < 3 && (
                      <div className={`
                        w-8 h-0.5
                        ${currentStep > step ? 'bg-blue-600' : 'bg-gray-200'}
                      `} />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Create New Course</h1>
          <p className="text-gray-600 mt-2">
            {currentStep === 1 && 'Step 1: Basic Information'}
            {currentStep === 2 && 'Step 2: Course Content'}
            {currentStep === 3 && 'Step 3: Review & Submit'}
          </p>
        </div>

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

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}

          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <div>
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex items-center gap-2 px-6 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                  disabled={saving || uploading}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </button>
              )}
            </div>
            
            <div className="flex gap-4">
              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-medium shadow-sm"
                  disabled={saving || uploading}
                >
                  Next Step
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={saving || uploading || Object.values(fieldErrors).some(error => error)}
                  className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {(saving || uploading) ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Creating Course...
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      Create Course
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 text-xs text-gray-500 p-4 bg-gray-100 rounded-lg">
          <p className="font-medium mb-1">Debug Info:</p>
          <p>Total Modules: {modules.length}</p>
          <p>Total Lessons: {modules.reduce((acc, module) => acc + module.lessons.length, 0)}</p>
          <p>Files Uploaded: {modules.reduce((acc, module) => 
            acc + module.lessons.filter(lesson => lesson.file).length, 0
          )}</p>
          <p>Current Step: {currentStep}</p>
          <p className="mt-2">Field Errors: {Object.values(fieldErrors).filter(e => e).length}</p>
        </div>
      </div>

      {(saving || uploading) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 flex flex-col items-center">
            <Loader className="w-12 h-12 animate-spin text-blue-600 mb-4" />
            <p className="text-gray-700">
              {uploading ? 'Uploading files...' : 'Creating course...'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseForm;