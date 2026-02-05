import { useNavigate } from "react-router";

const Viewer: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col h-screen items-center justify-center w-full font-sans text-gray-800">
      <div className="flex flex-col w-1/2 text-center gap-2">
        <p>File tidak ditemukan!</p>
        <button
          className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold"
          onClick={() => navigate(-1)}
        >
          Kembali
        </button>
      </div>
    </div>
  );
};

export default Viewer;
