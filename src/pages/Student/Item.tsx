import { Badge } from "@/components/Badge";
import { Card } from "@/components/Card";
import { Image } from "@/components/Image";
import type { HandlingStatus, Attendance } from "@/types/student";

type ItemProps = {
  attendance: Attendance;
  setAttendance: (params: Attendance) => void;
  handleStatus: (status: number) => HandlingStatus;
  selectedAttendance: Attendance;
};

const Item = ({
  attendance,
  setAttendance,
  handleStatus,
  selectedAttendance,
}: ItemProps) => {
  return (
    <Card
      className={`border cursor-pointer transition-shadow hover:shadow-lg ${selectedAttendance?.user_id == attendance.user_id ? "!bg-blue-200 !hover:bg-blue-200" : "bg-white hover:bg-gray-50"}`}
      onClick={() => setAttendance(attendance)}
    >
      <div className="flex flex-col items-center justify-center text-center py-12 px-2">
        <Image
          src={attendance.student_image_profile}
          alt={attendance.student_name}
          className={`w-24 h-24 mb-4`}
        />

        <h3 className="text-md font-medium mb-4">{attendance.student_name}</h3>
        <Badge
          size="sm"
          variant={handleStatus(attendance.attendance_status).variant}
          isStatus
        >
          {handleStatus(attendance.attendance_status).label}
        </Badge>
      </div>
    </Card>
  );
};

export default Item;
