import { Client } from "./client";
import { format } from "./utils";

type Props = {
  href: string;
  createdAt: Date;
};

export function PublishedAt(props: Props) {
  // react-hydration-error が出るので、初期値のみサーバーコンポーネントで計算してから渡す
  return <Client {...props} initialText={format(props.createdAt)} />;
}
