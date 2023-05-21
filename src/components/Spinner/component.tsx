// https://zenn.dev/catnose99/articles/19a05103ab9ec7
export function Spinner() {
  return (
    <div className="flex justify-center items-center w-full h-full">
      <div className="animate-spin aspect-square h-4/5 border-2 rounded-full border-t-transparent"></div>
    </div>
  );
}
