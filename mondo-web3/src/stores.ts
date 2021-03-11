import { BigNumberish, Contract, Signer } from "ethers";
import domain from "./domain";
import { events } from "./events";
import { option as O } from "fp-ts";
import { Option } from "fp-ts/lib/Option";

const $balance = domain
  .createStore<Option<BigNumberish>>(O.none, {
    name: "balance",
  })
  .on(events.balanceRetrievedEvent, (_, payload) => O.fromNullable(payload));

const $signer = domain
  .createStore<Option<Signer>>(O.none, {
    name: "signer",
  })
  .on(events.signerRetrievedEvent, (_, payload) => O.fromNullable(payload));

const $contract = domain
  .createStore<Option<Contract>>(O.none, {
    name: "contract",
  })
  .on(events.contractConnectedEvent, (_, payload) => O.fromNullable(payload));

const $amount = domain
  .createStore<Option<string>>(O.none, {
    name: "balance",
  })
  .on(events.amountChangedEvent, (_, payload) => O.fromNullable(payload));

const $recipient = domain
  .createStore<Option<string>>(O.none, {
    name: "signer",
  })
  .on(events.recipientChangedEvent, (_, payload) => O.fromNullable(payload));

const $date = domain
  .createStore<Option<Date>>(O.none, {
    name: "date",
  })
  .on(events.dateChangedEvent, (_, payload) => O.fromNullable(payload));

export const stores = {
  $balance,
  $signer,
  $contract,
  $amount,
  $recipient,
  $date,
};
