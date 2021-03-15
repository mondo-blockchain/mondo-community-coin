import { BigNumberish, ethers } from "ethers";

function units(bn: BigNumberish) {
  return ethers.utils.formatUnits(bn);
}

export const frmt = {
  units,
};
