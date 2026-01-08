import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import Pagination from "@/components/Pagination";
import type {
  HandlingStatus,
  Status,
  Student as StudentType,
} from "@/types/student";
import { fetchStudents } from "@/stores/student";
import type { AppDispatch, RootState } from "@/stores";
import ItemStudent from "./Item";
import Detail from "./Detail";

const statusList: HandlingStatus[] = [
  { status: "present", label: "Hadir", variant: "success" },
  { status: "loa", label: "Izin", variant: "warning" },
  { status: "absent", label: "Tidak Hadir", variant: "error" },
];

const Student = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { studentList, pagination } = useSelector(
    (state: RootState) => state.student
  );
  const [student, setStudent] = useState<StudentType>({} as StudentType);

  useEffect(() => {
    fetchData({ page: pagination.page, per_page: pagination.page_count });
  }, [dispatch]);

  const fetchData = (params: { page: number; per_page: number }) => {
    dispatch(fetchStudents(params));
  };

  const handelSetStudent = (value: StudentType) => {
    if (value === student) {
      setStudent({} as StudentType);
    } else {
      setStudent(value);
    }
  };

  const handleStatus = (status: Status): HandlingStatus => {
    const data = statusList.find((x) => x.status === status) || {
      status: "",
      label: "",
      variant: "neutral",
    };
    return data;
  };

  const gridCols = useMemo(() => {
    const cols = Math.round(pagination.per_page / 2);

    const map: Record<number, string> = {
      1: "grid-cols-1",
      2: "grid-cols-2",
      3: "grid-cols-3",
      4: "grid-cols-4",
      5: "grid-cols-5",
      6: "grid-cols-6",
    };

    return map[cols] ?? "grid-cols-1";
  }, [pagination.per_page]);

  if (studentList.length === 0) {
    return <div>Data siswa tidak ditemukan.</div>;
  }

  return (
    <div className="w-full flex gap-12">
      <div
        className={
          (Object.keys(student).length === 0 ? "w-full" : "w-4/5") +
          " transition-all"
        }
      >
        <div className={`grid ${gridCols} gap-6`}>
          {studentList?.map((item) => (
            <ItemStudent
              key={item.id}
              student={item}
              setStudent={(value) => handelSetStudent(value)}
              handleStatus={handleStatus}
              selectedStudent={student}
            />
          ))}
        </div>

        <div className="mt-8 flex justify-end">
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.page_count}
            onPageChange={(page) =>
              fetchData({ page, per_page: pagination.per_page })
            }
          />
        </div>
      </div>
      <div
        className={
          (Object.keys(student).length === 0 ? "hidden" : "w-1/5") +
          " transition-all"
        }
      >
        <Detail student={student} statusList={statusList} />
      </div>
    </div>
  );
};

export default Student;
