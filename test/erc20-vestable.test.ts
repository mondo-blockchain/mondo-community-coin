import { BigNumber, BigNumberish } from "@ethersproject/bignumber";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import chai from "chai";
import add from "date-fns/add";
import getUnixTime from "date-fns/getUnixTime";
import { solidity } from "ethereum-waffle";
import { ethers } from "hardhat";
import {
  ERC20Vested,
  ERC20VestedView,
  ERC20VestedView__factory,
  ERC20Vested__factory,
} from "../typechain";

chai.use(solidity);
const { expect } = chai;
const ZERO = BigNumber.from(0);
const BASE = BigNumber.from(10).pow(18);
const ONE_TOKEN = BigNumber.from(1).mul(BASE);

const INITIAL_OWNER_BALANCE = ONE_TOKEN.mul(10000);

const VESTING_MONTHS = new Array(29)
  .fill(0)
  .map((_, index) => days((index + 1) * 30));
const VESTING_BASIS_POINTS = new Array(20)
  .fill(0)
  .map((_, index) => (index + 1) * 50)
  .concat(new Array(9).fill(0).map((_, index) => 20 * 50 + (index + 1) * 1000));

console.log(VESTING_MONTHS);
console.log(VESTING_BASIS_POINTS);

describe("ERC20Vested", () => {
  let viewContract: ERC20VestedView;
  let contract: ERC20Vested;
  let owner: SignerWithAddress;
  let account1: SignerWithAddress;
  let account2: SignerWithAddress;

  const init = async () => {
    const signers = await ethers.getSigners();

    [owner, account1, account2] = signers;

    const vestedFactory = (await ethers.getContractFactory(
      "ERC20Vested",
      owner
    )) as ERC20Vested__factory;
    contract = await vestedFactory.deploy(
      "Mondo Community Coin",
      "MNDCC",
      INITIAL_OWNER_BALANCE,
      VESTING_MONTHS,
      VESTING_BASIS_POINTS
    );

    await contract.deployed();

    const vestedViewFactory = (await ethers.getContractFactory(
      "ERC20VestedView",
      owner
    )) as ERC20VestedView__factory;
    viewContract = await vestedViewFactory.deploy(
      "vested Mondo Community Coin",
      "vMNDCC",
      INITIAL_OWNER_BALANCE,
      contract.address
    );

    await viewContract.deployed();
  };

  beforeEach(async () => {
    await init();
  });

  describe("owner", async () => {
    it("should have initial balance", async () => {
      const initialBalance = await contract.balanceOf(owner.address);
      expect(initialBalance).to.equal(INITIAL_OWNER_BALANCE);
    });

    describe("when transfers ownership", async () => {
      describe("when new owner has no vesting", async () => {
        it("old owner should have 0 balance and new owner entire balance", async () => {
          const newOwner = account1;

          await contract.transferOwnership(newOwner.address);

          const oldOwnerBalance = await contract.balanceOf(owner.address);
          const newOwnerBalance = await contract.balanceOf(newOwner.address);

          expect(oldOwnerBalance).to.eq(ZERO);
          expect(newOwnerBalance).to.eq(INITIAL_OWNER_BALANCE);
        });
      });
      describe("when new owner has already vesting", async () => {
        it("should fail", async () => {
          const newOwner = account1;

          await contract.transferVested(
            newOwner.address,
            ONE_TOKEN,
            getUnixTime(new Date())
          );

          expect(contract.transferOwnership(newOwner.address)).to.be.reverted;
        });
      });
    });
  });

  describe("vesting", async () => {
    describe("when receiver is owner", async () => {
      it("should fail", async () => {
        const vestedAmount = ONE_TOKEN.mul(1000);
        expect(
          contract.transferVested(
            owner.address,
            vestedAmount,
            getUnixTime(new Date())
          )
        ).to.be.reverted;
      });
    });
    describe("when receiver is vested starting today", async () => {
      const vestedAmount = ONE_TOKEN.mul(1000);
      beforeEach(async () => {
        await contract.transferVested(
          account1.address,
          vestedAmount,
          getUnixTime(new Date())
        );
      });
      it(`should have 0.5% (50 basis points) of ${ethers.utils.formatUnits(
        vestedAmount
      )} as balance`, async () => {
        const recipientBalance = await contract.balanceOf(account1.address);
        const recipientVestedBalance = await viewContract.balanceOf(
          account1.address
        );
        console.log(
          "***",
          ethers.utils.formatUnits(recipientBalance),
          ethers.utils.formatUnits(recipientVestedBalance)
        );

        expect(
          recipientBalance,
          "Recipient should have only free portion as balance"
        ).to.eq(basisPointsOf(vestedAmount, 50));
      });
      it("should be able to transfer entire free balance", async () => {
        const senderBalanceBeforeTransfer = await contract.balanceOf(
          account1.address
        );
        await contract
          .connect(account1)
          .transfer(account2.address, senderBalanceBeforeTransfer);
        const senderBalanceAfterTransfer = await contract.balanceOf(
          account1.address
        );
        const recepientBalanceAfterTransfer = await contract.balanceOf(
          account2.address
        );

        expect(recepientBalanceAfterTransfer).to.eq(
          senderBalanceBeforeTransfer
        );
        expect(senderBalanceAfterTransfer).to.eq(ZERO);
      });
      it("should be able to receive free tokens adding to the balance of own tokens freed from vesting", async () => {
        const additionalFreeTokens = ONE_TOKEN.mul(20);
        await contract.transfer(account1.address, additionalFreeTokens);
        const recepientBalance = await contract.balanceOf(account1.address);
        expect(
          recepientBalance,
          "Recipient should have free portion of vested amount and the additional amount received as balance"
        ).to.eq(basisPointsOf(vestedAmount, 50).add(additionalFreeTokens));
      });
      it("should not be able to transfer more than free balance", async () => {
        const amountSlightlyAboveFreeBalance = basisPointsOf(
          vestedAmount,
          50
        ).add(1);
        expect(
          contract
            .connect(account1)
            .transfer(account2.address, amountSlightlyAboveFreeBalance)
        ).to.be.reverted;
      });
    });

    describe("when receiver is not vested", async () => {
      describe("when amount below balance", async () => {
        it("should succeed", async () => {
          const amount = INITIAL_OWNER_BALANCE.div(4);
          await contract.transfer(account1.address, amount);
          const senderBalance = await contract.balanceOf(owner.address);
          const recepientBalance = await contract.balanceOf(account1.address);
          expect(
            recepientBalance,
            "Recipient should have received full amount."
          ).to.eq(amount);
          expect(senderBalance).to.eq(INITIAL_OWNER_BALANCE.sub(amount));
        });
      });
      describe("when amount equals balance", async () => {
        it("should succeed", async () => {
          const amount = INITIAL_OWNER_BALANCE;
          await contract.transfer(account1.address, amount);
          const senderBalance = await contract.balanceOf(owner.address);
          const recepientBalance = await contract.balanceOf(account1.address);
          expect(
            recepientBalance,
            "Recipient should have received full amount."
          ).to.eq(amount);
          expect(senderBalance).to.eq(INITIAL_OWNER_BALANCE.sub(amount));
        });
      });
      describe("when amount above balance", async () => {
        it("should fail", async () => {
          const amount = INITIAL_OWNER_BALANCE.add(1);
          expect(contract.transfer(account1.address, amount)).to.be.reverted;
        });
      });
    });
  });

  describe("account", async () => {
    beforeEach(async () => {
      await contract.transferVested(account1.address, 1000, 0);
    });
    it("should have vested amount as initial balance", async () => {
      const initialBalance = await contract.balanceOf(account1.address);
      expect(initialBalance).to.equal(1000);
    });
  });
});

function days(days: number) {
  return getUnixTime(add(0, { days }));
}

function basisPointsOf(
  value: BigNumberish,
  basisPoints: BigNumberish
): BigNumber {
  return BigNumber.from(value).mul(basisPoints).div(10000);
}
