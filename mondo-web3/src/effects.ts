import domain from "./domain";
import { contractHandlers } from "./handlers/contract-handlers";

const connectToContractFx = domain.createEffect({
  name: "connectToContractFx",
  handler: contractHandlers.connect,
});

const transferVestedFx = domain.createEffect({
  name: "transferVestedFx",
  handler: contractHandlers.transferVested,
});

const transferOwnershipFx = domain.createEffect({
  name: "transferOwnershipFx",
  handler: contractHandlers.transferOwnership,
});

const fetchBalanceFx = domain.createEffect({
  name: "fetchBalanceFx",
  handler: contractHandlers.balanceOf,
});

const fetchReserveFx = domain.createEffect({
  name: "fetchReserveFx",
  handler: contractHandlers.remainingReserve,
});

export const effects = {
  connectToContractFx,
  fetchBalanceFx,
  fetchReserveFx,
  transferVestedFx,
  transferOwnershipFx,
};
