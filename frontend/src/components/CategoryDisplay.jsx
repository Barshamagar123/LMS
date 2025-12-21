// // components/CategoryDisplay.jsx - WITHOUT Framer Motion
// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import {
//   Container,
//   Grid,
//   Card,
//   CardContent,
//   Typography,
//   Chip,
//   CircularProgress,
//   Alert,
//   Box,
//   InputBase,
//   IconButton,
//   Paper,
//   Tooltip,
// } from '@mui/material';
// import SearchIcon from '@mui/icons-material/Search';
// import ClearIcon from '@mui/icons-material/Clear';
// import CategoryIcon from '@mui/icons-material/Category';

// const CategoryDisplay = () => {
//   const [categories, setCategories] = useState([]);
//   const [filteredCategories, setFilteredCategories] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [searchTerm, setSearchTerm] = useState('');

//   useEffect(() => {
//     fetchCategories();
//   }, []);

//   const fetchCategories = async () => {
//     try {
//       setLoading(true);
//       const response = await axios.get('/api/categories');
//       setCategories(response.data);
//       setFilteredCategories(response.data);
//       setError(null);
//     } catch (err) {
//       setError('Failed to load categories. Please try again later.');
//       console.error('Error fetching categories:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (!searchTerm.trim()) {
//       setFilteredCategories(categories);
//       return;
//     }

//     const filtered = categories.filter(category =>
//       category.name.toLowerCase().includes(searchTerm.toLowerCase())
//     );
//     setFilteredCategories(filtered);
//   }, [searchTerm, categories]);

//   const handleSearch = (e) => {
//     setSearchTerm(e.target.value);
//   };

//   const clearSearch = () => {
//     setSearchTerm('');
//   };

//   const getRandomColor = (index) => {
//     const colors = [
//       '#3f51b5',
//       '#2196f3',
//       '#4caf50',
//       '#ff9800',
//       '#f44336',
//       '#9c27b0',
//       '#00bcd4',
//       '#8bc34a',
//       '#ff5722',
//       '#795548',
//     ];
//     return colors[index % colors.length];
//   };

//   if (loading) {
//     return (
//       <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
//         <CircularProgress />
//         <Typography variant="body1" sx={{ mt: 2, color: 'text.secondary' }}>
//           Loading categories...
//         </Typography>
//       </Container>
//     );
//   }

//   if (error) {
//     return (
//       <Container maxWidth="lg" sx={{ py: 8 }}>
//         <Alert severity="error" sx={{ mb: 3 }}>
//           {error}
//         </Alert>
//         <Typography variant="body1" sx={{ textAlign: 'center', color: 'text.secondary' }}>
//           Please check your connection and try again.
//         </Typography>
//       </Container>
//     );
//   }

//   return (
//     <Container maxWidth="lg" sx={{ py: 4 }}>
//       {/* Header */}
//       <Box sx={{ mb: 6, textAlign: 'center' }}>
//         <Typography
//           variant="h3"
//           component="h1"
//           gutterBottom
//           sx={{
//             fontWeight: 700,
//             background: 'linear-gradient(45deg, #3f51b5 30%, #2196f3 90%)',
//             WebkitBackgroundClip: 'text',
//             WebkitTextFillColor: 'transparent',
//             mb: 2,
//           }}
//         >
//           Browse Categories
//         </Typography>
//         <Typography variant="h6" color="text.secondary" sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
//           Explore our wide range of course categories. Click on any category to discover related courses.
//         </Typography>

//         {/* Search Bar */}
//         <Paper
//           sx={{
//             p: '2px 4px',
//             display: 'flex',
//             alignItems: 'center',
//             maxWidth: 600,
//             mx: 'auto',
//             mb: 4,
//             borderRadius: 3,
//             boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
//             transition: 'all 0.3s ease',
//           }}
//         >
//           <IconButton sx={{ p: '10px' }} aria-label="search">
//             <SearchIcon />
//           </IconButton>
//           <InputBase
//             sx={{ ml: 1, flex: 1 }}
//             placeholder="Search categories..."
//             value={searchTerm}
//             onChange={handleSearch}
//             fullWidth
//           />
//           {searchTerm && (
//             <IconButton onClick={clearSearch} aria-label="clear search">
//               <ClearIcon />
//             </IconButton>
//           )}
//         </Paper>

//         {/* Results Count */}
//         <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
//           Showing {filteredCategories.length} of {categories.length} categories
//         </Typography>
//       </Box>

//       {/* Categories Grid */}
//       {filteredCategories.length === 0 ? (
//         <Alert severity="info" sx={{ maxWidth: 600, mx: 'auto' }}>
//           No categories found matching your search. Try a different term.
//         </Alert>
//       ) : (
//         <Grid container spacing={3}>
//           {filteredCategories.map((category, index) => (
//             <Grid item xs={12} sm={6} md={4} lg={3} key={category.id}>
//               <div>
//                 <Tooltip title={`Explore ${category.name} courses`} arrow>
//                   <Card
//                     sx={{
//                       height: '100%',
//                       cursor: 'pointer',
//                       transition: 'all 0.3s ease',
//                       '&:hover': {
//                         transform: 'translateY(-4px)',
//                         boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
//                       },
//                       borderRadius: 3,
//                       overflow: 'hidden',
//                       position: 'relative',
//                       '&::before': {
//                         content: '""',
//                         position: 'absolute',
//                         top: 0,
//                         left: 0,
//                         right: 0,
//                         height: '4px',
//                         background: getRandomColor(index),
//                       },
//                     }}
//                   >
//                     <CardContent sx={{ p: 3, textAlign: 'center' }}>
//                       <Box
//                         sx={{
//                           width: 60,
//                           height: 60,
//                           borderRadius: '50%',
//                           backgroundColor: `${getRandomColor(index)}20`,
//                           display: 'flex',
//                           alignItems: 'center',
//                           justifyContent: 'center',
//                           mx: 'auto',
//                           mb: 2,
//                         }}
//                       >
//                         <CategoryIcon
//                           sx={{
//                             fontSize: 30,
//                             color: getRandomColor(index),
//                           }}
//                         />
//                       </Box>

//                       <Typography
//                         variant="h6"
//                         component="h2"
//                         gutterBottom
//                         sx={{
//                           fontWeight: 600,
//                           color: 'text.primary',
//                           mb: 1,
//                         }}
//                       >
//                         {category.name}
//                       </Typography>

//                       <Chip
//                         label="View Courses"
//                         size="small"
//                         sx={{
//                           mt: 1,
//                           backgroundColor: `${getRandomColor(index)}20`,
//                           color: getRandomColor(index),
//                           fontWeight: 500,
//                           '&:hover': {
//                             backgroundColor: `${getRandomColor(index)}30`,
//                           },
//                         }}
//                       />
//                     </CardContent>
//                   </Card>
//                 </Tooltip>
//               </div>
//             </Grid>
//           ))}
//         </Grid>
//       )}

//       {/* Footer Note */}
//       {filteredCategories.length > 0 && (
//         <Box sx={{ mt: 6, textAlign: 'center' }}>
//           <Typography variant="body2" color="text.secondary">
//             Can't find what you're looking for? Contact us to suggest new categories.
//           </Typography>
//         </Box>
//       )}
//     </Container>
//   );
// };

// export default CategoryDisplay;