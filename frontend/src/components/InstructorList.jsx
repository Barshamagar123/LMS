import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
  Button,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Pagination,
  Rating,
  CardActionArea,
  Paper,
  alpha,
  Skeleton,
  IconButton,
  Tooltip,
  Divider,
  Avatar
} from '@mui/material';
import {
  Search,
  Clear,
  School,
  People,
  Star,
  StarBorder,
  ArrowForward,
  Business,
  Work,
  Language,
  LinkedIn,
  Twitter,
  GitHub,
  Sort,
  East
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import Navbar from '../components/Navbar';
import API from '../api/axios';
import { formatProfilePictureUrl } from '../utils/imageUtils';

// Minimalist styled components
const InstructorCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: theme.spacing(2),
  transition: 'all 0.3s ease',
  border: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[4],
    borderColor: alpha(theme.palette.primary.main, 0.2),
  },
}));

const CardImage = styled(CardMedia)({
  height: 160,
  position: 'relative',
  '& img': {
    objectFit: 'cover',
    width: '100%',
    height: '100%',
  }
});

const StatsBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(1),
  backgroundColor: alpha(theme.palette.grey[50], 0.5),
  borderRadius: theme.spacing(1),
  border: `1px solid ${theme.palette.divider}`,
}));

const StatItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  flex: 1,
}));

const SocialButton = styled(IconButton)(({ theme }) => ({
  width: 32,
  height: 32,
  color: theme.palette.text.secondary,
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
    color: theme.palette.primary.main,
  },
}));

// Utility functions
const formatExperience = (years) => {
  if (!years && years !== 0) return null;
  const yearsNum = parseInt(years);
  if (isNaN(yearsNum)) return null;
  return `${yearsNum}+ yrs`;
};

const getCourseCount = (instructor) => {
  return instructor?.stats?.totalCourses || instructor?.courseCount || 0;
};

const getStudentCount = (instructor) => {
  return instructor?.stats?.totalStudents || 0;
};

const getRating = (instructor) => {
  const rating = instructor?.stats?.averageRating || instructor?.averageRating || 0;
  return Math.min(5, Math.max(0, parseFloat(rating) || 0));
};

const InstructorList = () => {
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalInstructors, setTotalInstructors] = useState(0);
  
  const navigate = useNavigate();

  const fetchInstructors = useCallback(async (page = 1, search = '', sort = 'featured') => {
    try {
      setLoading(true);
      setError('');

      const response = await API.get('/instructor/public', {
        params: {
          page,
          limit: 12,
          search,
          sort
        }
      });
      
      if (response?.data?.success) {
        const data = response.data.data || {};
        
        setInstructors(Array.isArray(data.instructors) ? data.instructors : []);
        setCurrentPage(data.pagination?.currentPage || 1);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalInstructors(data.pagination?.totalInstructors || 0);
      } else {
        throw new Error(response?.data?.message || 'Failed to load instructors');
      }
    } catch (err) {
      console.error('Error fetching instructors:', err);
      setError(err.message || 'Unable to load instructors');
      setInstructors([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInstructors();
  }, [fetchInstructors]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchInstructors(1, searchQuery, sortBy);
  };

  const handleSortChange = (event) => {
    const newSort = event.target.value;
    setSortBy(newSort);
    fetchInstructors(1, searchQuery, newSort);
  };

  const handlePageChange = (event, page) => {
    setCurrentPage(page);
    fetchInstructors(page, searchQuery, sortBy);
  };

  const handleInstructorClick = (instructorId) => {
    navigate(`/instructor/${instructorId}`);
  };

  const clearSearch = () => {
    setSearchQuery('');
    fetchInstructors(1, '', sortBy);
  };

  // Loading skeleton
  const renderSkeleton = () => (
    <Grid container spacing={3}>
      {[1, 2, 3, 4, 5, 6].map((item) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={item}>
          <Card sx={{ borderRadius: 2 }}>
            <Skeleton variant="rectangular" height={160} />
            <CardContent>
              <Box sx={{ mb: 2 }}>
                <Skeleton variant="text" height={28} width="80%" />
                <Skeleton variant="text" height={20} width="60%" />
              </Box>
              <Skeleton variant="rectangular" height={48} sx={{ borderRadius: 1, mb: 2 }} />
              <Skeleton variant="text" height={20} width="100%" />
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  if (loading && currentPage === 1) {
    return (
      <>
        <Navbar />
        <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
          <Box sx={{ mb: 6 }}>
            <Skeleton variant="text" height={48} width="300px" sx={{ mb: 2 }} />
            <Skeleton variant="text" height={24} width="400px" sx={{ mb: 4 }} />
            <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 1, mb: 4 }} />
          </Box>
          {renderSkeleton()}
        </Container>
      </>
    );
  }

  const renderInstructorCard = (instructor) => {
    const instructorId = instructor?.id;
    const name = instructor?.name || 'Instructor';
    const title = instructor?.title || '';
    const company = instructor?.company || '';
    const experience = instructor?.experience;
    const website = instructor?.website;
    const linkedin = instructor?.linkedin;
    const github = instructor?.github;
    const twitter = instructor?.twitter;
    const profilePicture = formatProfilePictureUrl(instructor?.profilePicture);
    
    const courseCount = getCourseCount(instructor);
    const studentCount = getStudentCount(instructor);
    const rating = getRating(instructor);
    const reviewCount = instructor?.stats?.totalReviews || 0;
    const experienceText = formatExperience(experience);

    return (
      <Grid item xs={12} sm={6} md={4} lg={3} key={instructorId}>
        <InstructorCard>
          <CardActionArea onClick={() => handleInstructorClick(instructorId)}>
            {/* Image Section */}
            <CardImage>
              <img
                src={profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=667eea&color=fff&size=400`}
                alt={name}
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=667eea&color=fff&size=400`;
                }}
              />
              {experienceText && (
                <Chip
                  size="small"
                  label={experienceText}
                  icon={<Work fontSize="small" />}
                  sx={{
                    position: 'absolute',
                    bottom: 12,
                    right: 12,
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    color: 'white',
                    fontWeight: 500,
                    fontSize: '0.75rem',
                  }}
                />
              )}
            </CardImage>

            <CardContent>
              {/* Name and Title */}
              <Typography variant="h6" fontWeight={600} sx={{ mb: 0.5 }}>
                {name}
              </Typography>
              
              <Typography variant="body2" color="primary" fontWeight={500} sx={{ mb: 1 }}>
                {title}
              </Typography>

              {/* Company */}
              {company && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  <Business sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'middle' }} />
                  {company}
                </Typography>
              )}

              {/* Stats */}
              <StatsBox sx={{ mb: 2 }}>
                <StatItem>
                  <School sx={{ fontSize: 18, color: 'primary.main', mb: 0.5 }} />
                  <Typography variant="body2" fontWeight={600}>
                    {courseCount}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Courses
                  </Typography>
                </StatItem>
                
                <StatItem>
                  <People sx={{ fontSize: 18, color: 'secondary.main', mb: 0.5 }} />
                  <Typography variant="body2" fontWeight={600}>
                    {studentCount}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Students
                  </Typography>
                </StatItem>
              </StatsBox>

              {/* Rating */}
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Rating
                  value={rating}
                  precision={0.5}
                  readOnly
                  size="small"
                  sx={{ mr: 1 }}
                />
                <Typography variant="body2" color="text.secondary">
                  {rating > 0 ? `${rating.toFixed(1)}` : 'No rating'}
                </Typography>
              </Box>
            </CardContent>
          </CardActionArea>

          {/* Footer */}
          <Box sx={{ p: 2, pt: 0 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {/* Social Links */}
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                {linkedin && (
                  <Tooltip title="LinkedIn">
                    <SocialButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(linkedin, '_blank');
                      }}
                    >
                      <LinkedIn fontSize="small" />
                    </SocialButton>
                  </Tooltip>
                )}
                {website && (
                  <Tooltip title="Website">
                    <SocialButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(website, '_blank');
                      }}
                    >
                      <Language fontSize="small" />
                    </SocialButton>
                  </Tooltip>
                )}
              </Box>

              {/* View Profile Button */}
              <Button
                size="small"
                variant="outlined"
                endIcon={<East fontSize="small" />}
                onClick={() => handleInstructorClick(instructorId)}
                sx={{
                  borderRadius: 1.5,
                  px: 2,
                  py: 0.5,
                  fontSize: '0.875rem',
                  fontWeight: 500,
                }}
              >
                View
              </Button>
            </Box>
          </Box>
        </InstructorCard>
      </Grid>
    );
  };

  const totalCourses = instructors.reduce((sum, inst) => sum + getCourseCount(inst), 0);

  return (
    <>
      <Navbar />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
        {/* Header */}
        <Box sx={{ mb: 6 }}>
          <Typography 
            variant="h4" 
            component="h1" 
            fontWeight={700} 
            gutterBottom
          >
            Expert Instructors
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Learn from industry professionals with real-world experience
          </Typography>

          {/* Search and Filter */}
          <Paper elevation={0} sx={{ p: 3, mb: 4, border: 1, borderColor: 'divider', borderRadius: 2 }}>
            <Box component="form" onSubmit={handleSearch}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    placeholder="Search instructors..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search />
                        </InputAdornment>
                      ),
                      endAdornment: searchQuery && (
                        <InputAdornment position="end">
                          <IconButton size="small" onClick={clearSearch}>
                            <Clear />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    size="medium"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth size="medium">
                    <InputLabel>Sort by</InputLabel>
                    <Select
                      value={sortBy}
                      label="Sort by"
                      onChange={handleSortChange}
                    >
                      <MenuItem value="featured">Featured</MenuItem>
                      <MenuItem value="name">Name A-Z</MenuItem>
                      <MenuItem value="rating">Highest Rating</MenuItem>
                      <MenuItem value="courses">Most Courses</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={2}>
                  <Button
                    fullWidth
                    variant="contained"
                    type="submit"
                    sx={{ py: 1.2 }}
                  >
                    Search
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Paper>

          {/* Error */}
          {error && (
            <Alert 
              severity="error" 
              sx={{ mb: 3 }}
              action={
                <Button color="inherit" size="small" onClick={() => fetchInstructors()}>
                  Retry
                </Button>
              }
            >
              {error}
            </Alert>
          )}

          {/* Stats */}
          {!error && totalInstructors > 0 && (
            <Box sx={{ mb: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Chip 
                label={`${totalInstructors} Instructors`}
                variant="outlined"
                size="small"
              />
              <Chip 
                label={`${totalCourses} Courses`}
                variant="outlined"
                size="small"
              />
            </Box>
          )}
        </Box>

        {/* Results Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" fontWeight={600}>
              {searchQuery ? `Results for "${searchQuery}"` : 'All Instructors'}
            </Typography>
            {totalPages > 1 && (
              <Typography variant="body2" color="text.secondary">
                Page {currentPage} of {totalPages}
              </Typography>
            )}
          </Box>
          <Divider />
        </Box>

        {/* Instructors Grid */}
        {!loading && instructors.length === 0 ? (
          <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 2 }}>
            <Search sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.5, mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No instructors found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {searchQuery 
                ? 'Try a different search term'
                : 'Check back soon for new instructors'}
            </Typography>
            {searchQuery && (
              <Button variant="outlined" onClick={clearSearch}>
                Clear Search
              </Button>
            )}
          </Paper>
        ) : (
          <>
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {(loading && currentPage > 1) 
                ? renderSkeleton()
                : instructors.map(renderInstructorCard)
              }
            </Grid>

            {/* Pagination */}
            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={handlePageChange}
                  color="primary"
                  size="medium"
                  sx={{
                    '& .MuiPaginationItem-root': {
                      borderRadius: 1,
                    }
                  }}
                />
              </Box>
            )}
          </>
        )}

        {/* CTA */}
        <Paper 
          elevation={0}
          sx={{ 
            p: 4, 
            mt: 8,
            textAlign: 'center',
            borderRadius: 2,
            border: 1,
            borderColor: 'primary.main',
            backgroundColor: alpha('#1976d2', 0.04),
          }}
        >
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Interested in teaching?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Share your expertise with our community of learners
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/become-instructor')}
            endIcon={<ArrowForward />}
            sx={{ borderRadius: 2 }}
          >
            Become an Instructor
          </Button>
        </Paper>
      </Container>
    </>
  );
};

export default InstructorList;