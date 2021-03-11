import { BigNumber } from "@ethersproject/bignumber";
import { DeployFunction } from "hardhat-deploy/types";
const BASE = BigNumber.from(10).pow(18);

const func: DeployFunction = async ({
  getNamedAccounts,
  getUnnamedAccounts,
  deployments,
}) => {
  const { deploy } = deployments;
  const { deployer, r1, r2 } = await getNamedAccounts();
  console.log("***", deployer, r1, r2);

  const deployment = await deploy("ERC20Vested", {
    from: deployer,
    // gas: 4000000,
    args: [
      "Mondo Community Coin",
      "MNDCC",
      deployer,
      BASE.mul("180000000"),
      [
        2592000,
        5184000,
        7776000,
        10368000,
        12960000,
        15552000,
        18144000,
        20736000,
        23328000,
        25920000,
        28512000,
        31104000,
        33696000,
        36288000,
        38880000,
        41472000,
        44064000,
        46656000,
        49248000,
        51840000,
        54432000,
        57024000,
        59616000,
        62208000,
        64800000,
        67392000,
        69984000,
        72576000,
        75168000,
      ],
      [
        50,
        100,
        150,
        200,
        250,
        300,
        350,
        400,
        450,
        500,
        550,
        600,
        650,
        700,
        750,
        800,
        850,
        900,
        950,
        1000,
        2000,
        3000,
        4000,
        5000,
        6000,
        7000,
        8000,
        9000,
        10000,
      ],
    ],
  });
  console.log("*** deployed at", deployment.address);
};

export default func;
