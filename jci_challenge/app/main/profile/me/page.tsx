"use client";


import { Edit, Plus } from "lucide-react";
import React, { useState } from "react";


function Page() {
    

  return (
    <div className="w-ull h-full relative">
      <div className="w-full h-1/3 bg-purple-300"></div>
      <div className="w-48 h-48 bg-slate-400 rounded-full absolute top-[20%] left-1/2 -translate-x-1/2"></div>
      <h1 className="font-extrabold text-center mt-32 text-black">
        firstname
        {/*data?.firstname + " " + data?.lastname */}
      </h1>
      

    </div>
  );
}

export default Page;