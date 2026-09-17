import * as React from "react";
import { Typography, Box } from "@mui/material";

export default function AboutPage() {
  return (
    <Box p={2}>
      <Typography variant="h4" gutterBottom>About</Typography>
      <Typography>This is an example page. You can add your own content here.</Typography>
    </Box>
  );
}
