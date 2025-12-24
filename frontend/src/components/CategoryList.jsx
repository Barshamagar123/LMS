import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Chip,
  CircularProgress,
  Alert,
  Fade,
  alpha,
  useTheme,
  Skeleton,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Refresh,
  Category as CategoryIcon,
  ExpandMore,
  FilterList,
  Sort,
  LibraryBooks,
  People,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import Navbar from './Navbar';

// Custom styled components
const GradientCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.primary.light, 0.05)} 100%)`,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  borderRadius: 16,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: `0 12px 24px ${alpha(theme.palette.primary.main, 0.15)}`,
    borderColor: alpha(theme.palette.primary.main, 0.3),
  },
}));

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0
  });
  const theme = useTheme();

  // Fetch categories with dynamic course counts and student counts
  const fetchCategoriesWithStats = async () => {
    try {
      setLoading(true);
      setError('');

      console.log('Fetching category stats...');
      const response = await fetch('http://localhost:3000/api/categories/stats');

      if (!response.ok) {
        throw new Error(`Failed to fetch category stats (${response.status})`);
      }

      const data = await response.json();
      console.log('Category stats received:', data);

      // Transform the data to match the expected format
      const categoriesWithStats = data.categories.map(category => {
        return {
          id: category.id,
          name: category.name,
          courseCount: category.courseCount,
          studentCount: category.studentCount,
          popularTags: ['Beginner', 'Hands-on', 'Project-based'].slice(0, Math.floor(Math.random() * 3) + 1)
        };
      });

      // Sort by course count (descending)
      categoriesWithStats.sort((a, b) => b.courseCount - a.courseCount);

      setCategories(categoriesWithStats);
      setStats(data.stats);

      console.log('Final categories:', categoriesWithStats);
      console.log('Total stats:', data.stats);

    } catch (err) {
      console.error('Error in fetchCategoriesWithStats:', err);
      setError(err.message || 'Unable to load categories. Please check the console for details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoriesWithStats();
  }, []);

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    console.log('Selected category:', category);
  };

  const handleRefresh = () => {
    fetchCategoriesWithStats();
  };

  const LoadingSkeleton = () => (
    <Grid container spacing={3}>
      {[...Array(8)].map((_, index) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
          <GradientCard>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Skeleton variant="circular" width={40} height={40} />
                <Box ml={2} flex={1}>
                  <Skeleton variant="text" width="60%" height={28} />
                  <Skeleton variant="text" width="40%" height={20} />
                </Box>
              </Box>
              <Box display="flex" gap={1} mb={2}>
                <Skeleton variant="rounded" width={60} height={24} />
                <Skeleton variant="rounded" width={80} height={24} />
              </Box>
              <Skeleton variant="rectangular" height={40} sx={{ borderRadius: 1 }} />
            </CardContent>
          </GradientCard>
        </Grid>
      ))}
    </Grid>
  );

  const getCategoryColor = (name) => {
    const colors = [
      theme.palette.primary.main,
      theme.palette.secondary.main,
      theme.palette.success.main,
      theme.palette.warning.main,
      theme.palette.info.main,
      theme.palette.error.main,
    ];
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  if (error) {
    return (
      <>
        <Navbar />
        <Container maxWidth="lg" sx={{ mt: 6, mb: 6 }}>
          <Fade in>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '60vh',
                textAlign: 'center',
              }}
            >
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  backgroundColor: alpha(theme.palette.error.light, 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 3,
                }}
              >
                <CategoryIcon sx={{ fontSize: 40, color: 'error.main' }} />
              </Box>
              <Typography variant="h5" color="text.primary" gutterBottom>
                Connection Issue
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 400, mb: 3 }}>
                {error}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 2 }}>
                Check browser console for details
              </Typography>
              <Box display="flex" gap={2}>
                <Tooltip title="Retry loading">
                  <IconButton
                    onClick={handleRefresh}
                    sx={{
                      backgroundColor: 'primary.main',
                      color: 'white',
                      '&:hover': { backgroundColor: 'primary.dark' },
                    }}
                  >
                    <Refresh />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </Fade>
        </Container>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <Container maxWidth="xl" sx={{ mt: 4, mb: 8, pt: 4 }}>
        {/* Header Section */}
        <Box sx={{ mb: 6 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Box>
              <Typography
                variant="h3"
                component="h1"
                fontWeight="700"
                sx={{
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 1,
                }}
              >
                Course Categories
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600 }}>
                Explore learning domains with {stats.totalCourses} courses across {categories.length} categories
              </Typography>
            </Box>
            
            <Box display="flex" alignItems="center" gap={2}>
              <Box display="flex" gap={2}>
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '4px 12px',
                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                    color: theme.palette.primary.dark,
                    borderRadius: 20,
                    fontSize: '0.875rem',
                    fontWeight: 500,
                  }}
                >
                  <LibraryBooks sx={{ fontSize: 16, mr: 1 }} />
                  {stats.totalCourses} Courses
                </Box>
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '4px 12px',
                    backgroundColor: alpha(theme.palette.info.main, 0.1),
                    color: theme.palette.info.dark,
                    borderRadius: 20,
                    fontSize: '0.875rem',
                    fontWeight: 500,
                  }}
                >
                  <People sx={{ fontSize: 16, mr: 1 }} />
                  {stats.totalStudents} Students
                </Box>
              </Box>
              
              <Tooltip title="Refresh">
                <IconButton
                  onClick={handleRefresh}
                  size="small"
                  sx={{
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.05),
                    },
                  }}
                >
                  <Refresh />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          {/* View Mode Toggle */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mt={3}>
            <Box display="flex" gap={1}>
              <Chip
                icon={<FilterList />}
                label="All Categories"
                size="small"
                variant="outlined"
                onClick={() => setViewMode('grid')}
                color={viewMode === 'grid' ? 'primary' : 'default'}
                sx={{ fontWeight: 500 }}
              />
              <Chip
                icon={<Sort />}
                label="Compact View"
                size="small"
                variant="outlined"
                onClick={() => setViewMode('list')}
                color={viewMode === 'list' ? 'primary' : 'default'}
                sx={{ fontWeight: 500 }}
              />
            </Box>
            
            {selectedCategory && (
              <Box display="flex" alignItems="center" gap={1}>
                <Typography variant="body2" color="text.secondary">
                  Selected:
                </Typography>
                <Chip
                  label={selectedCategory.name}
                  size="small"
                  onDelete={() => setSelectedCategory(null)}
                  sx={{ 
                    backgroundColor: alpha(getCategoryColor(selectedCategory.name), 0.1),
                    fontWeight: 500 
                  }}
                />
              </Box>
            )}
          </Box>
        </Box>



        {/* Main Content */}
        {loading ? (
          <LoadingSkeleton />
        ) : categories.length === 0 ? (
          <Fade in>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '40vh',
                textAlign: 'center',
                py: 8,
              }}
            >
              <Box
                sx={{
                  width: 120,
                  height: 120,
                  borderRadius: '50%',
                  backgroundColor: alpha(theme.palette.primary.main, 0.05),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 3,
                }}
              >
                <CategoryIcon sx={{ fontSize: 60, color: 'primary.main', opacity: 0.3 }} />
              </Box>
              <Typography variant="h5" color="text.primary" gutterBottom>
                No Categories Found
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 400, mb: 3 }}>
                Add categories through your admin dashboard to get started.
              </Typography>
              <IconButton
                onClick={handleRefresh}
                sx={{
                  backgroundColor: 'primary.main',
                  color: 'white',
                  '&:hover': { backgroundColor: 'primary.dark' },
                }}
              >
                <Refresh />
              </IconButton>
            </Box>
          </Fade>
        ) : viewMode === 'grid' ? (
          <Fade in>
            <Grid container spacing={3}>
              {categories.map((category) => {
                const categoryColor = getCategoryColor(category.name);
                
                return (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={category.id}>
                    <GradientCard
                      elevation={0}
                      onClick={() => handleCategoryClick(category)}
                      sx={{
                        cursor: 'pointer',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        ...(selectedCategory?.id === category.id && {
                          borderColor: categoryColor,
                          backgroundColor: alpha(categoryColor, 0.03),
                        }),
                      }}
                    >
                      <CardActionArea sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <CardContent sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
                          <Box display="flex" alignItems="center" mb={2}>
                            <Box
                              sx={{
                                width: 48,
                                height: 48,
                                borderRadius: '12px',
                                backgroundColor: alpha(categoryColor, 0.1),
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                mr: 2,
                                flexShrink: 0,
                              }}
                            >
                              <Typography
                                variant="h6"
                                sx={{
                                  color: categoryColor,
                                  fontWeight: '700',
                                  fontSize: '1.25rem',
                                }}
                              >
                                {category.name.charAt(0).toUpperCase()}
                              </Typography>
                            </Box>
                            <Box flex={1} minWidth={0}>
                              <Typography
                                variant="h6"
                                component="div"
                                fontWeight="600"
                                color="text.primary"
                                noWrap
                                sx={{ fontSize: '1rem' }}
                              >
                                {category.name}
                              </Typography>
                              <Box display="flex" gap={1} mt={0.5}>
                                <Box
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 0.5,
                                    padding: '2px 8px',
                                    backgroundColor: alpha(theme.palette.success.main, 0.1),
                                    color: theme.palette.success.dark,
                                    borderRadius: 12,
                                    fontSize: '0.75rem',
                                    fontWeight: 500,
                                  }}
                                >
                                  <LibraryBooks sx={{ fontSize: 12 }} />
                                  {category.courseCount} {category.courseCount === 1 ? 'course' : 'courses'}
                                </Box>
                                {category.studentCount > 0 && (
                                  <Box
                                    sx={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: 0.5,
                                      padding: '2px 8px',
                                      backgroundColor: alpha(theme.palette.info.main, 0.1),
                                      color: theme.palette.info.dark,
                                      borderRadius: 12,
                                      fontSize: '0.75rem',
                                      fontWeight: 500,
                                    }}
                                  >
                                    <People sx={{ fontSize: 12 }} />
                                    {category.studentCount} students
                                  </Box>
                                )}
                              </Box>
                            </Box>
                          </Box>
                          
                          {/* Popular Tags */}
                          {category.popularTags && category.popularTags.length > 0 && (
                            <Box display="flex" flexWrap="wrap" gap={0.5} mb={2}>
                              {category.popularTags.map((tag, index) => (
                                <Chip
                                  key={index}
                                  label={tag}
                                  size="small"
                                  sx={{
                                    fontSize: '0.65rem',
                                    height: 20,
                                    backgroundColor: alpha(categoryColor, 0.05),
                                    color: categoryColor,
                                  }}
                                />
                              ))}
                            </Box>
                          )}
                          
                          <Box sx={{ mt: 'auto', pt: 2 }}>
                            <Divider sx={{ mb: 1.5, opacity: 0.3 }} />
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                              <Typography variant="caption" color="text.secondary">
                                {category.courseCount === 0 
                                  ? 'No courses yet' 
                                  : category.studentCount === 0
                                    ? `${category.courseCount} courses available`
                                    : `${category.studentCount} students enrolled`
                                }
                              </Typography>
                              <ExpandMore
                                sx={{
                                  color: 'text.secondary',
                                  fontSize: 20,
                                  transform: selectedCategory?.id === category.id ? 'rotate(180deg)' : 'none',
                                  transition: 'transform 0.2s',
                                }}
                              />
                            </Box>
                          </Box>
                        </CardContent>
                      </CardActionArea>
                    </GradientCard>
                  </Grid>
                );
              })}
            </Grid>
          </Fade>
        ) : (
          <Fade in>
            <Box sx={{ maxWidth: 900, mx: 'auto' }}>
              {categories.map((category, index) => {
                const categoryColor = getCategoryColor(category.name);
                
                return (
                  <React.Fragment key={category.id}>
                    <Box
                      onClick={() => handleCategoryClick(category)}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        p: 2.5,
                        borderRadius: 2,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        '&:hover': {
                          backgroundColor: alpha(categoryColor, 0.03),
                          transform: 'translateX(4px)',
                        },
                        ...(selectedCategory?.id === category.id && {
                          backgroundColor: alpha(categoryColor, 0.05),
                          borderLeft: `4px solid ${categoryColor}`,
                        }),
                      }}
                    >
                      <Box
                        sx={{
                          width: 44,
                          height: 44,
                          borderRadius: '12px',
                          backgroundColor: alpha(categoryColor, 0.1),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mr: 3,
                          flexShrink: 0,
                        }}
                      >
                        <Typography variant="body2" fontWeight="700" color={categoryColor}>
                          {category.name.charAt(0).toUpperCase()}
                        </Typography>
                      </Box>
                      
                      <Box flex={1} minWidth={0}>
                        <Typography variant="h6" fontWeight="600" color="text.primary" sx={{ mb: 0.5 }}>
                          {category.name}
                        </Typography>
                        <Box display="flex" gap={2} alignItems="center">
                          <Box display="flex" alignItems="center" gap={0.5}>
                            <LibraryBooks sx={{ fontSize: 14, color: 'success.main' }} />
                            <Typography variant="body2" color="text.secondary">
                              {category.courseCount} {category.courseCount === 1 ? 'course' : 'courses'}
                            </Typography>
                          </Box>
                          {category.studentCount > 0 && (
                            <Box display="flex" alignItems="center" gap={0.5}>
                              <People sx={{ fontSize: 14, color: 'info.main' }} />
                              <Typography variant="body2" color="text.secondary">
                                {category.studentCount} students
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </Box>
                      
                      <Box display="flex" alignItems="center" gap={2}>
                        {category.popularTags && category.popularTags.length > 0 && (
                          <Box display="flex" gap={0.5}>
                            {category.popularTags.slice(0, 2).map((tag, tagIndex) => (
                              <Chip
                                key={tagIndex}
                                label={tag}
                                size="small"
                                sx={{
                                  fontSize: '0.65rem',
                                  height: 22,
                                  backgroundColor: alpha(categoryColor, 0.05),
                                  color: categoryColor,
                                }}
                              />
                            ))}
                            {category.popularTags.length > 2 && (
                              <Chip
                                label={`+${category.popularTags.length - 2}`}
                                size="small"
                                sx={{
                                  fontSize: '0.65rem',
                                  height: 22,
                                }}
                              />
                            )}
                          </Box>
                        )}
                        
                        <ExpandMore
                          sx={{
                            color: 'text.secondary',
                            transform: selectedCategory?.id === category.id ? 'rotate(180deg)' : 'none',
                            transition: 'transform 0.2s',
                          }}
                        />
                      </Box>
                    </Box>
                    {index < categories.length - 1 && (
                      <Divider sx={{ my: 1, opacity: 0.3 }} />
                    )}
                  </React.Fragment>
                );
              })}
            </Box>
          </Fade>
        )}

        {/* Bottom Stats */}
        {!loading && categories.length > 0 && (
          <Fade in>
            <Box
              sx={{
                mt: 6,
                pt: 4,
                borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                textAlign: 'center',
              }}
            >
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Showing {categories.length} categories • {stats.totalCourses} total courses • {stats.totalStudents} total students
                {selectedCategory && ` • ${selectedCategory.name} selected`}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                Click on a category to view its courses
              </Typography>
              <Box display="flex" justifyContent="center" gap={2}>
                <Tooltip title="Refresh categories">
                  <IconButton
                    onClick={handleRefresh}
                    size="small"
                    sx={{
                      color: 'primary.main',
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.08),
                      },
                    }}
                  >
                    <Refresh />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </Fade>
        )}
      </Container>
    </>
  );
};

export default CategoryList;
