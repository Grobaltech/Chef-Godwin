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
    startupError = error instanceof Error ? error.message : 'Could not load the application configuration.';
  }

  createRoot(document.getElementById('root')).render(
    <App startupError={startupError} />
  );
}

startApplication();
