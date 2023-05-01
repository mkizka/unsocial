import { Aside as _Aside, MediaQuery, Text } from "@mantine/core";

export const Aside = () => {
  return (
    <MediaQuery smallerThan="sm" styles={{ display: "none" }}>
      <_Aside p="md" hiddenBreakpoint="sm" width={{ sm: 200, lg: 300 }}>
        <Text>Application sidebar</Text>
      </_Aside>
    </MediaQuery>
  );
};
