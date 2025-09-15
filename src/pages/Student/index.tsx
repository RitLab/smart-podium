import { FC, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import userImage from "../../assets/images/user.png";
import { Card } from "../../components/Card";
import { AppDispatch, RootState } from "../../stores";
import { fetchParticipantList } from "../../stores/student.store";
import { Participant } from "../../types/student.type";
import { Badge } from "../../components/Badge";
import { Circle } from "lucide-react";

const ParticipantCard: FC<{ participant: Participant }> = ({ participant }) => {
  return (
    <Card>
      <div className="flex flex-col items-center justify-center text-center py-10 px-2">
        <img
          src={participant.image}
          alt={participant.name}
          className={`w-20 h-20 rounded-full object-cover mb-4 ${
            participant.present ? "" : "grayscale"
          }`}
          onError={(e) => {
            const target = e.currentTarget as HTMLImageElement;
            target.onerror = null;
            target.src = userImage;
          }}
        />
        <h3 className="text-md font-medium mb-4">{participant.name}</h3>
        {participant.present ? (
          <Badge
            size="sm"
            variant="accept"
            iconLeft={<Circle size={10} className="mr-1" />}
          >
            Hadir
          </Badge>
        ) : (
          <Badge
            size="sm"
            variant="error"
            iconLeft={<Circle size={10} className="mr-1" />}
          >
            Tidak Hadir
          </Badge>
        )}
      </div>
    </Card>
  );
};

const Student = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { participantList } = useSelector((state: RootState) => state.student);

  useEffect(() => {
    dispatch(fetchParticipantList());
  }, [dispatch]);

  return (
    <>
      <div className="w-full grid grid-flow-col gap-12">
        <div className="col-span-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {participantList?.map((p) => (
              <ParticipantCard key={p.id} participant={p} />
            ))}
          </div>
        </div>
        <div className="col-span-1">
          <Card>right</Card>
        </div>
      </div>
    </>
  );
};

export default Student;
