export function format(date: Date) {
  let diff = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  if (diff <= 60) return `${diff}秒前`;
  diff = Math.floor(diff / 60);
  if (diff <= 60) return `${diff}分前`;
  diff = Math.floor(diff / 60);
  if (diff <= 24) return `${diff}時間前`;
  diff = Math.floor(diff / 24);
  return date.toLocaleDateString("ja-JP");
}
