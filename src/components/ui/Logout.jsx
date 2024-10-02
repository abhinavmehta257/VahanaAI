import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { toast } from 'react-hot-toast';
import React from 'react';


export default function Logout({setToken}) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const authToken = Cookies.get('authToken');
    setIsLoggedIn(!!authToken);
  }, []);

  const handleLogout = () => {
    // Remove authToken from cookies
    Cookies.remove('authToken');
    setToken(null);
    // Remove authToken from chrome.storage.local
    chrome.storage.local.remove('authToken', () => {
      console.log('AuthToken removed from chrome.storage.local');
    });

    setIsLoggedIn(false);
    toast.success('Logged out successfully', {
      position: "bottom-center"
    });
  };

  return (
    <button 
      className='fixed top-4 right-4 bg-red-500 text-light-surface py-2 px-4 rounded-md hover:bg-opacity-90' 
      onClick={handleLogout}
    >
      Logout
    </button>
  );
}