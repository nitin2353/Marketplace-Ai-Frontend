import React from 'react'

const OverView = () => {
  return (
    <div>
    <div className='p-6 bg-gray-50'>
    <h1 className='text-xl font-bold text-gray-800 mb-4'>Project Overview</h1>
    </div>

     <div className='bg-white shadow-md rounded-lg p-5 mb-6'>
        <h2 className='text-xl font-semibold text-indigo-600 mb-2'>Project Details</h2>
        <p className='text-gray-700'>
            This platform connects skilled freelancer with clients using reliable talent for short-term and long-term projects. Our goal is to streamline job sharing, secure payments, and transparent collabration.
        </p>

     </div>

     <div className='bg-black shadow-md rounded-lg p-5 mb-6'>
        <h2 className='text-xl font-semibold text-green-600 mb-2'>Client Information</h2>
        <ul className='list-disc list-inside text-gray-400'>
            <li>Clients can post jobs with detailed requirements and budgets.</li>
            <li>They can review freelancer profiles, ratings, and portfolios.</li>
            <li>Secure payment integration ensures trust and accountability.</li>
        </ul>

     </div>


     <div className='bg-white shadow-md rounded-lg p-5 mb-6'>
        <h2 className='text-xl font-semibold text-blue-600 mb0-2'>Freelancer Information</h2>
        <ul className='list-disc list-inside text-gray-700'>
            <li>Freelancer can browse available jobs and apply with custom proposals.</li>
            <li>Profile customization includes skills,experience, and hourly rates.</li>
            <li>Wallet system supports withdrawals and payment tracking.</li>

        </ul>

     </div>


     <div className='bg-black shadow-md rounded-lg p-5'>
        <h2 className='tet-xl font-semibold text-green-600 mb-2'>Job Sharing & collabration</h2>
        <p className='text-gray-400'>
            Our platform promotes seamless job sharing through real time messaging, file uploads, and milestone tracking. Both clients and freelancers receive notifications and update to stay aligned throughout the project lifecycle.
        </p>

     </div>

    </div>
  )
}

export default OverView