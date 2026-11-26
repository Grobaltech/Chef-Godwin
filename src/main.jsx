import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { configureSupabase } from './lib/supabase';
import './index.css';

async function startApplication() {
  let startupError = '';
  try {
    await configureSupabase();
  } catch (error) {
    // Keep the public website available even when staff auth configuration
    // needs attention. Login itself will explain that sign-in is unavailable.
    startupError = error instanceof Error ? error.message : 'Could not load the application configuration.';
    console.error('Chef Godwin startup configuration:', startupError);
  }

  createRoot(document.getElementById('root')).render(
    <App startupError={startupError} />
  );
}

startApplication();
