import type { User, Note, Follow } from "@prisma/client";
import type { AP } from "activitypub-core-types";
import { env } from "./env";

const required = <T>(value: T | null | undefined) => {
  if (value === null || value === undefined) throw new Error("値が必要です");
  return value;
};

const convertUser = (
  user: User
): AP.Person & {
  featured?: AP.OrderedCollectionReference;
} => {
  const userAddress = `https://${env.HOST}/users/${user.id}`;
  return {
    "@context": [
      new URL("https://www.w3.org/ns/activitystreams"),
      new URL("https://w3id.org/security/v1"),
    ],
    id: new URL(userAddress),
    type: "Person",
    inbox: new URL(`${userAddress}/inbox`),
    outbox: new URL(`${userAddress}/outbox`),
    following: new URL(`${userAddress}/following`),
    followers: new URL(`${userAddress}/followers`),
    featured: new URL(`${userAddress}/collections/featured`),
    preferredUsername: user.preferredUsername,
    name: user.name || "",
    url: new URL(userAddress),
    publicKey: {
      id: userAddress,
      owner: userAddress,
      publicKeyPem: required(user.publicKey),
    },
    // TODO: user.iconを追加する
    icon: {
      type: "Image",
      url: new URL("https://github.com/mkizka.png"),
    } as AP.Image, // なぜか型エラーになる,
  };
};

const convertNote = (note: Note): AP.Note => {
  const userAddress = `https://${env.HOST}/users/${note.userId}`;
  return {
    "@context": new URL("https://www.w3.org/ns/activitystreams"),
    id: new URL(`https://${env.HOST}/notes/${note.id}`),
    type: "Note",
    content: note.content,
    attributedTo: new URL(userAddress),
    published: note.createdAt,
    to: [new URL("https://www.w3.org/ns/activitystreams#Public")],
    cc: [new URL(`${userAddress}/followers`)],
  };
};

const convertCreate = (note: Note): AP.Create => {
  const object = convertNote(note);
  return {
    "@context": "https://www.w3.org/ns/activitystreams",
    // TODO: エンドポイントつくる
    id: new URL(`https://${env.HOST}/notes/${note.id}/activity`),
    type: "Create",
    actor: new URL(`https://${env.HOST}/users/${note.userId}`),
    published: object.published,
    to: object.to,
    cc: object.cc,
    object,
  };
};

const convertDelete = (note: Pick<Note, "id" | "userId">): AP.Delete => {
  return {
    "@context": new URL("https://www.w3.org/ns/activitystreams"),
    type: "Delete",
    actor: new URL(`https://${env.HOST}/users/${note.userId}`),
    object: new URL(`https://${env.HOST}/notes/${note.id}`),
  };
};

const convertFollow = (follow: Follow, followeeUrl: string): AP.Follow => {
  return {
    "@context": new URL("https://www.w3.org/ns/activitystreams"),
    // TODO: エンドポイントつくる
    id: new URL(`https://${env.HOST}/follows/${follow.id}`),
    type: "Follow",
    actor: new URL(`https://${env.HOST}/users/${follow.followerId}`),
    object: new URL(followeeUrl),
  };
};

export const activityStreams = {
  user: convertUser,
  note: convertNote,
  create: convertCreate,
  delete: convertDelete,
  follow: convertFollow,
};
