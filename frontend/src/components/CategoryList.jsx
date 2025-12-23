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
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import Navbar from './Navbar';

// Custom styled components with blue theme
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

const SectionHeader = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: -8,
    left: 0,
    width: 60,
    height: 3,
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
    borderRadius: 2,
  },
}));

const StatBadge = styled(Box)(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  padding: '4px 12px',
  backgroundColor: alpha(theme.palette.primary.main, 0.1),
  color: theme.palette.primary.dark,
  borderRadius: 20,
  fontSize: '0.875rem',
  fontWeight: 500,
}));

const MinimalChip = styled(Chip)(({ theme }) => ({
  backgroundColor: 'transparent',
  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
  color: theme.palette.primary.dark,
  fontWeight: 400,
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
    borderColor: theme.palette.primary.main,
  },
}));

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [selectedCategory, setSelectedCategory] = useState(null);
  const theme = useTheme();

  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Simulate network delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const response = await fetch('http://localhost:3000/api/categories', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch categories (${response.status})`);
      }

      const data = await response.json();
      setCategories(data);
    } catch (err) {
      setError(err.message || 'Unable to load categories. Please try again.');
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    // You can implement navigation or filtering logic here
    console.log('Selected category:', category);
  };

  const handleRefresh = () => {
    fetchCategories();
  };

  const LoadingSkeleton = () => (
    <Grid container spacing={3}>
      {[...Array(6)].map((_, index) => (
        <Grid item xs={12} sm={6} md={4} key={index}>
          <GradientCard>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Skeleton variant="circular" width={40} height={40} />
                <Box ml={2} flex={1}>
                  <Skeleton variant="text" width="60%" height={28} />
                  <Skeleton variant="text" width="40%" height={20} />
                </Box>
              </Box>
              <Skeleton variant="rectangular" height={40} sx={{ borderRadius: 1 }} />
            </CardContent>
          </GradientCard>
        </Grid>
      ))}
    </Grid>
  );

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
      {/* Navbar outside Container to take full width */}
      <Navbar />
      
      {/* Main content with Container for proper width */}
      <Container maxWidth="lg" sx={{ mt: 4, mb: 8, pt: 4 }}>
        {/* Header Section */}
        <Box sx={{ mb: 6 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Box>
              <Typography
                variant="h3"
                component="h1"
                fontWeight="600"
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
                Explore our curated collection of learning domains. Each category represents a specialized 
                field of study with expertly crafted courses.
              </Typography>
            </Box>
            
            <Box display="flex" alignItems="center" gap={2}>
              <StatBadge>
                <CategoryIcon sx={{ fontSize: 16, mr: 1 }} />
                {loading ? '...' : categories.length} Categories
              </StatBadge>
              
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
              />
              <Chip
                icon={<Sort />}
                label="Compact View"
                size="small"
                variant="outlined"
                onClick={() => setViewMode('list')}
                color={viewMode === 'list' ? 'primary' : 'default'}
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
                  sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.1) }}
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
                No Categories Yet
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 400, mb: 3 }}>
                Learning domains will appear here once they're curated by our education team.
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
          // Grid View
          <Fade in>
            <Grid container spacing={3}>
              {categories.map((category) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={category.id}>
                  <GradientCard
                    elevation={0}
                    onClick={() => handleCategoryClick(category)}
                    sx={{
                      cursor: 'pointer',
                      ...(selectedCategory?.id === category.id && {
                        borderColor: 'primary.main',
                        backgroundColor: alpha(theme.palette.primary.main, 0.03),
                      }),
                    }}
                  >
                    <CardActionArea sx={{ height: '100%' }}>
                      <CardContent sx={{ p: 3 }}>
                        <Box display="flex" alignItems="center" mb={2}>
                          <Box
                            sx={{
                              width: 48,
                              height: 48,
                              borderRadius: '50%',
                              backgroundColor: alpha(theme.palette.primary.main, 0.1),
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              mr: 2,
                            }}
                          >
                            <Typography
                              variant="h6"
                              sx={{
                                color: 'primary.main',
                                fontWeight: '600',
                              }}
                            >
                              {category.name.charAt(0)}
                            </Typography>
                          </Box>
                          <Box flex={1}>
                            <Typography
                              variant="h6"
                              component="div"
                              fontWeight="500"
                              color="text.primary"
                              noWrap
                            >
                              {category.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Category ID: {category.id}
                            </Typography>
                          </Box>
                        </Box>
                        
                        <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                          <MinimalChip
                            label="Explore"
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCategoryClick(category);
                            }}
                          />
                          <ExpandMore
                            sx={{
                              color: 'text.secondary',
                              fontSize: 20,
                              transform: selectedCategory?.id === category.id ? 'rotate(180deg)' : 'none',
                              transition: 'transform 0.2s',
                            }}
                          />
                        </Box>
                      </CardContent>
                    </CardActionArea>
                  </GradientCard>
                </Grid>
              ))}
            </Grid>
          </Fade>
        ) : (
          // List View
          <Fade in>
            <Box sx={{ maxWidth: 800, mx: 'auto' }}>
              {categories.map((category, index) => (
                <React.Fragment key={category.id}>
                  <Box
                    onClick={() => handleCategoryClick(category)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      p: 2,
                      borderRadius: 2,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.03),
                        transform: 'translateX(4px)',
                      },
                      ...(selectedCategory?.id === category.id && {
                        backgroundColor: alpha(theme.palette.primary.main, 0.05),
                        borderLeft: `3px solid ${theme.palette.primary.main}`,
                      }),
                    }}
                  >
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mr: 3,
                        flexShrink: 0,
                      }}
                    >
                      <Typography variant="body2" fontWeight="600" color="primary.main">
                        {index + 1}
                      </Typography>
                    </Box>
                    
                    <Box flex={1}>
                      <Typography variant="h6" fontWeight="500" color="text.primary">
                        {category.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Learning domain with specialized courses
                      </Typography>
                    </Box>
                    
                    <Box display="flex" alignItems="center" gap={2}>
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'text.secondary',
                          backgroundColor: alpha(theme.palette.primary.main, 0.05),
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 1,
                        }}
                      >
                        ID: {category.id}
                      </Typography>
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
                    <Divider sx={{ my: 1, opacity: 0.5 }} />
                  )}
                </React.Fragment>
              ))}
            </Box>
          </Fade>
        )}

        {/* Bottom Action Area */}
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
                Showing {categories.length} learning categories
                {selectedCategory && ` • ${selectedCategory.name} selected`}
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