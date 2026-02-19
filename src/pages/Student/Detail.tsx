import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { Card } from "@/components/Card";
import { Image } from "@/components/Image";
import type { Attendance, HandlingStatus } from "@/types/student";
import { Button } from "@/components/Button";
import type { AppDispatch, RootState } from "@/stores";
import { formattedDate } from "@/utils";
import { updateAttendance } from "@/stores/student";

type DetailProps = {
  attendance: Attendance;
  attendanceOptions: HandlingStatus[];
  handleDone: (param?: any) => void;
};

const Detail = ({ attendance, attendanceOptions, handleDone }: DetailProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const { total } = useSelector((state: RootState) => state.student);
  const { user } = useSelector((state: RootState) => state.auth);

  const [time, setTime] = useState(new Date());
  const [status, setStatus] = useState<number>();

  useEffect(() => {
    setTime(new Date());
  }, []);

  useEffect(() => {
    setStatus(attendance.attendance_status);
  }, [attendance]);

  const handleConfirmation = async () => {
    // Hardcoded event_id
    await dispatch(
      updateAttendance({
        status: status!,
        event_id: "b686d699-73f4-4b05-99fd-b9ef723e66ec",
        user_id: attendance.user_id,
      }),
    ).unwrap();

    handleDone();
  };

  return (
    <Card className="border">
      <div className="p-4 flex flex-col gap-8">
        <div className="bg-gray-100 rounded-lg mt-20 p-4 flex flex-col items-center">
          <div className="flex justify-center -mt-24">
            <Image
              src={attendance.student_image_profile}
              alt={attendance.student_name}
              className="w-32 h-32 border-4 border-white shadow-lg"
            />
          </div>

          <h2 className="text-2xl font-bold mt-4 mb-8">
            {attendance.student_name}
          </h2>
          <div className="text-sm text-gray-600 mb-1 font-bold">Instructor</div>
          <div className="text-sm text-gray-600 mb-2">{user?.name}</div>
          <div className="text-sm text-gray-600 mb-1 font-bold">Date</div>
          <div className="text-sm text-gray-600 mb-2">
            {formattedDate(time)}
          </div>

          <div className="mt-6 mb-1 flex justify-center gap-2 w-full">
            {attendanceOptions.map((item, index) => (
              <Button
                key={index}
                variant={item.variant}
                size="sm"
                className="w-full p-1"
                onClick={() => setStatus(item.value)}
              >
                {item.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="bg-gray-100 rounded-lg py-6 px-2 flex justify-between items-center">
          <div className="flex-1 text-center">
            <p className="text-gray-600 text-sm">Hadir</p>
            <p className="text-3xl font-semibold">{total.total_present || 0}</p>
          </div>

          <div className="w-px bg-gray-300 h-12 mx-2" />

          <div className="flex-1 text-center">
            <p className="text-gray-600 text-sm">Tidak Hadir</p>
            <p className="text-3xl font-semibold">{total.total_absent || 0}</p>
          </div>
        </div>

        {status !== attendance.attendance_status && (
          <div className="flex gap-4 w-full">
            <Button
              outline
              className="w-full py-2"
              onClick={() => setStatus(attendance.attendance_status)}
            >
              Batalkan
            </Button>
            <Button className="w-full py-2" onClick={handleConfirmation}>
              Konfirmasi
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default Detail;
