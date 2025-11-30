export const getAuthToken = () => {
  // Adjust based on your token storage strategy
  return localStorage.getItem('authToken') || 
         sessionStorage.getItem('authToken') ||
         '';
};

export const setAuthToken = (token, remember = false) => {
  if (remember) {
    localStorage.setItem('authToken', token);
  } else {
    sessionStorage.setItem('authToken', token);
  }
};

export const removeAuthToken = () => {
  localStorage.removeItem('authToken');
  sessionStorage.removeItem('authToken');
};