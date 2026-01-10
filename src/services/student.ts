import { baseURL, handler } from ".";
import type { PaginationParams } from "@/types";
import type { StudentList, UpdateStatusPayload } from "@/types/student";

export const studentService = {
  getStudents: async (params: PaginationParams): Promise<StudentList> => {
    // return await handler.get<StudentList>(`${baseURL}/students`, { params });
    return {
      total_present: 20,
      total_absent: 5,
      total_loa: 3,
      students: [
        {
          id: 1,
          name: "Tanto Sunoto 1.1",
          image: "https://i.pravatar.cc/300?img=1",
          status: "present",
        },
        {
          id: 2,
          name: "Tatiana Mango",
          image: "https://i.pravatar.cc/300?img=2",
          status: "present",
        },
        {
          id: 3,
          name: "Paityn Dias",
          image: "https://i.pravatar.cc/300?img=3",
          status: "loa",
        },
        {
          id: 4,
          name: "Angel Lubin",
          image: "https://i.pravatar.cc/300?img=4",
          status: "present",
        },
        {
          id: 5,
          name: "Randy Arcand",
          image: "https://i.pravatar.cc/300?img=5",
          status: "loa",
        },
        {
          id: 6,
          name: "Jocelyn Siphron",
          image: "https://i.pravatar.cc/300?img=6",
          status: "present",
        },
        {
          id: 7,
          name: "Tanto Sunoto 2",
          image: "https://i.pravatar.cc/300?img=7",
          status: "present",
        },
        {
          id: 8,
          name: "Tatiana Mango",
          image: "https://i.pravatar.cc/300?img=8",
          status: "",
        },
        {
          id: 9,
          name: "Paityn Dias",
          image: "https://i.pravatar.cc/300?img=9",
          status: "absent",
        },
        {
          id: 10,
          name: "Angel Lubin",
          image: "https://i.pravatar.cc/300?img=10",
          status: "",
        },
        {
          id: 11,
          name: "Budi Satrio",
          image: "https://i.pravatar.cc/300?img=11",
          status: "present",
        },
        {
          id: 12,
          name: "Siska Melinda",
          image: "https://i.pravatar.cc/300?img=12",
          status: "present",
        },
      ],
      pagination: {
        page: 1,
        per_page: 12,
        page_count: 20,
        total_count: 240,
      },
    };
  },
  updateStatusStudent: async (payload: UpdateStatusPayload): Promise<any> => {
    // return await handler.put(`${baseURL}/change-status-students`, payload);
    return {
      id: 3,
      status: "present",
    };
  },
};
