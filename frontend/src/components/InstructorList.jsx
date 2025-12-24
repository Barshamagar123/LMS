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
  Avatar,
  Fade,
  Zoom,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Search,
  Clear,
  School,
  People,
  Star,
  ArrowForward,
  Business,
  Work,
  Language,
  LinkedIn,
  FilterList,
  TrendingUp,
  Verified,
  CheckCircle,
  Groups,
  Numbers,
  PlayCircle
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import Navbar from '../components/Navbar';
import API from '../api/axios';
import { formatProfilePictureUrl } from '../utils/imageUtils';

// Narrower Card Components
const InstructorCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: theme.spacing(1.5),
  transition: 'all 0.25s ease',
  border: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper,
  overflow: 'hidden',
  position: 'relative',
  maxWidth: 280, // Limit maximum width
  margin: '0 auto', // Center card in grid cell
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[2],
    borderColor: alpha(theme.palette.primary.main, 0.2),
  },
}));

const CardImage = styled(CardMedia)(({ theme }) => ({
  height: 140,
  position: 'relative',
  overflow: 'hidden',
  width: '100%',
  '& img': {
    objectFit: 'cover',
    width: '100%',
    height: '100%',
    transition: 'transform 0.3s ease',
  },
}));

const StatsBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(0.75),
  backgroundColor: theme.palette.background.default,
  borderRadius: theme.spacing(0.75),
  border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
  marginTop: 'auto',
  width: '100%',
}));

const StatItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  flex: 1,
  minWidth: 0, // Prevent overflow
}));

const VerifiedBadge = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 10,
  right: 10,
  backgroundColor: theme.palette.success.main,
  color: 'white',
  width: 20,
  height: 20,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 2,
  boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
  '& svg': {
    fontSize: 12,
  }
}));

const InstructorList = () => {
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalInstructors, setTotalInstructors] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const fetchInstructors = useCallback(async (page = 1, search = '', sort = 'featured') => {
    try {
      setLoading(true);
      setIsSearching(search !== '');
      setError('');

      const response = await API.get('/instructor/public', {
        params: {
          page,
          limit: 16, // Show more cards per page since they're narrower
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
      setIsSearching(false);
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleInstructorClick = (instructorId) => {
    navigate(`/instructor/${instructorId}`);
  };

  const clearSearch = () => {
    setSearchQuery('');
    fetchInstructors(1, '', sortBy);
  };

  const renderSkeleton = () => (
    <Grid container spacing={2}>
      {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={item}>
          <Card sx={{ borderRadius: 1.5, height: '100%', maxWidth: 280, margin: '0 auto' }}>
            <Skeleton variant="rectangular" height={140} animation="wave" />
            <CardContent sx={{ p: 1.5 }}>
              <Skeleton variant="text" height={20} width="80%" animation="wave" sx={{ mb: 1 }} />
              <Skeleton variant="text" height={16} width="60%" animation="wave" sx={{ mb: 1.5 }} />
              <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
                <Skeleton variant="rounded" width={60} height={20} animation="wave" />
                <Skeleton variant="rounded" width={40} height={20} animation="wave" />
              </Box>
              <Skeleton variant="rectangular" height={40} sx={{ borderRadius: 0.75 }} animation="wave" />
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
        <Container maxWidth="xl" sx={{ mt: 3, mb: 6 }}>
          <Box sx={{ mb: 3 }}>
            <Skeleton variant="text" height={36} width={200} animation="wave" sx={{ mb: 1 }} />
            <Skeleton variant="text" height={18} width={250} animation="wave" sx={{ mb: 2 }} />
            <Skeleton variant="rounded" height={44} sx={{ borderRadius: 1, mb: 2 }} animation="wave" />
          </Box>
          {renderSkeleton()}
        </Container>
      </>
    );
  }

  const renderInstructorCard = (instructor, index) => {
    const instructorId = instructor?.id;
    const name = instructor?.name || 'Instructor';
    const title = instructor?.title || '';
    const company = instructor?.company || '';
    const experience = instructor?.experience;
    const website = instructor?.website;
    const linkedin = instructor?.linkedin;
    const profilePicture = formatProfilePictureUrl(instructor?.profilePicture);
    const isVerified = instructor?.verified || false;
    
    const courseCount = getCourseCount(instructor);
    const studentCount = getStudentCount(instructor);
    const rating = getRating(instructor);
    const experienceText = formatExperience(experience);

    return (
      <Grid item xs={12} sm={6} md={4} lg={3} key={instructorId}>
        <InstructorCard>
          {isVerified && (
            <VerifiedBadge>
              <CheckCircle />
            </VerifiedBadge>
          )}

          <CardActionArea 
            onClick={() => handleInstructorClick(instructorId)}
            sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
          >
            <CardImage>
              <img
                src={profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=667eea&color=fff&size=400`}
                alt={name}
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=667eea&color=fff&size=400`;
                }}
              />
            </CardImage>

            <CardContent sx={{ p: 1.5, flexGrow: 1, width: '100%' }}>
              <Box sx={{ mb: 1 }}>
                <Typography 
                  variant="body1" 
                  fontWeight={600} 
                  sx={{ 
                    mb: 0.25,
                    lineHeight: 1.2,
                    fontSize: '0.95rem'
                  }}
                >
                  {name}
                </Typography>
                
                <Typography 
                  variant="caption" 
                  color="primary" 
                  fontWeight={500}
                  sx={{ 
                    display: 'block',
                    lineHeight: 1.2,
                    fontSize: '0.8rem'
                  }}
                >
                  {title}
                </Typography>
              </Box>

              {company && (
                <Typography 
                  variant="caption" 
                  color="text.secondary" 
                  sx={{ 
                    display: 'flex',
                    alignItems: 'center',
                    mb: 1,
                    fontSize: '0.75rem'
                  }}
                >
                  <Business sx={{ fontSize: 10, mr: 0.5, opacity: 0.7 }} />
                  {company.length > 20 ? `${company.substring(0, 20)}...` : company}
                </Typography>
              )}

              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                {experienceText && (
                  <Chip
                    size="small"
                    label={experienceText}
                    icon={<Work sx={{ fontSize: 12 }} />}
                    sx={{
                      fontSize: '0.7rem',
                      height: 20,
                      '& .MuiChip-icon': { ml: 0.5, mr: -0.5 }
                    }}
                  />
                )}
                
                <Box sx={{ display: 'flex', alignItems: 'center', ml: 'auto' }}>
                  <Star sx={{ fontSize: 14, color: 'warning.main', mr: 0.25 }} />
                  <Typography variant="caption" fontWeight={600} sx={{ fontSize: '0.75rem' }}>
                    {rating > 0 ? rating.toFixed(1) : 'New'}
                  </Typography>
                </Box>
              </Box>

              <StatsBox>
                <StatItem>
                  <School sx={{ fontSize: 13, color: 'primary.main', mb: 0.25 }} />
                  <Typography variant="caption" fontWeight={700} sx={{ fontSize: '0.8rem' }}>
                    {courseCount}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                    Courses
                  </Typography>
                </StatItem>
                
                <StatItem>
                  <People sx={{ fontSize: 13, color: 'secondary.main', mb: 0.25 }} />
                  <Typography variant="caption" fontWeight={700} sx={{ fontSize: '0.8rem' }}>
                    {studentCount > 1000 ? `${(studentCount/1000).toFixed(0)}k` : studentCount}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                    Students
                  </Typography>
                </StatItem>

                <StatItem>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {linkedin && (
                      <LinkedIn sx={{ fontSize: 14, color: 'text.secondary' }} />
                    )}
                    {website && (
                      <Language sx={{ fontSize: 14, color: 'text.secondary' }} />
                    )}
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', mt: 0.25 }}>
                    Contact
                  </Typography>
                </StatItem>
              </StatsBox>
            </CardContent>
          </CardActionArea>
        </InstructorCard>
      </Grid>
    );
  };

  const totalCourses = instructors.reduce((sum, inst) => sum + getCourseCount(inst), 0);
  const totalStudents = instructors.reduce((sum, inst) => sum + getStudentCount(inst), 0);

  return (
    <>
      <Navbar />
      <Container maxWidth="xl" sx={{ mt: 3, mb: 6, px: { xs: 2, sm: 3 } }}>
        <Box sx={{ mb: 3 }}>
          <Typography 
            variant="h5" 
            fontWeight={700} 
            gutterBottom
            sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem' } }}
          >
            Expert Instructors
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
            Learn from industry leaders
          </Typography>

          <Paper 
            elevation={0} 
            sx={{ 
              p: 2, 
              mb: 2.5, 
              border: 1, 
              borderColor: 'divider', 
              borderRadius: 1.5,
              backgroundColor: 'background.default'
            }}
          >
            <Box component="form" onSubmit={handleSearch}>
              <Grid container spacing={1.5} alignItems="center">
                <Grid item xs={12} md={7}>
                  <TextField
                    fullWidth
                    placeholder="Search instructors by name, expertise, or company..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    size="small"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 1,
                        fontSize: '0.9rem',
                      }
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search sx={{ fontSize: 18, opacity: 0.7 }} />
                        </InputAdornment>
                      ),
                      endAdornment: searchQuery && (
                        <InputAdornment position="end">
                          <IconButton 
                            size="small" 
                            onClick={clearSearch}
                            sx={{ p: 0.5 }}
                          >
                            <Clear sx={{ fontSize: 16 }} />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={8} md={3}>
                  <FormControl fullWidth size="small">
                    <Select
                      value={sortBy}
                      onChange={handleSortChange}
                      displayEmpty
                      sx={{ 
                        borderRadius: 1,
                        fontSize: '0.9rem',
                        '& .MuiSelect-select': {
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5,
                          py: 1
                        }
                      }}
                    >
                      <MenuItem value="featured">
                        <TrendingUp sx={{ fontSize: 16 }} />
                        Featured
                      </MenuItem>
                      <MenuItem value="name">Name A-Z</MenuItem>
                      <MenuItem value="rating">Highest Rating</MenuItem>
                      <MenuItem value="courses">Most Courses</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={4} md={2}>
                  <Button
                    fullWidth
                    variant="contained"
                    type="submit"
                    disabled={isSearching}
                    size="small"
                    sx={{ 
                      borderRadius: 1,
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      py: 1
                    }}
                  >
                    {isSearching ? <CircularProgress size={18} /> : 'Search'}
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Paper>

          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 2.5,
                borderRadius: 1,
                fontSize: '0.85rem',
                py: 0.5
              }}
              action={
                <Button 
                  color="inherit" 
                  size="small" 
                  onClick={() => fetchInstructors()}
                  sx={{ minWidth: 'auto', fontSize: '0.8rem' }}
                >
                  Retry
                </Button>
              }
            >
              {error}
            </Alert>
          )}

          {!error && totalInstructors > 0 && (
            <Box sx={{ display: 'flex', gap: 1, mb: 2.5, flexWrap: 'wrap' }}>
              <Chip 
                size="small"
                label={`${totalInstructors} Instructors`}
                sx={{ fontSize: '0.75rem' }}
              />
              <Chip 
                size="small"
                label={`${totalCourses} Courses`}
                sx={{ fontSize: '0.75rem' }}
              />
              <Chip 
                size="small"
                label={`${totalStudents}+ Students`}
                sx={{ fontSize: '0.75rem' }}
              />
            </Box>
          )}
        </Box>

        <Box sx={{ mb: 2 }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mb: 1.5 
          }}>
            <Typography variant="subtitle1" fontWeight={600}>
              {searchQuery ? `Results for "${searchQuery}"` : 'All Instructors'}
            </Typography>
            {totalPages > 1 && (
              <Typography variant="caption" color="text.secondary">
                Page {currentPage} of {totalPages}
              </Typography>
            )}
          </Box>
          <Divider />
        </Box>

        {!loading && instructors.length === 0 ? (
          <Paper sx={{ 
            p: 4, 
            textAlign: 'center', 
            borderRadius: 1.5,
            border: `1px dashed ${theme.palette.divider}`,
            maxWidth: 400,
            mx: 'auto'
          }}>
            <Search sx={{ 
              fontSize: 36, 
              color: 'text.secondary', 
              opacity: 0.4, 
              mb: 1.5 
            }} />
            <Typography variant="body2" color="text.secondary" gutterBottom fontWeight={500}>
              No instructors found
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              {searchQuery 
                ? 'Try a different search term'
                : 'Check back soon for new instructors'}
            </Typography>
            {searchQuery && (
              <Button 
                variant="outlined" 
                size="small"
                onClick={clearSearch}
                sx={{ mt: 2 }}
              >
                Clear Search
              </Button>
            )}
          </Paper>
        ) : (
          <>
            <Grid container spacing={2}>
              {(loading && currentPage > 1) 
                ? renderSkeleton()
                : instructors.map(renderInstructorCard)
              }
            </Grid>

            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={handlePageChange}
                  color="primary"
                  size={isMobile ? "small" : "medium"}
                  siblingCount={0}
                  boundaryCount={1}
                  sx={{
                    '& .MuiPaginationItem-root': {
                      borderRadius: 0.75,
                      fontSize: '0.85rem',
                      minWidth: 28,
                      height: 28,
                    }
                  }}
                />
              </Box>
            )}
          </>
        )}

        <Paper 
          elevation={0}
          sx={{ 
            p: 3, 
            mt: 5,
            textAlign: 'center',
            borderRadius: 1.5,
            border: 1,
            borderColor: 'primary.light',
            backgroundColor: alpha(theme.palette.primary.main, 0.02),
            maxWidth: 500,
            mx: 'auto'
          }}
        >
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Interested in teaching?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Share your expertise with our community
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/become-instructor')}
            size="small"
            sx={{ 
              borderRadius: 1,
              fontWeight: 600,
              fontSize: '0.85rem'
            }}
          >
            Become an Instructor
          </Button>
        </Paper>
      </Container>
    </>
  );
};

// Utility functions remain the same
const formatExperience = (years) => {
  if (!years && years !== 0) return null;
  const yearsNum = parseInt(years);
  if (isNaN(yearsNum)) return null;
  return `${yearsNum} yrs`;
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

export default InstructorList;