import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export function formatDuration(date: string, template?: string) {
  if (template) {
    return dayjs(date).format(template);
  }
  return dayjs().from(dayjs(date), true);
}
