import { getUnixTime } from "date-fns";
import { forward } from "effector";
import { ethers } from "ethers";
import { effects } from "./effects";
import { events } from "./events";

forward({
  from: events.startVestedTransferEvent.map(
    ({ contract, amount, recipient, startDate }) => ({
      contract,
      recipient,
      startDateUnix: getUnixTime(startDate),
      amountUnits: ethers.utils.parseUnits(amount, 18),
    })
  ),
  to: effects.transferVestedFx,
});

forward({
  from: events.startOwnershipTransferEvent,
  to: effects.transferOwnershipFx,
});

forward({
  from: events.connectWeb3Event,
  to: effects.connectToContractFx,
});

forward({
  from: effects.connectToContractFx.doneData,
  to: events.contractConnectedEvent,
});

forward({
  from: events.contractConnectedEvent,
  to: [effects.fetchBalanceFx, effects.fetchReserveFx],
});

forward({
  from: effects.fetchBalanceFx.doneData,
  to: events.balanceRetrievedEvent,
});

forward({
  from: effects.fetchReserveFx.doneData,
  to: events.reserveRetrievedEvent,
});
