import React from 'react';
import Footer from './Footer';
import Frames from './Frames';
import StreamHandler from './StreamHandler';
const VideoChat = () => {
  return (
    <div className='container-fluid'>
      <Frames/>
      <StreamHandler/>
      <Footer/>
    </div>
  );
};

export default VideoChat;
