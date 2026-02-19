import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import Pagination from "@/components/Pagination";
import type { Attendance, HandlingStatus } from "@/types/student";
import { fetchAttendance } from "@/stores/student";
import type { AppDispatch, RootState } from "@/stores";
import ItemStudent from "./Item";
import Detail from "./Detail";

const attendanceOptions: HandlingStatus[] = [
  { value: 1, label: "Hadir", variant: "success" },
  { value: 2, label: "Izin", variant: "warning" },
  { value: 3, label: "Tidak Hadir", variant: "error" },
];

const Student = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { attendanceList } = useSelector((state: RootState) => state.student);
  const [attendance, setAttendance] = useState<Attendance>({} as Attendance);

  const [perPage, setPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);

  useEffect(() => {
    // Hardcoded
    fetchData("b686d699-73f4-4b05-99fd-b9ef723e66ec");
  }, [dispatch]);

  const fetchData = async (event_id: string) => {
    await dispatch(fetchAttendance({ event_id })).unwrap();

    if (attendanceList && attendanceList.length > 0) {
      setAttendance(attendanceList[0]);
      setPerPage(10);
      setPage(1);
      setTotalPage(Math.ceil(attendanceList.length / perPage));
    }
  };

  const filterAttendanceList = useMemo(() => {
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;

    return attendanceList.slice(startIndex, endIndex);
  }, [attendanceList, page]);

  const handelSetAttendance = (value: Attendance) => {
    if (value === attendance) {
      setAttendance({} as Attendance);
    } else {
      setAttendance(value);
    }
  };

  const handleStatus = (value: number): HandlingStatus => {
    const data = attendanceOptions.find((x) => x.value === value) || {
      value: 0,
      label: "",
      variant: "neutral",
    };
    return data;
  };

  if (attendanceList.length === 0) {
    return <div>Data siswa tidak ditemukan.</div>;
  }

  return (
    <div className="w-full flex gap-12">
      <div
        className={
          (Object.keys(attendance).length === 0 ? "w-full" : "w-4/5") +
          " transition-all"
        }
      >
        <div className="grid grid-cols-5 gap-6">
          {filterAttendanceList?.map((item) => (
            <ItemStudent
              key={item.user_id}
              attendance={item}
              setAttendance={(value) => handelSetAttendance(value)}
              handleStatus={handleStatus}
              selectedAttendance={attendance}
            />
          ))}
        </div>

        <div className="mt-8 flex justify-end">
          <Pagination
            currentPage={page}
            totalPages={totalPage}
            onPageChange={(page) => setPage(page)}
          />
        </div>
      </div>
      <div
        className={
          (Object.keys(attendance).length === 0 ? "hidden" : "w-1/5") +
          " transition-all"
        }
      >
        <Detail
          attendance={attendance}
          attendanceOptions={attendanceOptions}
          handleDone={() => fetchData("b686d699-73f4-4b05-99fd-b9ef723e66ec")} // hardcoded
        />
      </div>
    </div>
  );
};

export default Student;
