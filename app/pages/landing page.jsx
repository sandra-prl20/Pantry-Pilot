// pages/landing.js

import React from 'react';
import { useRouter } from 'next/router';

const LandingPage = () => {
  const router = useRouter();

  const navigateToSignUp = () => {
    router.push('/sign-up');
  };

  const navigateToSignIn = () => {
    router.push('/sign-in');
  };

  return (
    <div className="landing-page bg-cover bg-center h-screen flex flex-col items-center justify-center text-white" style={{ backgroundImage: "url('/path-to-your-background-image.jpg')" }}>
      <h1 className="text-4xl font-bold mb-10 text-blue-800">Welcome to Pantry-Pilot</h1>
      <div className="space-x-4">
        <button onClick={navigateToSignUp} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg">
          Sign Up
        </button>
        <button onClick={navigateToSignIn} className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg">
          Sign In
        </button>
      </div>
    </div>
  );
};

export default LandingPage;
