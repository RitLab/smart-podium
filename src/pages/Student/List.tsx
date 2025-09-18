import React from "react";

import { Badge } from "../../components/Badge";
import { Card } from "../../components/Card";
import { Image } from "../../components/Image";
import { HandlingStatus, Status, Student } from "../../types/student.type";

type ListStudentProps = {
  student: Student;
  setStudent: React.Dispatch<React.SetStateAction<Student>>;
  handleStatus: (status: Status) => HandlingStatus;
};

const ListStudent = ({
  student,
  setStudent,
  handleStatus,
}: ListStudentProps) => {
  return (
    <Card
      className="hover:shadow-lg transition-shadow hover:bg-gray-50 cursor-pointer"
      onClick={() => setStudent(student)}
    >
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
          isStatus
        >
          {handleStatus(student.status).label}
        </Badge>
      </div>
    </Card>
  );
};

export default ListStudent;
