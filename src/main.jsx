// This is the entry point of our React application
// It's where React takes control and renders our app into the HTML DOM

// Import React's StrictMode - a development tool that helps catch bugs
// StrictMode runs extra checks and warnings during development
import { StrictMode } from 'react'

// Import createRoot - the new React 18+ way to render React apps
// This replaced the older ReactDOM.render() method
import { createRoot } from 'react-dom/client'

// Import our global CSS styles (Tailwind, custom styles, etc.)
import './index.css'

// Import our main App component (the root of our component tree)
import App from './App.jsx'

// Create a root React element and render our app
// 1. Find the HTML element with id="root" (defined in index.html)
// 2. Create a React root that will manage this DOM element
// 3. Render our App component wrapped in StrictMode
createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* StrictMode enables additional checks and warnings in development:
        - Detects unsafe lifecycles
        - Warns about deprecated APIs
        - Helps ensure components are side-effect free
        - Only runs in development, removed in production builds */}
    <App />
  </StrictMode>,
)
