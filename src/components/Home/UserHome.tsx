import type { FC } from "react";

import { Layout } from "../Layout";
import { NoteForm } from "../NoteForm";
import { Timeline } from "../Timeline";

export const UserHome: FC = () => {
  return (
    <Layout>
      <NoteForm />
      <Timeline />
    </Layout>
  );
};
