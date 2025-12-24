import React from 'react';
import { Box, Drawer, useTheme, useMediaQuery } from '@mui/material';
import { useLocation } from 'react-router-dom';

const CoursePlayerLayout = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = React.useState(!isMobile);

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Get sidebar and main content from children
  const [mainContent, sidebarContent] = React.Children.toArray(children);

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 64px)' }}>
      {/* Main Content */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: isMobile ? 1 : 2,
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          ...(sidebarOpen && !isMobile && {
            width: `calc(100% - 350px)`,
          }),
        }}
      >
        {mainContent}
      </Box>

      {/* Sidebar */}
      {isMobile ? (
        <Drawer
          anchor="right"
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          sx={{
            '& .MuiDrawer-paper': {
              width: 350,
              maxWidth: '100vw',
            },
          }}
        >
          <Box sx={{ p: 2 }}>
            {sidebarContent}
          </Box>
        </Drawer>
      ) : (
        <Box
          sx={{
            width: 350,
            flexShrink: 0,
            borderLeft: 1,
            borderColor: 'divider',
            overflowY: 'auto',
            display: sidebarOpen ? 'block' : 'none',
          }}
        >
          {sidebarContent}
        </Box>
      )}
    </Box>
  );
};

export default CoursePlayerLayout;