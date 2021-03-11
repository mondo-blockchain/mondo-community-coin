import { ChakraProvider } from "@chakra-ui/react";
import * as React from "react";
import { ControlCenter } from "./features/control-center";
import theme from "./theme";
import "./triggers";

export const App = () => (
  <ChakraProvider theme={theme}>
    <ControlCenter />
  </ChakraProvider>
);
