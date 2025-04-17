
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  const handleStartStream = () => {
    // Generate a random Room ID for a new stream
    const newRoomId = Math.random().toString(36).substring(7);
    navigate('videocall', { state: { RoomId: newRoomId ,
        isStreamer:true
    } });

  };

  const handleJoinStream = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const inviteCode = formData.get('invite_link');
    navigate('videocall', { state: { RoomId: inviteCode,
        isStreamer:false
     } });
  };

  return (
    <main className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center space-y-6">
        <h1 className="text-2xl font-bold">🎥 Video Streaming</h1>

        <button
          onClick={handleStartStream}
          className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700"
        >
          Start a new stream
        </button>

        <form onSubmit={handleJoinStream} className="space-y-4">
          <input
            type="text"
            name="invite_link"
            placeholder="Enter Room ID"
            required
            className="border p-2 rounded w-full"
          />
          <button
            type="submit"
            className="bg-green-600 text-white py-2 px-6 rounded-lg hover:bg-green-700"
          >
            Join a stream
          </button>
        </form>
      </div>
    </main>
  );
};

export default Home;
