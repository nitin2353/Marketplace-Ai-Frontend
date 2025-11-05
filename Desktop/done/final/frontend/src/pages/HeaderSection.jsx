import React from 'react'
import Login from './Auth/Login'
import OverView from './OverviewSection'

const Header = () => {
  return (
    <div className="text-center py-40 mt-10 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
    <h2 className="text-4xl font-bold mb-4">Connect with Top Freelancer....!</h2>
    <p className="text-lg mb-6">Hire experts or find freelancer gigs in just a few clicks.</p>
    <div className="space-x-4">
        <a href="/login" onClick={Login} className="bg-white text-indigo-600 px-6 py-2 rounded font-semibold hover:bg-gray-100">Get Started</a>
        <a href="/overview" onClick={OverView} className="border border-white px-6 py-2 rounded font-semibold hover:bg-white hover:text-indigo-600">Explore</a>
    </div>
    </div>
  )
}

export default Header