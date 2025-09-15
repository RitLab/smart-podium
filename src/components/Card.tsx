export const Card = ({ props, children }: any) => {
  return (
    <div className="bg-white rounded-lg shadow-sm w-full" {...props}>
      {children}
    </div>
  );
};
