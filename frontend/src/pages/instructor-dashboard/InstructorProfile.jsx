import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import {
  User, Briefcase, Globe, Linkedin, Github, Twitter,
  Calendar, Edit2, ArrowLeft, Loader2, Mail, Award, 
  BookOpen, Star, Users, GraduationCap, ExternalLink,
  Share2, Globe as GlobeIcon, MapPin, Clock
} from 'lucide-react';

const InstructorProfile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Get backend URL and create separate URL for static files
  const BACKEND_URL = API.defaults.baseURL || 'http://localhost:3000';
  // Remove /api from URL for static files
  const STATIC_BASE_URL = BACKEND_URL.replace('/api', '');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await API.get('/instructor/profile');
        console.log('Profile data from API:', response.data);
        setProfile(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load profile');
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Function to fix image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    // If it's already a full URL
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    // Fix common issues with image paths
    let fixedPath = imagePath;
    
    // Ensure path starts with /uploads
    if (!fixedPath.startsWith('/uploads/')) {
      fixedPath = `/uploads/${fixedPath}`;
    }
    
    // Ensure profile-pictures folder is included
    if (fixedPath.startsWith('/uploads/') && !fixedPath.includes('/profile-pictures/')) {
      const filename = fixedPath.split('/').pop();
      fixedPath = `/uploads/profile-pictures/${filename}`;
    }
    
    // Build full URL with static base URL (without /api)
    return `${STATIC_BASE_URL}${fixedPath}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Calculate engagement metrics
  const calculateEngagement = () => {
    if (!profile) return null;
    const totalStudents = profile.stats?.totalStudents || 0;
    const totalCourses = profile.stats?.totalCourses || 1;
    const avgRating = profile.stats?.averageRating || 0;
    
    return {
      studentEngagement: Math.min(100, (totalStudents / (totalCourses * 50)) * 100),
      courseQuality: Math.min(100, avgRating * 20),
      responseRate: 95, // This could come from backend
      completionRate: 88 // This could come from backend
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center max-w-md p-8 bg-white rounded-2xl shadow-xl">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Unavailable</h2>
          <p className="text-red-600 mb-6">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-linear-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">No profile data found</p>
        </div>
      </div>
    );
  }

  const imageUrl = getImageUrl(profile.profilePicture);
  const engagement = calculateEngagement();

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Animated Background Elements */}
        <div className="fixed top-0 left-0 w-full h-full -z-10 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-linear-to-r from-blue-200 to-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-linear-to-r from-purple-200 to-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-linear-to-r from-pink-200 to-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        {/* Header with Navigation */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 hover:bg-white px-4 py-2 rounded-xl transition-all group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Back to Dashboard</span>
            </button>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/instructor/edit-profile')}
              className="flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              <Edit2 className="w-4 h-4" />
              <span className="font-medium">Edit Profile</span>
            </button>
          </div>
        </div>

        {/* Main Profile Card */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden border border-white/50 mb-8">
          {/* Profile Header with Gradient */}
          <div className="relative bg-linear-to-r from-blue-600 via-purple-600 to-indigo-600 p-8 md:p-12 text-white">
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-linear-to-t from-black/10 to-transparent"></div>
            
            <div className="relative flex flex-col md:flex-row items-center md:items-start gap-8">
              {/* Profile Picture with Glow Effect */}
              <div className="relative group">
                <div className="absolute -inset-4 bg-linear-to-r from-blue-400 to-purple-400 rounded-full blur-xl opacity-50 group-hover:opacity-70 transition-opacity"></div>
                <div className="relative w-40 h-40 rounded-full overflow-hidden border-4 border-white shadow-2xl">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={profile.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = `
                          <div class="w-full h-full bg-linear-to-r from-blue-100 to-purple-100 flex flex-col items-center justify-center">
                            <svg class="w-16 h-16 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                        `;
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-linear-to-r from-blue-100 to-purple-100 flex flex-col items-center justify-center">
                      <User className="w-16 h-16 text-blue-600" />
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-white text-blue-600 text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                  INSTRUCTOR
                </div>
              </div>

              {/* Profile Info */}
              <div className="flex-1 text-center md:text-left">
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
                  <Star className="w-4 h-4 text-yellow-300" />
                  <span className="text-sm font-medium">Verified Instructor</span>
                </div>
                
                <h1 className="text-4xl font-bold mb-3 bg-clip-text text-transparent bg-linear-to-r from-white to-blue-100">
                  {profile.name}
                </h1>
                
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5 opacity-80" />
                    <span className="text-lg font-medium">{profile.title}</span>
                  </div>
                  
                  {profile.company && (
                    <div className="flex items-center gap-2 bg-white/20 px-4 py-1.5 rounded-full">
                      <MapPin className="w-4 h-4" />
                      <span>{profile.company}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                  <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
                    <Mail className="w-4 h-4" />
                    <span>{profile.email}</span>
                  </div>
                  
                  {profile.experience && (
                    <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
                      <Clock className="w-4 h-4" />
                      <span>{profile.experience}+ years experience</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
                    <Calendar className="w-4 h-4" />
                    <span>Joined {formatDate(profile.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Body */}
          <div className="p-8 md:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Bio & Performance */}
              <div className="lg:col-span-2 space-y-8">
                {/* Bio Card */}
                <div className="bg-linear-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                      <div className="w-10 h-10 bg-linear-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-white" />
                      </div>
                      <span>About Me</span>
                    </h2>
                  </div>
                  <div className="prose prose-lg max-w-none">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line bg-white/50 p-6 rounded-xl">
                      {profile.bio || 'No bio provided yet. Add a bio to tell students about your experience, expertise, and teaching philosophy.'}
                    </p>
                  </div>
                </div>

                {/* Performance Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-linear-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white transform hover:-translate-y-1 transition-transform duration-300 shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                      <GraduationCap className="w-8 h-8 opacity-90" />
                      <span className="text-sm opacity-90">Total</span>
                    </div>
                    <div className="text-3xl font-bold mb-1">{profile._count?.courses || 0}</div>
                    <div className="text-sm opacity-90">Courses Created</div>
                  </div>
                  
                  <div className="bg-linear-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white transform hover:-translate-y-1 transition-transform duration-300 shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                      <Users className="w-8 h-8 opacity-90" />
                      <span className="text-sm opacity-90">Total</span>
                    </div>
                    <div className="text-3xl font-bold mb-1">{profile.stats?.totalStudents || 0}</div>
                    <div className="text-sm opacity-90">Students Enrolled</div>
                  </div>
                  
                  <div className="bg-linear-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white transform hover:-translate-y-1 transition-transform duration-300 shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                      <Star className="w-8 h-8 opacity-90" />
                      <span className="text-sm opacity-90">Average</span>
                    </div>
                    <div className="text-3xl font-bold mb-1">{profile.stats?.averageRating?.toFixed(1) || '0.0'}</div>
                    <div className="text-sm opacity-90">Rating</div>
                  </div>
                  
                  <div className="bg-linear-to-br from-orange-500 to-amber-600 rounded-2xl p-6 text-white transform hover:-translate-y-1 transition-transform duration-300 shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                      <Award className="w-8 h-8 opacity-90" />
                      <span className="text-sm opacity-90">Years</span>
                    </div>
                    <div className="text-3xl font-bold mb-1">{profile.experience || 0}+</div>
                    <div className="text-sm opacity-90">Experience</div>
                  </div>
                </div>

                {/* Engagement Metrics */}
                {engagement && (
                  <div className="bg-linear-to-br from-gray-50 to-white rounded-2xl p-8 border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                      <div className="w-8 h-8 bg-linear-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-4 h-4 text-white" />
                      </div>
                      Engagement Metrics
                    </h3>
                    <div className="space-y-6">
                      {Object.entries(engagement).map(([key, value]) => (
                        <div key={key} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium text-gray-700 capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                            <span className="font-bold text-gray-900">{Math.round(value)}%</span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-linear-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-1000 ease-out"
                              style={{ width: `${value}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Contact & Social */}
              <div className="space-y-8">
                {/* Contact Information */}
                <div className="bg-linear-to-br from-white to-gray-50 rounded-2xl p-8 border border-gray-100 shadow-lg">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <div className="w-8 h-8 bg-linear-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <Mail className="w-4 h-4 text-white" />
                    </div>
                    Contact Information
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                      <Mail className="w-5 h-5 text-blue-600" />
                      <a href={`mailto:${profile.email}`} className="text-blue-700 hover:text-blue-900 font-medium">
                        {profile.email}
                      </a>
                    </div>
                    
                    {profile.website && (
                      <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
                        <GlobeIcon className="w-5 h-5 text-green-600" />
                        <a 
                          href={profile.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-green-700 hover:text-green-900 font-medium flex items-center gap-2"
                        >
                          {profile.website.replace(/^https?:\/\//, '')}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Social Profiles */}
                {(profile.linkedin || profile.github || profile.twitter) && (
                  <div className="bg-linear-to-br from-white to-gray-50 rounded-2xl p-8 border border-gray-100 shadow-lg">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                      <div className="w-8 h-8 bg-linear-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <Share2 className="w-4 h-4 text-white" />
                      </div>
                      Social Profiles
                    </h3>
                    <div className="space-y-3">
                      {profile.linkedin && (
                        <a
                          href={profile.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-4 bg-linear-to-r from-blue-50 to-blue-100 rounded-xl hover:from-blue-100 hover:to-blue-200 transition-all group border border-blue-100"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                              <Linkedin className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">LinkedIn</div>
                              <div className="text-sm text-gray-600">Professional Profile</div>
                            </div>
                          </div>
                          <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                        </a>
                      )}
                      
                      {profile.github && (
                        <a
                          href={profile.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-4 bg-linear-to-r from-gray-50 to-gray-100 rounded-xl hover:from-gray-100 hover:to-gray-200 transition-all group border border-gray-100"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center">
                              <Github className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">GitHub</div>
                              <div className="text-sm text-gray-600">Code & Projects</div>
                            </div>
                          </div>
                          <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-gray-700" />
                        </a>
                      )}
                      
                      {profile.twitter && (
                        <a
                          href={profile.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-4 bg-linear-to-r from-sky-50 to-sky-100 rounded-xl hover:from-sky-100 hover:to-sky-200 transition-all group border border-sky-100"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-sky-500 rounded-lg flex items-center justify-center">
                              <Twitter className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">Twitter</div>
                              <div className="text-sm text-gray-600">Latest Updates</div>
                            </div>
                          </div>
                          <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-sky-600" />
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Expertise */}
                <div className="bg-linear-to-br from-indigo-50 to-purple-50 rounded-2xl p-8 border border-indigo-100 shadow-lg">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <div className="w-8 h-8 bg-linear-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <Award className="w-4 h-4 text-white" />
                    </div>
                    Expertise Summary
                  </h3>
                  <div className="space-y-4">
                    {profile.title && (
                      <div className="flex items-center justify-between p-3 bg-white/50 rounded-xl">
                        <span className="text-gray-600 font-medium">Professional Title</span>
                        <span className="font-bold text-gray-900">{profile.title}</span>
                      </div>
                    )}
                    
                    {profile.company && (
                      <div className="flex items-center justify-between p-3 bg-white/50 rounded-xl">
                        <span className="text-gray-600 font-medium">Current Company</span>
                        <span className="font-bold text-gray-900">{profile.company}</span>
                      </div>
                    )}
                    
                    {profile.experience && (
                      <div className="flex items-center justify-between p-3 bg-white/50 rounded-xl">
                        <span className="text-gray-600 font-medium">Years of Experience</span>
                        <span className="font-bold text-gray-900">{profile.experience} years</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mb-12">
          <div className="inline-flex flex-col sm:flex-row items-center gap-6 bg-linear-to-r from-white to-gray-50 p-8 rounded-3xl border border-gray-200 shadow-xl">
            <div className="text-left">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Share Your Profile</h3>
              <p className="text-gray-600 max-w-md">
                Share your professional profile with students and expand your reach as an instructor.
              </p>
            </div>
            <button
              onClick={() => {
                const profileUrl = `${window.location.origin}/instructor/${profile.id}`;
                navigator.clipboard.writeText(profileUrl);
                // You can add a toast notification here
                alert('Profile URL copied to clipboard! Share it with your students.');
              }}
              className="flex items-center gap-3 px-8 py-3.5 bg-linear-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 font-medium"
            >
              <Share2 className="w-5 h-5" />
              Copy Profile Link
            </button>
          </div>
        </div>
      </div>

      {/* Add animation keyframes to global CSS */}
      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

// Add TrendingUp icon if not imported
const TrendingUp = (props) => (
  <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

export default InstructorProfile;