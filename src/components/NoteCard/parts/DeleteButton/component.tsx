"use client";

type Props = {
  onClick: () => Promise<void>;
};

export function DeleteButton({ onClick }: Props) {
  return (
    <button data-testid="delete-button" onClick={() => onClick()}>
      削除
    </button>
  );
}
