import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { Card } from "../../components/Card";
import { Image } from "../../components/Image";
import { HandlingStatus, Status, Student } from "../../types/student.type";
import { Button } from "../../components/Button";
import { AppDispatch, RootState } from "../../stores";
import { formattedDate } from "../../utils";
import { updateStatusStudent } from "../../stores/student.store";

type DetailProps = {
  student: Student;
  statusList: HandlingStatus[];
};

const Detail = ({ student, statusList }: DetailProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const { total } = useSelector((state: RootState) => state.student);
  const { user } = useSelector((state: RootState) => state.auth);

  const [time, setTime] = useState(new Date());
  const [status, setStatus] = useState<Status>();

  useEffect(() => {
    setTime(new Date());
  }, []);

  useEffect(() => {
    setStatus(student.status);
  }, [student]);

  return (
    <Card className="border">
      <div className="p-4 flex flex-col gap-8">
        <div className="bg-gray-100 rounded-lg mt-20 p-4 flex flex-col items-center">
          <div className="flex justify-center -mt-24">
            <Image
              src={student.image}
              alt={student.name}
              className="w-32 h-32 border-4 border-white shadow-lg"
            />
          </div>

          <h2 className="text-2xl font-bold mt-4 mb-8">{student.name}</h2>
          <div className="text-sm text-gray-600 mb-1 font-bold">Instructor</div>
          <div className="text-sm text-gray-600 mb-2">{user?.name}</div>
          <div className="text-sm text-gray-600 mb-1 font-bold">Date</div>
          <div className="text-sm text-gray-600 mb-2">
            {formattedDate(time)}
          </div>

          <div className="mt-6 mb-1 flex justify-center gap-2 w-full">
            {statusList.map((item) => (
              <Button
                variant={status === item.status ? item.variant : "neutral"}
                size="sm"
                className="w-full p-1"
                onClick={() => setStatus(item.status)}
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
            <p className="text-3xl font-semibold">
              {total.total_absent + total.total_loa || 0}
            </p>
          </div>
        </div>

        {status !== student.status && (
          <div className="flex gap-4 w-full">
            <Button
              outline
              className="w-full py-2"
              onClick={() => setStatus(student.status)}
            >
              Batalkan
            </Button>
            <Button
              className="w-full py-2"
              onClick={() => {
                dispatch(
                  updateStatusStudent({ id: student.id, status: status! })
                );
              }}
            >
              Konfirmasi
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default Detail;
