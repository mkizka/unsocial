import type { User } from "@prisma/client";
import type { GetServerSideProps, NextPage } from "next";
import Head from "next/head";

import { UserCard } from "../../components/UserCard";
import { activityStreams } from "../../utils/activitypub";
import { findOrFetchUserById } from "./service";

type Props = {
  user: User;
};

const UserPage: NextPage<Props> = ({ user }) => {
  const title = `${user.name ?? ""}@${user.preferredUsername}@${user.host}`;
  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <UserCard user={user} />
    </>
  );
};

export default UserPage;

export const getServerSideProps: GetServerSideProps = async ({
  req,
  res,
  params,
}) => {
  if (typeof params?.userId != "string") {
    return { notFound: true };
  }
  const user = await findOrFetchUserById(params.userId);
  if (user == null) {
    return { notFound: true };
  }
  if (req.headers.accept?.includes("application/activity+json")) {
    res.setHeader("Content-Type", "application/activity+json");
    // TODO: リモートユーザーの場合はどうする？
    res.write(JSON.stringify(activityStreams.user(user)));
    res.end();
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { email, emailVerified, privateKey, ...publicUser } = user;
  return {
    props: {
      user: publicUser,
    },
  };
};
