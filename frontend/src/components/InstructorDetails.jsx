// components/InstructorDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  Chip,
  Rating,
  Button,
  Tabs,
  Tab,
  Divider,
  Alert,
  CircularProgress,
  Breadcrumbs,
  Link,
  Paper
} from '@mui/material';
import {
  School,
  Groups,
  WorkspacePremium,
  LinkedIn,
  Twitter,
  GitHub,
  Language,
  ArrowBack,
  Home,
  AccessTime,
  AttachMoney,
  Category as CategoryIcon
} from '@mui/icons-material';
import API from '../api/axios'; // Import your existing axios instance

const InstructorDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [instructor, setInstructor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    fetchInstructor();
  }, [id]);

  const fetchInstructor = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`Fetching instructor with id: ${id}`);
      const response = await API.get(`/instructors/public/${id}`);
      
      console.log('Instructor data:', response.data);
      setInstructor(response.data);
    } catch (err) {
      console.error('Error fetching instructor:', err);
      
      if (err.response?.status === 404) {
        setError('Instructor not found. The requested profile does not exist.');
      } else if (err.response) {
        setError(`Server error: ${err.response.status} - ${err.response.data?.message || 'Unknown error'}`);
      } else if (err.request) {
        setError('No response from server. Please check your internet connection and make sure backend is running.');
      } else {
        setError(`Error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return '??';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Loading instructor profile...</Typography>
      </Container>
    );
  }

  if (error || !instructor) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          action={
            <Button 
              color="inherit" 
              size="small" 
              onClick={fetchInstructor}
            >
              Retry
            </Button>
          }
        >
          {error || 'Instructor not found'}
        </Alert>
        <Button 
          startIcon={<ArrowBack />} 
          onClick={() => navigate('/instructors')}
          variant="outlined"
        >
          Back to Instructors
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link
          underline="hover"
          color="inherit"
          onClick={(e) => {
            e.preventDefault();
            navigate('/');
          }}
          sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
        >
          <Home sx={{ mr: 0.5 }} fontSize="small" />
          Home
        </Link>
        <Link
          underline="hover"
          color="inherit"
          onClick={(e) => {
            e.preventDefault();
            navigate('/instructors');
          }}
          sx={{ cursor: 'pointer' }}
        >
          Instructors
        </Link>
        <Typography color="text.primary">{instructor.name}</Typography>
      </Breadcrumbs>

      {/* Back Button */}
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate('/instructors')}
        sx={{ mb: 3 }}
      >
        Back to Instructors
      </Button>

      {/* Header Card */}
      <Card sx={{ mb: 4, borderRadius: 2, boxShadow: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={3} sx={{ textAlign: 'center' }}>
              <Avatar
                src={instructor.profilePicture}
                sx={{
                  width: 150,
                  height: 150,
                  mx: 'auto',
                  mb: 2,
                  border: '4px solid white',
                  boxShadow: 3,
                  bgcolor: 'primary.main',
                  fontSize: '2.5rem',
                  fontWeight: 600
                }}
              >
                {getInitials(instructor.name)}
              </Avatar>
              
              {/* Social Links */}
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 2, flexWrap: 'wrap' }}>
                {instructor.linkedin && (
                  <Button
                    href={instructor.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    size="small"
                    startIcon={<LinkedIn />}
                    variant="outlined"
                  >
                    LinkedIn
                  </Button>
                )}
                {instructor.twitter && (
                  <Button
                    href={instructor.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    size="small"
                    startIcon={<Twitter />}
                    variant="outlined"
                  >
                    Twitter
                  </Button>
                )}
                {instructor.github && (
                  <Button
                    href={instructor.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    size="small"
                    startIcon={<GitHub />}
                    variant="outlined"
                  >
                    GitHub
                  </Button>
                )}
                {instructor.website && (
                  <Button
                    href={instructor.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    size="small"
                    startIcon={<Language />}
                    variant="outlined"
                  >
                    Website
                  </Button>
                )}
              </Box>
            </Grid>

            <Grid item xs={12} md={9}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, flexWrap: 'wrap' }}>
                <Typography variant="h4" fontWeight={700} sx={{ mr: 2, mb: 1 }}>
                  {instructor.name}
                </Typography>
                {instructor.featured && (
                  <Chip 
                    label="Featured Instructor" 
                    color="primary" 
                    size="small"
                    sx={{ mb: 1 }}
                  />
                )}
              </Box>

              <Typography variant="h5" color="primary" sx={{ mb: 1 }}>
                {instructor.title}
              </Typography>

              {instructor.company && (
                <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
                  {instructor.company}
                </Typography>
              )}

              {/* Stats */}
              <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={6} sm={3}>
                  <Paper elevation={0} sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
                    <School sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                    <Typography variant="h4" fontWeight={700}>
                      {instructor.courseCount || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Courses
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Paper elevation={0} sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
                    <Groups sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                    <Typography variant="h4" fontWeight={700}>
                      {instructor.totalStudents || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Students
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Paper elevation={0} sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
                    <WorkspacePremium sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                    <Typography variant="h4" fontWeight={700}>
                      {instructor.experience || '?'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Years Exp
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Paper elevation={0} sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                      <Rating
                        value={instructor.averageRating || 0}
                        precision={0.1}
                        readOnly
                      />
                    </Box>
                    <Typography variant="h4" fontWeight={700}>
                      {instructor.averageRating?.toFixed(1) || 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Avg Rating
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="fullWidth"
        >
          <Tab label="About" />
          <Tab label={`Courses (${instructor.courses?.length || 0})`} />
        </Tabs>
      </Box>

      {/* Tab Content */}
      {activeTab === 0 && (
        <Card sx={{ borderRadius: 2, mb: 4 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" gutterBottom fontWeight={600}>
              About
            </Typography>
            <Typography variant="body1" paragraph sx={{ whiteSpace: 'pre-line', lineHeight: 1.8 }}>
              {instructor.bio || 'No biography available.'}
            </Typography>

            <Divider sx={{ my: 3 }} />

            {/* Experience */}
            {instructor.experience && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom fontWeight={600}>
                  Professional Experience
                </Typography>
                <Typography variant="body1">
                  {instructor.experience}+ years of professional experience
                </Typography>
              </Box>
            )}

            {/* Contact Info */}
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Contact & Social
            </Typography>
            <Grid container spacing={2}>
              {instructor.website && (
                <Grid item xs={12} sm={6}>
                  <Button
                    fullWidth
                    startIcon={<Language />}
                    href={instructor.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="outlined"
                    sx={{ justifyContent: 'flex-start' }}
                  >
                    Visit Website
                  </Button>
                </Grid>
              )}
              {instructor.linkedin && (
                <Grid item xs={12} sm={6}>
                  <Button
                    fullWidth
                    startIcon={<LinkedIn />}
                    href={instructor.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="outlined"
                    sx={{ justifyContent: 'flex-start' }}
                  >
                    LinkedIn Profile
                  </Button>
                </Grid>
              )}
              {instructor.twitter && (
                <Grid item xs={12} sm={6}>
                  <Button
                    fullWidth
                    startIcon={<Twitter />}
                    href={instructor.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="outlined"
                    sx={{ justifyContent: 'flex-start' }}
                  >
                    Twitter
                  </Button>
                </Grid>
              )}
              {instructor.github && (
                <Grid item xs={12} sm={6}>
                  <Button
                    fullWidth
                    startIcon={<GitHub />}
                    href={instructor.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="outlined"
                    sx={{ justifyContent: 'flex-start' }}
                  >
                    GitHub
                  </Button>
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>
      )}

      {activeTab === 1 && (
        <>
          <Typography variant="h5" gutterBottom fontWeight={600} sx={{ mb: 3 }}>
            Courses by {instructor.name}
          </Typography>
          
          {instructor.courses?.length > 0 ? (
            <Grid container spacing={3}>
              {instructor.courses.map((course) => (
                <Grid item xs={12} sm={6} md={4} key={course.id}>
                  <Card 
                    sx={{ 
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 2,
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 6
                      }
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1, p: 3 }}>
                      <Typography variant="h6" gutterBottom fontWeight={600}>
                        {course.title}
                      </Typography>
                      
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        paragraph
                        sx={{ 
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}
                      >
                        {course.description || 'No description available.'}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Rating 
                          value={course.averageRating || 0} 
                          size="small" 
                          readOnly 
                        />
                        <Typography variant="caption" sx={{ ml: 1 }}>
                          ({course.reviewCount || 0} reviews)
                        </Typography>
                      </Box>

                      {/* Course Details */}
                      <Grid container spacing={1} sx={{ mb: 2 }}>
                        {course.level && (
                          <Grid item xs={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <CategoryIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                              <Typography variant="caption">
                                {course.level}
                              </Typography>
                            </Box>
                          </Grid>
                        )}
                        {course.duration && (
                          <Grid item xs={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <AccessTime fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                              <Typography variant="caption">
                                {course.duration}
                              </Typography>
                            </Box>
                          </Grid>
                        )}
                        {course.price !== undefined && (
                          <Grid item xs={12}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <AttachMoney fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                              <Typography variant="body1" fontWeight={600}>
                                ${course.price === 0 ? 'Free' : course.price}
                              </Typography>
                            </Box>
                          </Grid>
                        )}
                      </Grid>

                      <Button
                        fullWidth
                        variant="contained"
                        onClick={() => navigate(`/courses/${course.id}`)}
                        sx={{ mt: 'auto' }}
                      >
                        View Course
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Alert severity="info">
              No courses available from this instructor yet.
            </Alert>
          )}
        </>
      )}
    </Container>
  );
};

export default InstructorDetail;