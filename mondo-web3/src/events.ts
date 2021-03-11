import { BigNumberish, Contract, Signer } from "ethers";
import domain from "./domain";

export interface VestedTransfer {
  contract: Contract;
  amount: string;
  recipient: string;
  startDate: Date;
}

const contractConnectedEvent = domain.createEvent<Contract>("contract");
const signerRetrievedEvent = domain.createEvent<Signer>("signer");
const balanceRetrievedEvent = domain.createEvent<BigNumberish>("balance");

const recipientChangedEvent = domain.createEvent<string>("recipient");
const amountChangedEvent = domain.createEvent<string>("amount");
const dateChangedEvent = domain.createEvent<Date>("date");

const startVestedTransferEvent = domain.createEvent<VestedTransfer>(
  "start vested transfer"
);
const connectWeb3Event = domain.createEvent("connect web3");

export const events = {
  connectWeb3Event,
  contractConnectedEvent,
  startVestedTransferEvent,
  signerRetrievedEvent,
  balanceRetrievedEvent,
  recipientChangedEvent,
  amountChangedEvent,
  dateChangedEvent,
};
