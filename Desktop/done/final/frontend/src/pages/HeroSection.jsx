import React from 'react'

const Hero = () => {
  return (
    <div className='mt-10 flex flex-col-reverse md:flex-row items-center justify-between px-6 py-16 max-w-7xl mx-auto'>
        <div className='md:w-1/2 text-center md:text-left'>
        <h2 className='text-3xl md:text-4xl font-bold mb-4'>Freelancer designer multitasking landing page.</h2>
        <p className='text-indigo-500 mb-6'>Lorem ipsum dolor sit amet consectetur adipisicing elit.</p>
        <div className='space-x-4'>
            <button className='border border-indigo-700 text-black px-6 py-2 rounded hover:bg-indigo-50'>Join Now</button>
            <button className='border border-indigo-700 text-black px-6 py-2 rounded hover:bg-indigo-50'>Explore More</button>


        </div>
        </div>
        <div className='md:w-1/2 mb-8 md:mb-0'>
        <img src='https://shift.com/_next/image/?url=https%3A%2F%2Fcdn.sanity.io%2Fimages%2F1awf4j9a%2Fproduction%2F68cdd9d56fc9aff9c668b77307d4fdbecef29aaa-1160x600.png%3Fauto%3Dformat&w=3840&q=75'
        alt='Freelancer multitasking'
        className='w-full h-auto'/>

        </div>
    </div>
  )
}

export default Hero