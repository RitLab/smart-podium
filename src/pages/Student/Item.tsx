import { Badge } from "@/components/Badge";
import { Card } from "@/components/Card";
import { Image } from "@/components/Image";
import type { HandlingStatus, Status, Student } from "@/types/student";

type ItemStudentProps = {
  student: Student;
  setStudent: (params: Student) => void;
  handleStatus: (status: Status) => HandlingStatus;
  selectedStudent: Student;
};

const ItemStudent = ({
  student,
  setStudent,
  handleStatus,
  selectedStudent,
}: ItemStudentProps) => {
  return (
    <Card
      className={`border cursor-pointer transition-shadow hover:shadow-lg ${selectedStudent?.id == student.id ? "!bg-blue-200 !hover:bg-blue-200" : "bg-white hover:bg-gray-50"}`}
      onClick={() => setStudent(student)}
    >
      <div className="flex flex-col items-center justify-center text-center py-12 px-2">
        <Image
          src={student.image}
          alt={student.name}
          className={`w-24 h-24 mb-4 ${
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

export default ItemStudent;
