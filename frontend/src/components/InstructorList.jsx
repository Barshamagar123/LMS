// components/InstructorList.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Grid,
  Container,
  Box,
  Button,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Rating,
  Pagination,
  Skeleton,
  Alert
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import PeopleIcon from '@mui/icons-material/People';
import SchoolIcon from '@mui/icons-material/School';
import StarIcon from '@mui/icons-material/Star';
import WorkIcon from '@mui/icons-material/Work';

const InstructorList = () => {
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 1
  });

  const fetchInstructors = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/instructors/public', {
        params: {
          page: pagination.page,
          limit: pagination.limit,
          search: search,
          sort: sortBy
        }
      });
      
      setInstructors(response.data.instructors);
      setPagination(response.data.pagination);
      setError(null);
    } catch (err) {
      console.error('Error fetching instructors:', err);
      setError('Failed to load instructors. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstructors();
  }, [pagination.page, sortBy, search]);

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      fetchInstructors();
    }
  };

  const handleSearchClick = () => {
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchInstructors();
  };

  const handlePageChange = (event, value) => {
    setPagination(prev => ({ ...prev, page: value }));
  };

  const formatImageUrl = (url) => {
    if (!url) return '/default-avatar.jpg';
    if (url.startsWith('http')) return url;
    return `http://localhost:5000${url}`;
  };

  const InstructorCard = ({ instructor }) => (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow duration-300">
      <CardMedia
        component="img"
        height="200"
        image={formatImageUrl(instructor.profilePicture)}
        alt={instructor.name}
        className="object-cover"
      />
      <CardContent className="flex-1">
        <Typography variant="h6" component="h2" gutterBottom>
          {instructor.name}
        </Typography>
        
        {instructor.title && (
          <Typography variant="subtitle1" color="primary" gutterBottom>
            {instructor.title}
          </Typography>
        )}
        
        {instructor.company && (
          <Box className="flex items-center gap-1 mb-2">
            <WorkIcon fontSize="small" />
            <Typography variant="body2" color="textSecondary">
              {instructor.company}
            </Typography>
          </Box>
        )}
        
        {instructor.bio && (
          <Typography variant="body2" className="mb-3 line-clamp-3">
            {instructor.bio}
          </Typography>
        )}
        
        <Box className="space-y-2">
          <Box className="flex items-center justify-between">
            <Box className="flex items-center gap-1">
              <SchoolIcon fontSize="small" />
              <Typography variant="body2">
                {instructor.courseCount || 0} courses
              </Typography>
            </Box>
            <Box className="flex items-center gap-1">
              <PeopleIcon fontSize="small" />
              <Typography variant="body2">
                {instructor.totalStudents?.toLocaleString() || 0} students
              </Typography>
            </Box>
          </Box>
          
          {instructor.averageRating !== null && instructor.averageRating !== undefined && (
            <Box className="flex items-center gap-1">
              <StarIcon fontSize="small" />
              <Rating value={instructor.averageRating} precision={0.5} size="small" readOnly />
              <Typography variant="body2">
                ({instructor.averageRating.toFixed(1)})
              </Typography>
            </Box>
          )}
          
          {instructor.experience && (
            <Typography variant="body2" color="textSecondary">
              {instructor.experience} years experience
            </Typography>
          )}
          
          {instructor.featured && (
            <Chip 
              label="Featured" 
              color="primary" 
              size="small" 
              className="mt-2"
            />
          )}
        </Box>
      </CardContent>
      
      <Box className="p-3 pt-0">
        <Button
          component={Link}
          to={`/instructors/${instructor.id}`}
          variant="outlined"
          fullWidth
          size="small"
        >
          View Profile
        </Button>
      </Box>
    </Card>
  );

  const LoadingSkeleton = () => (
    <Grid container spacing={3}>
      {[...Array(6)].map((_, index) => (
        <Grid item xs={12} sm={6} md={4} key={index}>
          <Card>
            <Skeleton variant="rectangular" height={200} />
            <CardContent>
              <Skeleton variant="text" height={32} />
              <Skeleton variant="text" height={24} />
              <Skeleton variant="text" height={72} />
              <Box className="flex gap-2 mt-2">
                <Skeleton variant="text" width="50%" height={24} />
                <Skeleton variant="text" width="50%" height={24} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  return (
    <Container maxWidth="lg" className="py-8">
      {/* Header */}
      <Box className="mb-8 text-center">
        <Typography variant="h3" component="h1" gutterBottom className="font-bold">
          Meet Our Expert Instructors
        </Typography>
        <Typography variant="h6" color="textSecondary" className="max-w-2xl mx-auto">
          Learn from industry professionals with years of experience and passion for teaching
        </Typography>
      </Box>

      {/* Search and Filter Bar */}
      <Box className="mb-6 p-4 bg-gray-50 rounded-lg">
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search instructors by name, expertise, or company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyPress={handleSearch}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                label="Sort By"
                onChange={(e) => setSortBy(e.target.value)}
              >
                <MenuItem value="featured">Featured</MenuItem>
                <MenuItem value="name">Name (A-Z)</MenuItem>
                <MenuItem value="courses">Most Courses</MenuItem>
                <MenuItem value="experience">Most Experienced</MenuItem>
                <MenuItem value="newest">Newest</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<FilterListIcon />}
              onClick={handleSearchClick}
              className="h-14"
            >
              Search
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Error Message */}
      {error && (
        <Alert severity="error" className="mb-6">
          {error}
        </Alert>
      )}

      {/* Instructors Grid */}
      {loading ? (
        <LoadingSkeleton />
      ) : instructors.length === 0 ? (
        <Box className="text-center py-12">
          <PeopleIcon className="text-gray-400" style={{ fontSize: 64 }} />
          <Typography variant="h5" className="mt-4 mb-2">
            No instructors found
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Try adjusting your search criteria
          </Typography>
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            {instructors.map((instructor) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={instructor.id}>
                <InstructorCard instructor={instructor} />
              </Grid>
            ))}
          </Grid>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <Box className="flex justify-center mt-8">
              <Pagination
                count={pagination.pages}
                page={pagination.page}
                onChange={handlePageChange}
                color="primary"
                showFirstButton
                showLastButton
              />
            </Box>
          )}
        </>
      )}
    </Container>
  );
};

export default InstructorList;