// import { prisma } from "@/server/prisma";

// type Props = {
//   noteId: string;
// };

// export async function LikeDetail({ noteId }: Props) {
//   const likes = await prisma.like.findMany({
//     where: { noteId },
//     include: {
//       user: {
//         select: {
//           id: true,
//         },
//       },
//     },
//   });

//   async function handleClick() {
//     "use server";
//     console.log(noteId);
//   }

//   return (
//     <details data-testid="like-details-opener" onClick={handleClick}>
//       {likes?.map((like) => (
//         <p key={like.user.id}>
//           <span>{like.content}</span>
//           {/* <UserCard user={like.user} /> */}
//         </p>
//       ))}
//     </details>
//   );
// }
