import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Input,
  NumberInput,
  NumberInputField,
  Stack,
  StackDivider,
  Text,
} from "@chakra-ui/react";
import { useStore } from "effector-react";
import { option as O } from "fp-ts";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";
import DatePicker from "../date-picker";
import { frmt } from "../format";
import { stores } from "../stores";
import { controlCenter } from "./constrol-center-store";

export const ControlCenter = () => {
  const reserve = useStore(stores.$reserve);
  const amount = useStore(controlCenter.$amount);
  const recipient = useStore(controlCenter.$recipient);
  const owner = useStore(controlCenter.$owner);
  const startDate = useStore(controlCenter.$startDate);
  const contract = useStore(stores.$contract);

  return (
    <Flex minH={"100vh"} align={"center"} justify={"center"} bg={"gray.800"}>
      <Stack spacing={8} mx={"auto"} maxW={"5xl"} py={12} px={6}>
        {pipe(
          contract,
          O.map((c) => (
            <>
              <Stack align={"center"}>
                <Heading fontSize={"4xl"}>MNDCC Control Center</Heading>
                <Flex direction="row">
                  <Text color="gray.400">Contract Address:</Text>
                  <Box marginX="2">
                    {pipe(
                      contract,
                      O.map((contract) => contract.address),
                      O.getOrElseW(() => "-")
                    )}
                  </Box>
                </Flex>
                <Flex direction="row">
                  <Text color="gray.400">Remaining Reserve:</Text>
                  <Text color="whiteAlpha.900" marginX="2">
                    {pipe(
                      reserve,
                      O.map(frmt.units),
                      O.getOrElseW(() => "-")
                    )}
                  </Text>
                  <Text color="gray.400">MNDCC</Text>
                </Flex>
              </Stack>
              <Box rounded={"lg"} bg={"gray.700"} boxShadow={"lg"} p={8}>
                <HStack
                  spacing={10}
                  divider={<StackDivider color="gray.200" />}
                  align="start"
                >
                  <Stack w="2xl" spacing={4}>
                    <FormControl id="recipient">
                      <FormLabel>Recipient address</FormLabel>
                      <Input
                        value={O.getOrElseW(() => undefined)(recipient)}
                        onChange={(e) =>
                          controlCenter.onRecipientChange(e.currentTarget.value)
                        }
                      />
                    </FormControl>
                    <Stack spacing={10}>
                      <Stack
                        direction={{ base: "column", sm: "row" }}
                        align={"start"}
                        justify={"space-between"}
                      >
                        <FormControl id="vesting-start">
                          <FormLabel>Vesting Start Date</FormLabel>
                          <DatePicker
                            onChange={(date: any) =>
                              controlCenter.onStartDateChange(date)
                            }
                            selectedDate={O.getOrElse(() => new Date())(
                              startDate
                            )}
                          />
                        </FormControl>
                        <FormControl id="amount">
                          <FormLabel>Amount</FormLabel>
                          <NumberInput>
                            <NumberInputField
                              onChange={(e) =>
                                controlCenter.onAmountChange(
                                  e.currentTarget.value
                                )
                              }
                              value={O.getOrElseW(() => undefined)(amount)}
                            />
                          </NumberInput>
                        </FormControl>
                      </Stack>
                      <Button
                        onClick={() => controlCenter.onTransferVested()}
                        bg={"blue.400"}
                        color={"white"}
                        _hover={{
                          bg: "blue.500",
                        }}
                      >
                        Transfer Vested
                      </Button>
                    </Stack>
                  </Stack>
                  <Stack w="2xl" spacing={4}>
                    <FormControl id="owner">
                      <FormLabel>New Owner</FormLabel>
                      <Input
                        value={O.getOrElseW(() => undefined)(owner)}
                        onChange={(e) =>
                          controlCenter.onOwnerChange(e.currentTarget.value)
                        }
                      />
                    </FormControl>
                    <Button
                      onClick={() => controlCenter.onTransferOwnership()}
                      bg={"blue.400"}
                      color={"white"}
                      _hover={{
                        bg: "blue.500",
                      }}
                    >
                      Transfer Ownership
                    </Button>
                  </Stack>
                </HStack>
              </Box>
            </>
          )),
          O.getOrElse(() => (
            <>
              <Button
                onClick={() => controlCenter.onConnect()}
                bg={"blue.400"}
                color={"white"}
                _hover={{
                  bg: "blue.500",
                }}
              >
                Connect Wallet
              </Button>
            </>
          ))
        )}
      </Stack>
    </Flex>
  );
};
