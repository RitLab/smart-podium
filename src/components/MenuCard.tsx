type Props = {
  icon: any;
  label: any;
  bg: any;
  handleClick: any;
};

export default ({ icon, label, bg, handleClick }: Props) => {
  return (
    <div
      className="flex flex-col items-center cursor-pointer"
      onClick={handleClick}
    >
      <div
        className={`h-32 w-32 rounded-2xl flex items-center justify-center shadow-md bg-gradient-to-br ${bg}`}
      >
        {icon}
      </div>
      <p className="mt-4 text-gray-700 font-medium">{label}</p>
    </div>
  );
};
