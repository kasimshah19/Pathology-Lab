'use client';

export default function Template({ children }) {
  return (
    <div className="animate-slide-in">
      {children}
    </div>
  );
}
