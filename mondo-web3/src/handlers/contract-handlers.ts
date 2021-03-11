import { Signer } from "crypto";
import { BigNumber, Contract, ethers } from "ethers";

declare global {
  interface Window {
    ethereum: any;
  }
}

const mndcAbi = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function balanceOf(address) view returns (uint)",
  "function transfer(address to, uint amount)",
  "function transferVested(address to, uint amount, uint startDate)",
  "event Transfer(address indexed from, address indexed to, uint amount)",
];

type ChainId = number;

const contractAddress: Record<ChainId, string> = {
  31337: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
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

export const contractHandlers = {
  connect,
  balanceOf,
  transferVested,
};
