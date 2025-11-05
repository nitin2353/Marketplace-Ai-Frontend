import React from "react";
import CommonStyle from "../styles/CommonStyle.module.css";

function Home() {
  return (
    <div className={`${CommonStyle["home-page"]} min-h-screen flex flex-col justify-center items-center bg-gradient-to-r from-blue-500 to-indigo-600 text-white`}>
      <h1 className="text-5xl font-extrabold mb-4 tracking-wide">Welcome to GigConnect</h1>
      <p className="text-lg max-w-xl text-center opacity-90 mb-8">
        Connect, collaborate, and grow with GigConnect — the platform that bridges talented freelancers and businesses. Discover opportunities, share your skills, and build your professional network effortlessly.
      </p>
      <button className="px-6 py-3 bg-white text-indigo-700 font-semibold rounded-full shadow-lg hover:scale-105 transform transition-all duration-300">
        Get Started
      </button>
    </div>
  );
}

export default Home;
