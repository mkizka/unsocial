"use client";

type Props = {
  isLiked: boolean;
  onClick: () => Promise<void>;
};

export function LikeButton({ isLiked, onClick }: Props) {
  return (
    <button data-testid="like-button" onClick={() => onClick()}>
      {isLiked ? "👍" : "-"}
    </button>
  );
}
