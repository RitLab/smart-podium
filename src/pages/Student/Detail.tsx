import { Card } from "../../components/Card";
import { Image } from "../../components/Image";

type DetailProps = {
  image: string;
  name: string;
};

const Detail = ({ image, name }: DetailProps) => {
  return (
    <Card>
      <div className="p-12">
        <div className="bg-gray-100 rounded-lg mt-10 p-6 flex flex-col items-center">
          <div className="flex justify-center -mt-20 mb-4">
            <Image
              src={image}
              alt={name}
              className="w-28 h-28 border-4 border-white shadow "
            />
          </div>

          <h2 className="text-xl font-semibold mb-4">{name}</h2>
          <div className="text-sm text-gray-600 mb-1 font-bold">Instructor</div>
          <div className="text-sm text-gray-600 mb-2">Mr. Bastian Sinaga</div>
          <div className="text-sm text-gray-600 mb-1 font-bold">Date</div>
          <div className="text-sm text-gray-600 mb-2">
            Monday, January 6, 2025
          </div>
        </div>
      </div>
    </Card>
  );
};

export default Detail;
