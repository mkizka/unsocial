import {
  Box,
  Burger,
  Header as _Header,
  MediaQuery,
  useMantineTheme,
} from "@mantine/core";
import type { FC } from "react";

type Props = {
  opened: boolean;
  onClick: () => void;
};

export const Header: FC<Props> = ({ opened, onClick }) => {
  const theme = useMantineTheme();
  return (
    <_Header height={{ base: 50, md: 70 }} p="md">
      <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
        <MediaQuery largerThan="sm" styles={{ display: "none" }}>
          <Burger
            opened={opened}
            onClick={onClick}
            size="sm"
            color={theme.colors.gray[6]}
            mr="xl"
          />
        </MediaQuery>
        Soshal
      </Box>
    </_Header>
  );
};
