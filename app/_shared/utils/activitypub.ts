import type { Follow, Like, Note, User } from "@prisma/client";
import type { AP } from "activitypub-core-types";

import { env } from "./env";
import { getIconPath } from "./icon";

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
    following: new URL(`${userAddress}/followees`),
    followers: new URL(`${userAddress}/followers`),
    featured: new URL(`${userAddress}/collections/featured`),
    preferredUsername: user.preferredUsername,
    name: user.name || "",
    summary: user.summary || "",
    url: new URL(userAddress),
    publicKey: {
      id: `${activityAddress}#main-key`,
      owner: activityAddress,
      publicKeyPem: required(user.publicKey),
    },
    icon: {
      type: "Image",
      url: new URL(getIconPath(user.iconHash, 128), `https://${env.HOST}`),
    } as AP.Image, // なぜか型エラーになる,
  };
};

type Reply = Pick<Note, "id" | "url"> & {
  user: Pick<User, "actorUrl">;
};

type NoteWithReply = Pick<Note, "id" | "userId" | "content" | "createdAt"> & {
  // TODO: users/[userKey]/collections/featured を修正する時にオプショナルを外す
  replyTo?: Reply | null;
};

const convertNote = (note: NoteWithReply): AP.Note => {
  const userAddress = `https://${env.HOST}/users/${note.userId}`;
  const inReplyTo = (() => {
    if (note.replyTo) {
      if (note.replyTo.url) return new URL(note.replyTo.url);
      return new URL(`https://${env.HOST}/notes/${note.replyTo.id}/activity`);
    }
    return undefined;
  })();
  const cc = (() => {
    if (note.replyTo?.user.actorUrl) {
      return [
        new URL(`${userAddress}/followers`),
        new URL(note.replyTo.user.actorUrl),
      ];
    }
    return [new URL(`${userAddress}/followers`)];
  })();
  return {
    ...contexts,
    id: new URL(`https://${env.HOST}/notes/${note.id}/activity`),
    type: "Note",
    inReplyTo,
    content: note.content,
    attributedTo: new URL(`${userAddress}/activity`),
    published: note.createdAt,
    to: [new URL("https://www.w3.org/ns/activitystreams#Public")],
    cc,
  };
};

const convertCreate = (note: NoteWithReply): AP.Create => {
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
  like: convertLike,
  undo: convertUndo,
};
