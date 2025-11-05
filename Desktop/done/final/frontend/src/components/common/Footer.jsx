import React from "react";

const Footer = () => {

    console.log(location.pathname === "/client/chat");
  if(location.pathname === "/client/chat" || location.pathname  === "/freelancer/chat"){
        return(
          <>
          </>
        )
  }
  return (
    <div className=" mt-20 bg-white-300 py-6">
      <div className="flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] p-10 gap-14 my-10 mt-10 text-sm">
        <div>
          <h1 className="mb-5 w-32">GIGCONNECT</h1>
          <p className="w-full md:w-2/3 text-gray-600">
            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Beatae
            vero aperiam commodi quisquam, ipsa fuga explicabo omnis cupiditate
            neque mollitia facere, nobis nulla consectetur. Quas voluptates
            nulla ratione dolorum. Sit.
          </p>
        </div>
        <div>
          <p className="text-xl font-medium  mb-5">COMPANY</p>
          <ul className="flex flex-col gap-1 text-gray-600">
            <li>Home</li>
            <li>Gigs</li>
            <li>About us</li>
            <li>Privacy policy</li>
          </ul>
        </div>
        <div>
          <p className="text-xl font-medium mb-5">GET IN TOUCH</p>
          <ul className="flex flex-col gap-1 text-gray-600">
            <li>+917654321908</li>
            <li>contact@gigconnect.com</li>
          </ul>
        </div>
      </div>
      <div>
        <p className="py-5 text-sm text-center">
          Copyright @2025 gigconnect.com - All Rights Reserved.
        </p>
      </div>
    </div>
  );
};

export default Footer;
