import type { Follow, Like, Note, User } from "@prisma/client";
import assert from "assert";

import type { apSchemaService } from "@/_shared/activitypub/apSchemaService";

import { env } from "./env";
import { getIconPath } from "./icon";

const required = <T>(value: T | null | undefined) => {
  if (value === null || value === undefined) throw new Error("値が必要です");
  return value;
};

const contexts = {
  "@context": [
    "https://www.w3.org/ns/activitystreams",
    "https://w3id.org/security/v1",
  ],
};

const convertUser = (user: User) => {
  const userAddress = `https://${env.UNSOCIAL_HOST}/users/${user.id}`;
  const activityAddress = `${userAddress}/activity`;
  return {
    ...contexts,
    id: activityAddress,
    type: "Person",
    inbox: `${userAddress}/inbox`,
    outbox: `${userAddress}/outbox`,
    following: `${userAddress}/followees`,
    followers: `${userAddress}/followers`,
    featured: `${userAddress}/collections/featured`,
    preferredUsername: user.preferredUsername,
    name: user.name || "",
    summary: user.summary || "",
    url: userAddress,
    publicKey: {
      id: `${activityAddress}#main-key`,
      owner: activityAddress,
      publicKeyPem: required(user.publicKey),
    },
    icon: {
      type: "Image",
      url: `https://${env.UNSOCIAL_HOST}` + getIconPath(user.iconHash, 128),
    },
  } satisfies apSchemaService.PersonActivity;
};

type Reply = Pick<Note, "id" | "url"> & {
  user: Pick<User, "actorUrl">;
};

type NoteWithReply = Pick<Note, "id" | "userId" | "content" | "publishedAt"> & {
  // TODO: users/[userKey]/collections/featured を修正する時にオプショナルを外す
  replyTo?: Reply | null;
};

const convertNote = (note: NoteWithReply) => {
  const userAddress = `https://${env.UNSOCIAL_HOST}/users/${note.userId}`;
  const inReplyTo = (() => {
    if (note.replyTo) {
      if (note.replyTo.url) return note.replyTo.url;
      return `https://${env.UNSOCIAL_HOST}/notes/${note.replyTo.id}/activity`;
    }
    return undefined;
  })();
  const cc = (() => {
    if (note.replyTo?.user.actorUrl) {
      return [`${userAddress}/followers`, note.replyTo.user.actorUrl];
    }
    return [`${userAddress}/followers`];
  })();
  return {
    ...contexts,
    id: `https://${env.UNSOCIAL_HOST}/notes/${note.id}/activity`,
    type: "Note",
    inReplyTo,
    content: note.content,
    attributedTo: `${userAddress}/activity`,
    published: note.publishedAt.toISOString(),
    to: ["https://www.w3.org/ns/activitystreams#Public"],
    cc,
  } satisfies apSchemaService.NoteActivity;
};

const convertCreate = (note: NoteWithReply) => {
  const object = convertNote(note);
  return {
    ...contexts,
    id: `https://${env.UNSOCIAL_HOST}/notes/${note.id}/activity`,
    type: "Create",
    actor: `https://${env.UNSOCIAL_HOST}/users/${note.userId}/activity`,
    published: object.published,
    to: object.to,
    cc: object.cc,
    object,
  } satisfies apSchemaService.CreateActivity;
};

const convertDelete = (note: Pick<Note, "id" | "userId">) => {
  return {
    ...contexts,
    type: "Delete",
    actor: `https://${env.UNSOCIAL_HOST}/users/${note.userId}/activity`,
    object: {
      type: "Tombstone",
      id: `https://${env.UNSOCIAL_HOST}/notes/${note.id}/activity`,
    },
  } satisfies apSchemaService.DeleteActivity;
};

const convertFollow = (follow: Follow, followeeUrl: string) => {
  return {
    ...contexts,
    // TODO: エンドポイントつくる
    id: `https://${env.UNSOCIAL_HOST}/follows/${follow.id}`,
    type: "Follow",
    actor: `https://${env.UNSOCIAL_HOST}/users/${follow.followerId}/activity`,
    object: followeeUrl,
  } satisfies apSchemaService.FollowActivity;
};

const convertLike = (like: Like, noteUrl: string) => {
  return {
    ...contexts,
    type: "Like",
    // TODO: エンドポイントつくる
    id: `https://${env.UNSOCIAL_HOST}/likes/${like.id}`,
    actor: `https://${env.UNSOCIAL_HOST}/users/${like.userId}/activity`,
    object: noteUrl,
    content: "👍",
  } satisfies apSchemaService.LikeActivity;
};

const convertUndo = (
  like: apSchemaService.LikeActivity | apSchemaService.FollowActivity,
) => {
  const { "@context": _, ...object } = like;
  return {
    ...contexts,
    type: "Undo",
    id: `${like.id}?undo=true`,
    actor: like.actor,
    object,
  } satisfies apSchemaService.UndoActivity;
};

const convertAnnounce = (noteWithQuote: Note & { quote: Note | null }) => {
  assert(noteWithQuote.quote, "ノートにquoteが存在しません");
  return {
    ...contexts,
    type: "Announce",
    id: `https://${env.UNSOCIAL_HOST}/notes/${noteWithQuote.id}/activity`,
    actor: `https://${env.UNSOCIAL_HOST}/users/${noteWithQuote.userId}/activity`,
    object:
      noteWithQuote.quote.url ??
      `https://${env.UNSOCIAL_HOST}/notes/${noteWithQuote.quote.id}/activity`,
    published: noteWithQuote.publishedAt.toISOString(),
  } satisfies apSchemaService.AnnounceActivity;
};

export const activityStreams = {
  user: convertUser,
  note: convertNote,
  create: convertCreate,
  delete: convertDelete,
  follow: convertFollow,
  like: convertLike,
  undo: convertUndo,
  announce: convertAnnounce,
};
