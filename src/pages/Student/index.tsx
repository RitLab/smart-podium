import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { AppDispatch, RootState } from "../../stores";
import { fetchStudents } from "../../stores/student.store";
import ListStudent from "./List";
import Detail from "./Detail";
import {
  HandlingStatus,
  Status,
  Student as StudentType,
} from "../../types/student.type";

const statusList: HandlingStatus[] = [
  { status: "present", label: "Hadir", variant: "success" },
  { status: "loa", label: "Izin", variant: "warning" },
  { status: "absent", label: "Tidak Hadir", variant: "error" },
];

const Student = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { studentList } = useSelector((state: RootState) => state.student);
  const [student, setStudent] = useState<StudentType>({} as StudentType);

  useEffect(() => {
    dispatch(fetchStudents());
  }, [dispatch]);

  const handleStatus = (status: Status): HandlingStatus => {
    const data = statusList.find((x) => x.status === status) || {
      status: "",
      label: "-",
      variant: "neutral",
    };
    return data;
  };

  return (
    <>
      <div className="w-full flex gap-12">
        <div className={Object.keys(student).length === 0 ? "w-full" : "w-2/3"}>
          <div className="grid grid-cols-5 gap-6">
            {studentList?.map((student) => (
              <ListStudent
                key={student.id}
                student={student}
                setStudent={setStudent}
                handleStatus={handleStatus}
              />
            ))}
          </div>
        </div>
        <div className={Object.keys(student).length === 0 ? "hidden" : "w-1/3"}>
          <Detail student={student} statusList={statusList} />
        </div>
      </div>
    </>
  );
};

export default Student;
