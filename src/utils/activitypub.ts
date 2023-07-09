import type { Follow, Like, Note, User } from "@prisma/client";
import type { AP } from "activitypub-core-types";

import { env } from "./env";

const required = <T>(value: T | null | undefined) => {
  if (value === null || value === undefined) throw new Error("値が必要です");
  return value;
};

const contexts = {
  "@context": [
    new URL("https://www.w3.org/ns/activitystreams"),
    new URL("https://w3id.org/security/v1"),
  ],
};

const convertUser = (
  user: User,
): AP.Person & {
  featured?: AP.OrderedCollectionReference;
} => {
  const userAddress = `https://${env.HOST}/users/${user.id}`;
  const activityAddress = `${userAddress}/activity`;
  return {
    ...contexts,
    id: new URL(activityAddress),
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
      id: `${activityAddress}#main-key`,
      owner: activityAddress,
      publicKeyPem: required(user.publicKey),
    },
    // TODO: user.iconを追加する
    icon: {
      type: "Image",
      url: new URL("https://github.com/mkizka.png"),
    } as AP.Image, // なぜか型エラーになる,
  };
};

const convertNote = (
  note: Pick<Note, "id" | "userId" | "content" | "createdAt">,
): AP.Note => {
  const userAddress = `https://${env.HOST}/users/${note.userId}`;
  return {
    ...contexts,
    id: new URL(`https://${env.HOST}/notes/${note.id}/activity`),
    type: "Note",
    content: note.content,
    attributedTo: new URL(`${userAddress}/activity`),
    published: note.createdAt,
    to: [new URL("https://www.w3.org/ns/activitystreams#Public")],
    cc: [new URL(`${userAddress}/followers`)],
  };
};

const convertCreate = (note: Note): AP.Create => {
  const object = convertNote(note);
  return {
    ...contexts,
    // TODO: エンドポイントつくる
    id: new URL(`https://${env.HOST}/notes/${note.id}/activity`),
    type: "Create",
    actor: new URL(`https://${env.HOST}/users/${note.userId}/activity`),
    published: object.published,
    to: object.to,
    cc: object.cc,
    object,
  };
};

const convertDelete = (note: Pick<Note, "id" | "userId">): AP.Delete => {
  return {
    ...contexts,
    type: "Delete",
    actor: new URL(`https://${env.HOST}/users/${note.userId}/activity`),
    object: {
      type: "Tombstone",
      id: new URL(`https://${env.HOST}/notes/${note.id}/activity`),
    },
  };
};

const convertFollow = (follow: Follow, followeeUrl: string): AP.Follow => {
  return {
    ...contexts,
    // TODO: エンドポイントつくる
    id: new URL(`https://${env.HOST}/follows/${follow.id}`),
    type: "Follow",
    actor: new URL(`https://${env.HOST}/users/${follow.followerId}/activity`),
    object: new URL(followeeUrl),
  };
};

const convertAccept = (user: User, reveivedFollow: object): AP.Accept => {
  return {
    ...contexts,
    type: "Accept",
    actor: new URL(`https://${env.HOST}/users/${user.id}/activity`),
    object: reveivedFollow as AP.Follow,
  };
};

const convertLike = (like: Like, noteUrl: string): AP.Like => {
  return {
    ...contexts,
    type: "Like",
    // TODO: エンドポイントつくる
    id: new URL(`https://${env.HOST}/likes/${like.id}`),
    actor: new URL(`https://${env.HOST}/users/${like.userId}/activity`),
    object: new URL(noteUrl),
    content: "👍",
  };
};

const convertUndo = (like: AP.Like | AP.Follow): AP.Undo => {
  const { "@context": _, ...object } = like;
  return {
    ...contexts,
    type: "Undo",
    id: new URL("?undo=true", like.id!),
    actor: like.actor,
    object,
  };
};

export const activityStreams = {
  user: convertUser,
  note: convertNote,
  create: convertCreate,
  delete: convertDelete,
  follow: convertFollow,
  accept: convertAccept,
  like: convertLike,
  undo: convertUndo,
};
