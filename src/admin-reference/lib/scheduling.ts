// Calendar metadata for the single LumiNails schedule.
export type ScheduleException = {
  id: string;
  title: string;
  kind: "vacation" | "blocked" | "custom-hours" | "personal";
  startDate: string;
  endDate: string;
  startTime?: string;
  endTime?: string;
};
