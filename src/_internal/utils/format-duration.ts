import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export function formatDuration(date: string) {
  return dayjs().from(dayjs(date), true);
}
