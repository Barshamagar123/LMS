import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import {
  User, Briefcase, Globe, Linkedin, Github, Twitter,
  Upload, Camera, ArrowLeft, CheckCircle, Loader2
} from 'lucide-react';

const CompleteProfile = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth(); // Added updateUser
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState('');
  const [previewImage, setPreviewImage] = useState(null);
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    bio: '',
    company: '',
    experience: '',
    website: '',
    linkedin: '',
    github: '',
    twitter: '',
    profilePicture: ''
  });

  // Load existing user data
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        title: user.title || '',
        bio: user.bio || '',
        company: user.company || '',
        experience: user.experience || '',
        website: user.website || '',
        linkedin: user.linkedin || '',
        github: user.github || '',
        twitter: user.twitter || '',
        profilePicture: user.profilePicture || ''
      }));
      
      if (user.profilePicture) {
        setPreviewImage(user.profilePicture);
      }
    }
  }, [user]);

  // Handle file upload
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload to backend
    const uploadForm = new FormData();
    uploadForm.append('profilePicture', file);

    try {
      setUploadingImage(true);
      setError('');
      const response = await API.post('/instructor/profile/upload-picture', uploadForm, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setFormData(prev => ({ ...prev, profilePicture: response.data.url }));
      
      // Update user context with new profile picture
      if (updateUser) {
        updateUser({ profilePicture: response.data.url });
      }
      
    } catch (err) {
      setError('Failed to upload image. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validate required fields
      if (!formData.title.trim()) {
        throw new Error('Professional title is required');
      }
      if (!formData.bio.trim()) {
        throw new Error('Bio is required');
      }

      // Prepare data
      const submitData = {
        title: formData.title.trim(),
        bio: formData.bio.trim(),
        company: formData.company?.trim() || '',
        experience: formData.experience ? parseInt(formData.experience) : 0,
        website: formData.website?.trim() || '',
        linkedin: formData.linkedin?.trim() || '',
        github: formData.github?.trim() || '',
        twitter: formData.twitter?.trim() || '',
        profilePicture: formData.profilePicture || ''
      };

      // Send to backend
      const response = await API.post('/instructor/complete-profile', submitData);
      
      console.log('API Response:', response.data);
      
      // Update user context with profileCompleted: true
      if (updateUser && response.data.user) {
        updateUser({
          ...response.data.user,
          profileCompleted: true
        });
      } else {
        // Fallback: Update user with form data
        updateUser({
          ...formData,
          profileCompleted: true
        });
      }
      
      // Show success message
      setSuccess('Profile completed successfully! Redirecting...');
      
      // Redirect after delay
      setTimeout(() => {
        navigate('/instructor-dashboard', {
          state: { 
            message: 'Profile completed successfully!',
            showToast: true
          },
          replace: true
        });
      }, 1500);

    } catch (err) {
      console.error('Error:', err);
      setError(err.response?.data?.message || err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Redirect if not instructor
  useEffect(() => {
    if (!user || user.role !== 'INSTRUCTOR') {
      navigate('/');
    }
    
    // If profile already completed, redirect to dashboard
    if (user?.profileCompleted) {
      navigate('/instructor-dashboard');
    }
  }, [user, navigate]);

  if (!user || user.role !== 'INSTRUCTOR') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-blue-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-linear-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Complete Your Instructor Profile
          </h1>
          <p className="text-gray-600">
            Build credibility with students by sharing your professional background
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <p className="font-medium">Error</p>
              <p>{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <p className="font-medium">{success}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Picture */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Profile Picture
              </label>
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg">
                    {previewImage ? (
                      <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-linear-to-r from-blue-100 to-purple-100 flex items-center justify-center">
                        <Camera className="w-8 h-8 text-blue-600" />
                      </div>
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors disabled:opacity-50">
                    {uploadingImage ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploadingImage || loading}
                    />
                  </label>
                </div>
                <div className="text-sm text-gray-500">
                  <p>Upload a professional photo</p>
                  <p className="text-xs">Max 5MB • JPG, PNG, GIF</p>
                  {uploadingImage && <p className="text-blue-600 text-xs mt-1">Uploading...</p>}
                </div>
              </div>
            </div>

            {/* Professional Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Professional Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Senior Software Engineer"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
                disabled={loading}
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio / About You *
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Tell students about your experience, expertise, and teaching philosophy..."
                rows="5"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
                disabled={loading}
              />
              <p className="text-sm text-gray-500 mt-1">
                {formData.bio.length}/500 characters
              </p>
            </div>

            {/* Company & Experience */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Briefcase className="w-4 h-4 text-gray-500" />
                  <label className="block text-sm font-medium text-gray-700">
                    Current Company
                  </label>
                </div>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  placeholder="e.g., Google, Microsoft"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Years of Experience
                </label>
                <input
                  type="number"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  placeholder="e.g., 5"
                  min="0"
                  max="50"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Website */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Globe className="w-4 h-4 text-gray-500" />
                <label className="block text-sm font-medium text-gray-700">
                  Personal Website / Portfolio
                </label>
              </div>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleChange}
                placeholder="https://yourwebsite.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                disabled={loading}
              />
            </div>

            {/* Social Links */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Linkedin className="w-4 h-4 text-blue-700" />
                  <label className="block text-sm font-medium text-gray-700">
                    LinkedIn Profile
                  </label>
                </div>
                <input
                  type="url"
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  disabled={loading}
                />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Github className="w-4 h-4 text-gray-800" />
                  <label className="block text-sm font-medium text-gray-700">
                    GitHub Profile
                  </label>
                </div>
                <input
                  type="url"
                  name="github"
                  value={formData.github}
                  onChange={handleChange}
                  placeholder="https://github.com/username"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Twitter */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Twitter className="w-4 h-4 text-blue-400" />
                <label className="block text-sm font-medium text-gray-700">
                  Twitter / X Profile
                </label>
              </div>
              <input
                type="url"
                name="twitter"
                value={formData.twitter}
                onChange={handleChange}
                placeholder="https://twitter.com/username"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                disabled={loading}
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-between pt-6 border-t">
              <button
                type="button"
                onClick={() => navigate(-1)}
                disabled={loading}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              
              <button
                type="submit"
                disabled={loading || uploadingImage}
                className="px-8 py-3 bg-linear-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 transition-all flex items-center gap-2 shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Completing Profile...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Complete Profile
                  </>
                )}
              </button>
            </div>
          </form>
          
          {/* Debug info (remove in production) */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <details className="text-sm">
              <summary className="cursor-pointer text-gray-500">Debug Info</summary>
              <div className="mt-2 p-3 bg-gray-50 rounded">
                <p>User profileCompleted: {user?.profileCompleted?.toString()}</p>
                <p>User role: {user?.role}</p>
                <button
                  onClick={() => {
                    console.log('User:', user);
                    console.log('Form data:', formData);
                  }}
                  className="mt-2 text-blue-600 hover:text-blue-800"
                >
                  Log to Console
                </button>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompleteProfile;