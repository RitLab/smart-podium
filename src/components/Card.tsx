export const Card = ({ props, children }: any) => {
  return (
    <div className="bg-white p-8 rounded-lg shadow-sm w-full" {...props}>
      {children}
    </div>
  );
};
