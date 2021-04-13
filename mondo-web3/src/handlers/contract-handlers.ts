import { BigNumber, Contract, ethers } from "ethers";
import { OwnershipTransfer } from "../events";

declare global {
  interface Window {
    ethereum: any;
  }
}

const mndcAbi = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function balanceOf(address) view returns (uint)",
  "function totalBalanceOf(address) view returns (uint)",
  "function transfer(address to, uint amount)",
  "function transferOwnership(address newOwner)",
  "function transferVested(address to, uint amount, uint startDate)",
  "event Transfer(address indexed from, address indexed to, uint amount)",
];

type ChainId = number;

const contractAddress: Record<ChainId, string> = {
  31337: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  //   3: "0xa1420a8b662cCF644a426adA5aDE4C4D41C2A4b1",
  // 3: "0x5be3Eac96B404406256e5411afE0D0ecC282D57d",
  3: "0xB6015cBa726f28720BB76e0F99565c1E7F40C31e",
  1: "0xCDb9D30a3BA48CdfCB0EcbE19317E6cf783672f1",
};

async function connect() {
  if (typeof window.ethereum !== undefined) {
    await window.ethereum.enable();
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const chainId = (await provider.getNetwork()).chainId;
    const signer = provider.getSigner();

    const token = new ethers.Contract(
      contractAddress[chainId],
      mndcAbi,
      provider.getSigner()
    );
    token.connect(signer);
    return token;
  } else {
    throw new Error("No injected web3 found");
  }
}

async function balanceOf(contract: Contract) {
  return await contract.balanceOf(contract.signer.getAddress());
}

async function transferVested(params: {
  contract: Contract;
  recipient: string;
  amountUnits: BigNumber;
  startDateUnix: number;
}) {
  const { contract, recipient, amountUnits, startDateUnix } = params;
  return await contract.transferVested(recipient, amountUnits, startDateUnix);
}

async function transferOwnership(params: OwnershipTransfer) {
  const { contract, newOwner } = params;
  return await contract.transferOwnership(newOwner);
}

export const contractHandlers = {
  connect,
  balanceOf,
  transferVested,
  transferOwnership,
};
