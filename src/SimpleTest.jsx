import React from 'react';

const SimpleTest = () => {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>🌊 Wave Commerce Test</h1>
      <p>If you can see this, React is working!</p>
      <button onClick={() => alert('Button works!')}>
        Test Button
      </button>
    </div>
  );
};

export default SimpleTest;