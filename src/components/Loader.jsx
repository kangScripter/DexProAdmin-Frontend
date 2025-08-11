import React from 'react';

const Loader = () => (
  <div className="flex justify-center items-center min-h-[200px]">
    <div className="animate-spin rounded-full h-10 w-10 border-4 border-gradient-to-r from-[#9859fe] to-[#602fea] border-t-transparent"></div>
  </div>
);

export default Loader;