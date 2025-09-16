import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { AppDispatch, RootState } from "../../stores";
import { fetchStudents } from "../../stores/student.store";
import ListStudent from "./List";
import Detail from "./Detail";

const Student = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { studentList } = useSelector((state: RootState) => state.student);

  useEffect(() => {
    dispatch(fetchStudents());
  }, [dispatch]);

  return (
    <>
      <div className="w-full grid grid-flow-col gap-12">
        <div className="col-span-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {studentList?.map((student) => (
              <ListStudent key={student.id} student={student} />
            ))}
          </div>
        </div>
        <div className="col-span-1">
          <Detail name="Bastian Sinaga" image="https://i.pravatar.cc/300" />
        </div>
      </div>
    </>
  );
};

export default Student;
