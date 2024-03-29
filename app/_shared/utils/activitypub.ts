// Stryker disable all
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

const publicUrl = "https://www.w3.org/ns/activitystreams#Public";

const to = [publicUrl];

const convertUser = (user: User) => {
  const baseUrl = `https://${env.UNSOCIAL_HOST}/users/${user.id}`;
  const activityUrl = `${baseUrl}/activity`;
  return {
    ...contexts,
    id: activityUrl,
    url: `https://${env.UNSOCIAL_HOST}/@${user.preferredUsername}`,
    type: "Person",
    inbox: `${baseUrl}/inbox`,
    outbox: `${baseUrl}/outbox`,
    following: `${baseUrl}/followees`,
    followers: `${baseUrl}/followers`,
    featured: `${baseUrl}/collections/featured`,
    endpoints: {
      sharedInbox: `https://${env.UNSOCIAL_HOST}/inbox`,
    },
    preferredUsername: user.preferredUsername,
    name: user.name,
    summary: user.summary,
    publicKey: {
      id: `${activityUrl}#main-key`,
      owner: activityUrl,
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
  replyTo: Reply | null;
};

const convertNote = (note: NoteWithReply) => {
  const userBaseUrl = `https://${env.UNSOCIAL_HOST}/users/${note.userId}`;
  const inReplyTo = (() => {
    if (note.replyTo) {
      if (note.replyTo.url) return note.replyTo.url;
      return `https://${env.UNSOCIAL_HOST}/notes/${note.replyTo.id}/activity`;
    }
    return undefined;
  })();
  const cc = (() => {
    if (note.replyTo?.user.actorUrl) {
      return [`${userBaseUrl}/followers`, note.replyTo.user.actorUrl];
    }
    return [`${userBaseUrl}/followers`];
  })();
  const baseUrl = `https://${env.UNSOCIAL_HOST}/notes/${note.id}`;
  return {
    ...contexts,
    id: `${baseUrl}/activity`,
    url: baseUrl,
    type: "Note",
    inReplyTo,
    content: note.content,
    attributedTo: `${userBaseUrl}/activity`,
    published: note.publishedAt.toISOString(),
    to,
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
    to,
    cc: [`https://${env.UNSOCIAL_HOST}/users/${note.userId}/followers`],
  } satisfies apSchemaService.DeleteActivity;
};

const convertFollow = (follow: Follow, followeeUrl: string) => {
  return {
    ...contexts,
    id: `https://${env.UNSOCIAL_HOST}/follows/${follow.id}`,
    type: "Follow",
    actor: `https://${env.UNSOCIAL_HOST}/users/${follow.followerId}/activity`,
    object: followeeUrl,
  } satisfies apSchemaService.FollowActivity;
};

const convertFollowPublic = (userId: string) => {
  return {
    ...contexts,
    id: `https://${env.UNSOCIAL_HOST}/follows/${crypto.randomUUID()}`,
    type: "Follow",
    actor: `https://${env.UNSOCIAL_HOST}/users/${userId}/activity`,
    object: publicUrl,
  } satisfies apSchemaService.FollowActivity;
};

const convertAccept = (
  userId: string,
  follow: apSchemaService.FollowActivity,
) => {
  const { "@context": _, ...followToAccept } = follow;
  return {
    ...contexts,
    type: "Accept",
    id: `https://${env.UNSOCIAL_HOST}/${crypto.randomUUID()}`,
    actor: `https://${env.UNSOCIAL_HOST}/users/${userId}/activity`,
    object: followToAccept,
  } satisfies apSchemaService.AcceptActivity;
};

const convertLike = (like: Like, noteUrl: string) => {
  return {
    ...contexts,
    type: "Like",
    id: `https://${env.UNSOCIAL_HOST}/likes/${like.id}`,
    actor: `https://${env.UNSOCIAL_HOST}/users/${like.userId}/activity`,
    object: noteUrl,
    content: "👍",
  } satisfies apSchemaService.LikeActivity;
};

const convertUndo = (
  activity:
    | apSchemaService.LikeActivity
    | apSchemaService.FollowActivity
    | apSchemaService.AnnounceActivity,
) => {
  const { "@context": _, ...activityToUndo } = activity;
  return {
    ...contexts,
    type: "Undo",
    id: `${activityToUndo.id}?undo=true`,
    actor: activityToUndo.actor,
    object: activityToUndo,
  } satisfies apSchemaService.UndoActivity;
};

const convertAnnounce = (
  noteWithQuote: Note & { quote: (Note & { user: User }) | null },
) => {
  assert(noteWithQuote.quote);
  const cc = [
    `https://${env.UNSOCIAL_HOST}/users/${noteWithQuote.userId}/followers`,
  ];
  if (noteWithQuote.quote.user.actorUrl) {
    cc.push(noteWithQuote.quote.user.actorUrl);
  }
  return {
    ...contexts,
    type: "Announce",
    id: `https://${env.UNSOCIAL_HOST}/notes/${noteWithQuote.id}/activity`,
    actor: `https://${env.UNSOCIAL_HOST}/users/${noteWithQuote.userId}/activity`,
    object:
      noteWithQuote.quote.url ??
      `https://${env.UNSOCIAL_HOST}/notes/${noteWithQuote.quote.id}/activity`,
    published: noteWithQuote.publishedAt.toISOString(),
    to,
    cc,
  } satisfies apSchemaService.AnnounceActivity;
};

export const activityStreams = {
  user: convertUser,
  note: convertNote,
  create: convertCreate,
  delete: convertDelete,
  follow: convertFollow,
  followPublic: convertFollowPublic,
  accept: convertAccept,
  like: convertLike,
  undo: convertUndo,
  announce: convertAnnounce,
};
