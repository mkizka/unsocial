// https://zenn.dev/catnose99/articles/19a05103ab9ec7
export function Spinner() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="aspect-square h-4/5 animate-spin rounded-full border-2 border-t-transparent"></div>
    </div>
  );
}
