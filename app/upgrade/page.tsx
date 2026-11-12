"use client"
import React from 'react'
import tick from '../../public/tickicon.svg'
import Image from 'next/image'





const page = () => {
const handleClick = async (planType) => {
    try {
      // Make a POST request to the API route
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planType }),
      });

      // Check if the response is OK
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Something went wrong');
      }

      // Get the URL from the response
      const { url } = await response.json();

      // Redirect the user to the checkout session URL
      window.location.href = url;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      alert('Failed to create checkout session. Please try again.');
    }
  };


  return (
    <div>
       <div className="bg-white shadow-xl  min-h-screen flex flex-col items-center justify-center p-8">
        <h1 className='font-bold text-4xl mb-4 text-black'>Plans</h1>
      <div className="max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Free Plan */}
        <div className="  rounded-lg p-8 bg-[#d6d6d6]  shadow-2xl text-black">
          <h2 className="text-2xl font-bold mb-4">Free</h2>
          <p className="text-gray-400 mb-6">For freelancers</p>
          <p className="text-5xl font-bold mb-6">$0</p>
          <ul className="mb-6 space-y-4">
            <li className="flex items-center">
              <span className="text-yellow-400 mr-2"><Image src={tick} alt="" className='w-4' /></span> 1 user
            </li>
            <li className="flex items-center">
              <span className="text-yellow-400 mr-2"><Image src={tick} alt="" className='w-4' /></span> 10 downloads per month
            </li>
            <li className="flex items-center">
              <span className="text-yellow-400 mr-2"><Image src={tick} alt="" className='w-4' /></span> Roster files
            </li>
            <li className="flex items-center">
              <span className="text-yellow-400 mr-2"><Image src={tick} alt="" className='w-4' /></span> Roster files
            </li>
            <li className="flex items-center">
              <span className="text-yellow-400 mr-2"><Image src={tick} alt="" className='w-4' /></span> Roster files
            </li>
          </ul>
          <button
          onClick={() => handleClick('free')}
          className="w-full bg-[#F8EF6D] text-black py-2 rounded-lg font-bold hover:bg-yellow-500 transition duration-300">
            Subscribe
          </button>
        </div>

        {/* Pro Plan */}
        <div className=" rounded-lg p-8 bg-[#d6d6d6] shadow-2xl text-black">
          <h2 className="text-2xl font-bold mb-4">Pro</h2>
          <p className="text-gray-400 mb-6">For agencies</p>
          <p className="text-5xl font-bold mb-6">$40</p>
          <ul className="mb-6 space-y-4">
            <li className="flex items-center">
              <span className="text-yellow-400 mr-2"><Image src={tick} alt="" className='w-4' /></span> 3 users
            </li>
            <li className="flex items-center">
              <span className="text-yellow-400 mr-2"><Image src={tick} alt="" className='w-4' /></span> Unlimited downloads
            </li>
            <li className="flex items-center">
              <span className="text-yellow-400 mr-2"><Image src={tick} alt="" className='w-4' /></span> Fully-editable files
            </li>
            <li className="flex items-center">
              <span className="text-yellow-400 mr-2"><Image src={tick} alt="" className='w-4' /></span> Custom packs
            </li>
            <li className="flex items-center">
              <span className="text-yellow-400 mr-2"><Image src={tick} alt="" className='w-4' /></span> 200+ custom icons
            </li>
          </ul>
          <button
           onClick={() => handleClick('pro')}
          className="w-full bg-[#F8EF6D] text-black py-2 rounded-lg font-bold hover:bg-yellow-500 transition duration-300">
            Subscribe
          </button>
        </div>
      </div>
    </div>
    </div>
  )
}

export default page
