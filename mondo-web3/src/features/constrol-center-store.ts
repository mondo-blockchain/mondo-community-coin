import { combine, sample } from "effector";
import { option as O } from "fp-ts/";
import { Option } from "fp-ts/lib/Option";
import domain from "../domain";
import { events } from "../events";
import { stores } from "../stores";

const onTransferVested = domain.createEvent("transfer vested");
const onTransferOwnership = domain.createEvent("transfer ownership");

const onOwnerChange = domain.createEvent<string>("owner");
const onRecipientChange = domain.createEvent<string>("recipient");
const onAmountChange = domain.createEvent<string>("amount");
const onStartDateChange = domain.createEvent<Date>("startDate");

const $amount = domain
  .createStore<Option<string>>(O.none, {
    name: "balance",
  })
  .on(onAmountChange, (_, payload) => O.fromNullable(payload));

const $recipient = domain
  .createStore<Option<string>>(O.none, {
    name: "recipient",
  })
  .on(onRecipientChange, (_, payload) => O.fromNullable(payload));

const $owner = domain
  .createStore<Option<string>>(O.none, {
    name: "owner",
  })
  .on(onOwnerChange, (_, payload) => O.fromNullable(payload));

const $startDate = domain
  .createStore<Option<Date>>(O.none, {
    name: "date",
  })
  .on(onStartDateChange, (_, payload) => O.fromNullable(payload));

const $vestedTransferRequest = combine({
  contract: stores.$contract,
  amount: $amount,
  recipient: $recipient,
  startDate: $startDate,
});

const $transferOwnershipRequest = combine({
  contract: stores.$contract,
  newOwner: $owner,
});

sample({
  source: $vestedTransferRequest,
  clock: onTransferVested,
})
  .filter({ fn: ({ contract }) => O.isSome(contract) })
  .map(({ contract, amount, recipient, startDate }) => ({
    contract: O.getOrElseW(() => undefined)(contract),
    amount: O.getOrElse(() => "0")(amount),
    recipient: O.getOrElse(() => "")(recipient),
    startDate: O.getOrElse(() => new Date())(startDate),
  }))
  .map((payload) => ({ ...payload, contract: payload.contract! }))
  .watch(events.startVestedTransferEvent);

sample({
  source: $transferOwnershipRequest,
  clock: onTransferOwnership,
})
  .filter({ fn: ({ contract }) => O.isSome(contract) })
  .map(({ contract, newOwner }) => ({
    contract: O.getOrElseW(() => undefined)(contract),
    newOwner: O.getOrElse(() => "")(newOwner),
  }))
  .map((payload) => ({ ...payload, contract: payload.contract! }))
  .watch(events.startOwnershipTransferEvent);

export const controlCenter = {
  $amount,
  $recipient,
  $startDate,
  $owner,
  onOwnerChange,
  onAmountChange,
  onRecipientChange,
  onStartDateChange,
  onTransferVested,
  onTransferOwnership,
  onConnect: events.connectWeb3Event,
};
