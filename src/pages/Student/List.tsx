import { Circle } from "lucide-react";

import { Badge } from "../../components/Badge";
import { Card } from "../../components/Card";
import { Image } from "../../components/Image";
import { Student } from "../../types/student.type";

type ListStudentProps = {
  student: Student;
};

const ListStudent = ({ student }: ListStudentProps) => {
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
          variant={
            student.status === "present"
              ? "success"
              : student.status === "loa"
              ? "warning"
              : "error"
          }
          iconLeft={<Circle size={10} className="mr-1" />}
        >
          {student.status === "present"
            ? "Hadir"
            : student.status === "loa"
            ? "Izin"
            : "Tidak Hadir"}
        </Badge>
      </div>
    </Card>
  );
};

export default ListStudent;
