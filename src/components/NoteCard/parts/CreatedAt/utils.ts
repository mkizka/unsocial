export function format(date: Date) {
  let diff = (new Date().getTime() - date.getTime()) / 1000;
  if (diff < 60) return `${Math.floor(diff)}秒前`;
  diff /= 60;
  if (diff < 60) return `${Math.floor(diff)}分前`;
  diff /= 60;
  if (diff < 24) return `${Math.floor(diff)}時間前`;
  return date.toLocaleDateString("ja-JP");
}
