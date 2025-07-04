import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { LoadScript } from '@react-google-maps/api';

const GOOGLE_MAPS_API_KEY = 'AIzaSyAbavZzIUQyr5Pm_8YsPYw_nusONSQPHms'; // Use the same key as in App.tsx

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY} libraries={['places']}>
      <App />
    </LoadScript>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
