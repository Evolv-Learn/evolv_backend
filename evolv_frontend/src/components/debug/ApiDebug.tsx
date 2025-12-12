'use client';

import { useEffect, useState } from 'react';

export default function ApiDebug() {
  const [apiUrl, setApiUrl] = useState('');
  
  useEffect(() => {
    setApiUrl(process.env.NEXT_PUBLIC_API_URL || 'NOT SET');
  }, []);

  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      right: 0, 
      background: 'red', 
      color: 'white', 
      padding: '10px',
      zIndex: 9999,
      fontSize: '12px'
    }}>
      API URL: {apiUrl}
    </div>
  );
}