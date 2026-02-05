const RecorderComponents: React.FC = () => {
  return (
    <div className="inline-flex px-3 py-2 gap-2 items-center rounded-md font-bold text-sm bg-white border border-[#E5E8EB] text-red-500">
      <div className="relative w-4 h-4 flex items-center justify-center">
        {/* Outer ring */}
        <div className="absolute w-4 h-4 rounded-full border-2 border-red-500" />

        {/* Pulse ring */}
        <div className="absolute w-4 h-4 rounded-full bg-red-500 opacity-30 animate-ping" />

        {/* Inner solid dot */}
        <div className="w-2 h-2 rounded-full bg-red-500 z-10" />
      </div>

      <span className="whitespace-nowrap">Recording 08:23</span>
    </div>
  );
};

export default RecorderComponents;
