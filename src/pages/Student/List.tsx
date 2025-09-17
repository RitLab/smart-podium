import { Circle } from "lucide-react";

import { Badge } from "../../components/Badge";
import { Card } from "../../components/Card";
import { Image } from "../../components/Image";
import { HandlingStatus, Status, Student } from "../../types/student.type";

type ListStudentProps = {
  student: Student;
  handleStatus: (status: Status) => HandlingStatus;
};

const ListStudent = ({ student, handleStatus }: ListStudentProps) => {
  return (
    <Card>
      <div className="flex flex-col items-center justify-center text-center py-10 px-2">
        <Image
          src={student.image}
          alt={student.name}
          className={`w-20 h-20 mb-4 ${
            student.status !== "present" ? "" : "grayscale"
          }`}
        />

        <h3 className="text-md font-medium mb-4">{student.name}</h3>
        <Badge
          size="sm"
          variant={handleStatus(student.status).variant}
          iconLeft={<Circle size={10} className="mr-1" />}
        >
          {handleStatus(student.status).label}
        </Badge>
      </div>
    </Card>
  );
};

export default ListStudent;
