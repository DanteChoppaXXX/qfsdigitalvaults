import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#00ffcc" },
    background: { default: "#0d1117", paper: "#161b22" },
    text: { primary: "#c9d1d9" },
  },
  typography: {
    fontFamily: "'Inter', sans-serif",
  },
});

export default theme;

