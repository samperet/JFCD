'use client';

import StatusBar from './StatusBar';

export default function PhoneFrame({ children }) {
  return (
    <div className="device">
      <div className="screen">
        <div className="dynamic-island" />
        <StatusBar />
        {children}
        <div className="home-indicator" />
      </div>
    </div>
  );
}
