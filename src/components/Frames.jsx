import React from "react";

//depending on number of frames they are rendered differently
function Frames() {
  return (
    <div id="videos">
      <video className="video-player" id="user-1" autoPlay playsInline></video>
    </div>
  );
}

export default Frames;


