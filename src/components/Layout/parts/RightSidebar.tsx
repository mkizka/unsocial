import { Aside, MediaQuery, Text } from "@mantine/core";

export const RightSidebar = () => {
  return (
    <MediaQuery smallerThan="sm" styles={{ display: "none" }}>
      <Aside p="md" hiddenBreakpoint="sm" width={{ sm: 200, lg: 300 }}>
        <Text>右サイドバー</Text>
      </Aside>
    </MediaQuery>
  );
};
