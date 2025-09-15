import { Pagination } from "./index.types";

export interface Participant {
  id: 1;
  name: string;
  image: string;
  present: boolean;
}

export interface ParticipantList extends Pagination {
  data: Participant[];
}
