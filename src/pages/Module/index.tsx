import { Card } from "../../components/Card";

const Module = () => {
  return (
    <>
      <div className="w-full grid grid-flow-col gap-12">
        <div className="col-span-2">
          <Card>left</Card>
        </div>
        <div className="col-span-1">
          <Card>right</Card>
        </div>
      </div>
    </>
  );
};

export default Module;
