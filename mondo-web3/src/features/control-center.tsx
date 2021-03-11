import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  NumberInput,
  NumberInputField,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useEvent, useStore } from "effector-react";
import { option as O } from "fp-ts";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";
import DatePicker from "../date-picker";
import { events } from "../events";
import { format } from "../format";
import { stores } from "../stores";

export const ControlCenter = () => {
  const balance = useStore(stores.$balance);
  const amount = useStore(stores.$amount);
  const recipient = useStore(stores.$recipient);
  const startDate = useStore(stores.$date);
  const contract = useStore(stores.$contract);
  const onRecipientChange = useEvent(events.recipientChangedEvent);
  const onDateChange = useEvent(events.dateChangedEvent);
  const onAmountChange = useEvent(events.amountChangedEvent);
  const onStartVestedTransfer = useEvent(events.startVestedTransferEvent);
  const onConnect = useEvent(events.connectWeb3Event);

  return (
    <Flex minH={"100vh"} align={"center"} justify={"center"} bg={"gray.800"}>
      <Stack spacing={8} mx={"auto"} maxW={"3xl"} py={12} px={6}>
        {pipe(
          contract,
          O.map((c) => (
            <>
              <Stack align={"center"}>
                <Heading fontSize={"4xl"}>MNDCC Control Center</Heading>
                <Flex direction="row">
                  <Text color="gray.400">Your Balance:</Text>
                  <Text color="whiteAlpha.900" marginX="2">
                    {pipe(
                      balance,
                      O.map(format.units),
                      O.getOrElseW(() => "-")
                    )}
                  </Text>
                  <Text color="gray.400">MNDCC</Text>
                </Flex>
              </Stack>
              <Box rounded={"lg"} bg={"gray.700"} boxShadow={"lg"} p={8}>
                <Stack w="lg" spacing={4}>
                  <FormControl id="recipient">
                    <FormLabel>Recipient address</FormLabel>
                    <Input
                      value={O.getOrElseW(() => undefined)(recipient)}
                      onChange={(e) => onRecipientChange(e.currentTarget.value)}
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
                          onChange={(date: any) => onDateChange(date)}
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
                              onAmountChange(e.currentTarget.value)
                            }
                            value={O.getOrElseW(() => undefined)(amount)}
                          />
                        </NumberInput>
                      </FormControl>
                    </Stack>
                    <Button
                      onClick={() =>
                        pipe(
                          contract,
                          O.map((c) =>
                            onStartVestedTransfer({
                              contract: c,
                              amount: O.getOrElse(() => "0")(amount),
                              recipient: O.getOrElse(() => "")(recipient),
                              startDate: O.getOrElse(() => new Date())(
                                startDate
                              ),
                            })
                          )
                        )
                      }
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
              </Box>
            </>
          )),
          O.getOrElse(() => (
            <>
              <Button
                onClick={() => onConnect()}
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
