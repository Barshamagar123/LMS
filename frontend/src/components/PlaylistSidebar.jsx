import React, { useState } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Typography,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  PlayArrow,
  CheckCircle,
  AccessTime,
  ExpandMore,
  Search,
  MenuBook,
  VideoLibrary
} from '@mui/icons-material';
import { formatTime } from '../utils/formatTime';

const PlaylistSidebar = ({
  course,
  lessons,
  currentLesson,
  completedLessons,
  onSelectLesson,
  enrollmentId
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedModules, setExpandedModules] = useState({});

  // Group lessons by module
  const lessonsByModule = lessons.reduce((acc, lesson) => {
    if (!acc[lesson.moduleId]) {
      acc[lesson.moduleId] = {
        moduleTitle: lesson.moduleTitle,
        lessons: []
      };
    }
    acc[lesson.moduleId].lessons.push(lesson);
    return acc;
  }, {});

  // Filter lessons based on search
  const filteredLessons = searchQuery
    ? lessons.filter(lesson =>
        lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lesson.moduleTitle.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : lessons;

  const handleModuleToggle = (moduleId) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };

  const isLessonCompleted = (lessonId) => {
    return completedLessons.some(lesson => lesson.id === lessonId);
  };

  return (
    <Box sx={{ p: 2 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Course Content
        </Typography>
        <Chip 
          icon={<MenuBook />}
          label={`${course?.modules?.length || 0} modules`}
          size="small"
          variant="outlined"
          sx={{ mr: 1 }}
        />
        <Chip 
          icon={<VideoLibrary />}
          label={`${lessons.length} lessons`}
          size="small"
          variant="outlined"
        />
      </Box>

      {/* Search */}
      <TextField
        fullWidth
        size="small"
        placeholder="Search lessons..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        sx={{ mb: 2 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search fontSize="small" />
            </InputAdornment>
          ),
        }}
      />

      <Divider sx={{ mb: 2 }} />

      {/* Progress Summary */}
      <Box sx={{ mb: 3, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Your Progress
        </Typography>
        <Box display="flex" alignItems="center" gap={1}>
          <Typography variant="body1" fontWeight="bold">
            {completedLessons.length}/{lessons.length}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            lessons completed
          </Typography>
        </Box>
      </Box>

      {/* Lessons List */}
      <List sx={{ overflow: 'auto', maxHeight: 'calc(100vh - 300px)' }}>
        {searchQuery ? (
          // Display filtered list
          filteredLessons.map((lesson, index) => (
            <LessonItem
              key={lesson.id}
              lesson={lesson}
              isCurrent={currentLesson?.id === lesson.id}
              isCompleted={isLessonCompleted(lesson.id)}
              onClick={() => onSelectLesson(lesson)}
              showModule={true}
            />
          ))
        ) : (
          // Display grouped by modules
          Object.entries(lessonsByModule).map(([moduleId, moduleData]) => (
            <Accordion
              key={moduleId}
              expanded={expandedModules[moduleId] || false}
              onChange={() => handleModuleToggle(moduleId)}
              sx={{
                boxShadow: 'none',
                '&:before': { display: 'none' },
                '&.Mui-expanded': { margin: 0 }
              }}
            >
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography fontWeight="medium">
                  {moduleData.moduleTitle}
                </Typography>
                <Chip 
                  label={`${moduleData.lessons.length} lessons`}
                  size="small"
                  sx={{ ml: 'auto', mr: 1 }}
                />
              </AccordionSummary>
              <AccordionDetails sx={{ p: 0 }}>
                <List dense>
                  {moduleData.lessons.map(lesson => (
                    <LessonItem
                      key={lesson.id}
                      lesson={lesson}
                      isCurrent={currentLesson?.id === lesson.id}
                      isCompleted={isLessonCompleted(lesson.id)}
                      onClick={() => onSelectLesson(lesson)}
                      showModule={false}
                    />
                  ))}
                </List>
              </AccordionDetails>
            </Accordion>
          ))
        )}
      </List>
    </Box>
  );
};

const LessonItem = ({ lesson, isCurrent, isCompleted, onClick, showModule }) => {
  return (
    <ListItem disablePadding>
      <ListItemButton
        selected={isCurrent}
        onClick={onClick}
        sx={{
          borderRadius: 1,
          mb: 0.5,
          '&.Mui-selected': {
            backgroundColor: 'primary.main',
            '&:hover': {
              backgroundColor: 'primary.dark',
            },
            '& .MuiListItemIcon-root, & .MuiListItemText-primary, & .MuiListItemText-secondary': {
              color: 'common.white',
            }
          }
        }}
      >
        <ListItemIcon sx={{ minWidth: 40 }}>
          {isCurrent ? (
            <PlayArrow color={isCurrent ? "inherit" : "action"} />
          ) : isCompleted ? (
            <CheckCircle color="success" />
          ) : (
            <AccessTime color="action" />
          )}
        </ListItemIcon>
        
        <ListItemText
          primary={
            <Typography 
              variant="body2" 
              sx={{ 
                fontWeight: isCurrent ? 'bold' : 'normal',
                color: isCurrent ? 'inherit' : 'text.primary'
              }}
            >
              {lesson.title}
            </Typography>
          }
          secondary={
            showModule ? (
              <Typography variant="caption" color="text.secondary">
                {lesson.moduleTitle}
              </Typography>
            ) : (
              <Typography variant="caption" color="text.secondary">
                {lesson.duration ? formatTime(lesson.duration) : 'No duration'}
              </Typography>
            )
          }
        />
      </ListItemButton>
    </ListItem>
  );
};

export default PlaylistSidebar;