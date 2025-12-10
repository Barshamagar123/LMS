import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import {
  User, Briefcase, Globe, Linkedin, Github, Twitter,
  Upload, Camera, ArrowLeft, CheckCircle, Loader2, Save
} from 'lucide-react';

const EditInstructorProfile = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [previewImage, setPreviewImage] = useState(null);

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

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await API.get('/instructor/profile');
        const profile = response.data;
        
        setFormData({
          title: profile.title || '',
          bio: profile.bio || '',
          company: profile.company || '',
          experience: profile.experience || '',
          website: profile.website || '',
          linkedin: profile.linkedin || '',
          github: profile.github || '',
          twitter: profile.twitter || '',
          profilePicture: profile.profilePicture || ''
        });
        
        if (profile.profilePicture) {
          setPreviewImage(profile.profilePicture);
        }
      } catch (err) {
        setError('Failed to load profile');
      }
    };

    fetchProfile();
  }, []);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result);
    };
    reader.readAsDataURL(file);

    const uploadForm = new FormData();
    uploadForm.append('profilePicture', file);

    try {
      setUploadingImage(true);
      setError('');
      const response = await API.post('/instructor/profile/upload-picture', uploadForm, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setFormData(prev => ({ ...prev, profilePicture: response.data.url }));
      
    } catch (err) {
      setError('Failed to upload image');
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

      const response = await API.patch('/instructor/profile', submitData);
      
      if (updateUser && response.data.user) {
        updateUser({
          ...user,
          ...response.data.user
        });
      }
      
      setSuccess('Profile updated successfully!');
      setTimeout(() => {
        navigate('/instructor/profile');
      }, 1500);

    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Update failed');
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/instructor/profile')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Profile
          </button>
          <h1 className="text-2xl font-bold">Edit Profile</h1>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <span>{success}</span>
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
                      <div className="w-full h-full bg-gradient-to-r from-blue-100 to-purple-100 flex items-center justify-center">
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
                  <p className="text-xs">Max 5MB • JPG, PNG</p>
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                placeholder="Tell students about your experience..."
                rows="5"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                required
                disabled={loading}
              />
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Website */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Globe className="w-4 h-4 text-gray-500" />
                <label className="block text-sm font-medium text-gray-700">
                  Personal Website
                </label>
              </div>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleChange}
                placeholder="https://yourwebsite.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Twitter */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Twitter className="w-4 h-4 text-blue-400" />
                <label className="block text-sm font-medium text-gray-700">
                  Twitter Profile
                </label>
              </div>
              <input
                type="url"
                name="twitter"
                value={formData.twitter}
                onChange={handleChange}
                placeholder="https://twitter.com/username"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-between pt-6 border-t">
              <button
                type="button"
                onClick={() => navigate('/instructor/profile')}
                disabled={loading}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={loading || uploadingImage}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditInstructorProfile;