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

const fetchBalanceFx = domain.createEffect({
  name: "fetchBalanceFx",
  handler: contractHandlers.balanceOf,
});

export const effects = {
  connectToContractFx,
  fetchBalanceFx,
  transferVestedFx,
};
