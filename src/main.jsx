// Import necessary modules
import React from 'react';
import { createRoot } from 'react-dom/client'; // Use createRoot instead of ReactDOM.render
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css'
import Login_signup from './components/login_signup';
import Login from './components/LoginPage/Login';
import Welcome from './components/Welcome/Welcome';


// Create your router
const router = createBrowserRouter([
  {
    path: '/',
    element: <Login_signup/>,
    
    // Add more routes if needed
  },
  {
    path:'login',
    element:<Login/>
  },
  {
    path:'welcome',
    element:<Welcome/>
  }
]);

// Find your root element in the DOM
const container = document.getElementById('root');

// Create the root using createRoot and render the app
const root = createRoot(container);
root.render(
  <RouterProvider router={router} />
);
