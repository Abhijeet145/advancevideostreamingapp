import './../App.css';
import VideoChat from './VideoChat';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./Pages/Home";

function App() {

  return (
    <>
    <BrowserRouter>
      <Routes>
          <Route path='videostreamingapp' index element={<Home />} />
          <Route path="videostreamingapp/videocall" element={<VideoChat/>} />
      </Routes>
    </BrowserRouter>
   </>
  );
}

export default App;
