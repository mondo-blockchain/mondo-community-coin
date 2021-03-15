import { BigNumberish, Contract, Signer } from "ethers";
import domain from "./domain";

export interface VestedTransfer {
  contract: Contract;
  amount: string;
  recipient: string;
  startDate: Date;
}

export interface OwnershipTransfer {
  contract: Contract;
  newOwner: string;
}

const contractConnectedEvent = domain.createEvent<Contract>("contract");
const signerRetrievedEvent = domain.createEvent<Signer>("signer");
const balanceRetrievedEvent = domain.createEvent<BigNumberish>("balance");
const reserveRetrievedEvent = domain.createEvent<BigNumberish>("reserve");

const startVestedTransferEvent = domain.createEvent<VestedTransfer>(
  "start vested transfer"
);
const startOwnershipTransferEvent = domain.createEvent<OwnershipTransfer>(
  "start ownership transfer"
);
const connectWeb3Event = domain.createEvent("connect web3");

export const events = {
  connectWeb3Event,
  contractConnectedEvent,
  startVestedTransferEvent,
  startOwnershipTransferEvent,
  signerRetrievedEvent,
  balanceRetrievedEvent,
  reserveRetrievedEvent,
};
