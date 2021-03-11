import { BigNumber } from "ethers";

function readable(bn: BigNumber): string {
  const bnstr = bn.toString();
  const pad = 3 - (bnstr.length % 3);
  const padded = bnstr.padStart(pad + bnstr.length, "x");
  const readableWithPad = padded.replace(/(.{3})/g, "$1_");
  return readableWithPad.replace(/x+/, "").replace(/^_/, "").replace(/_$/, "");
}

export const bn = {
  readable,
};
