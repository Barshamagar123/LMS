// Utility functions for handling image URLs from the backend

/**
 * Formats a profile picture URL from the backend to a full URL
 * Backend returns paths like "/uploads/profile-pictures/filename.jpg"
 * This function constructs the full URL for frontend display
 *
 * @param {string} profilePicture - The profile picture path from backend
 * @returns {string|null} - Full URL or null if invalid
 */
export const formatProfilePictureUrl = (profilePicture) => {
  try {
    if (!profilePicture) return null;
    if (typeof profilePicture !== 'string') return null;

    // If it's already a full URL, return as is
    if (profilePicture.startsWith('http')) {
      return profilePicture;
    }

    // For relative paths from backend, construct full URL
    // Backend returns paths like "/uploads/profile-pictures/filename.jpg"
    const baseUrl = 'http://localhost:3000';
    const cleanPath = profilePicture.startsWith('/') ? profilePicture : `/${profilePicture}`;

    return `${baseUrl}${cleanPath}`;
  } catch {
    return null;
  }
};

/**
 * Formats any image URL from the backend to a full URL
 * Generic version of formatProfilePictureUrl for any backend image path
 *
 * @param {string} imagePath - The image path from backend
 * @returns {string|null} - Full URL or null if invalid
 */
export const formatImageUrl = (imagePath) => {
  return formatProfilePictureUrl(imagePath);
};
