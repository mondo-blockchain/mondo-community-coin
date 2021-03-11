import { BigNumber, BigNumberish } from "@ethersproject/bignumber";
import { expect } from "chai";
import { bn } from "./lib/bn";
describe("BigNumber readable", () => {
  it.skip("should insert _ as separator for BigNumber strings", () => {
    const testNumbers = [
      BigNumber.from(2),
      BigNumber.from(25),
      BigNumber.from(25 * 10),
      BigNumber.from(25 * 100),
      BigNumber.from(25 * 1000),
      BigNumber.from(25 * 10000),
      BigNumber.from(25 * 100000),
      BigNumber.from(25 * 1000000),
      BigNumber.from(25 * 10000000),
    ];

    const expectations = [
      "2",
      "25",
      "250",
      "2_500",
      "25_000",
      "250_000",
      "2_500_000",
      "25_000_000",
      "250_000_000",
    ];

    testNumbers.forEach((number, index) => {
      expect(bn.readable(number)).to.equal(expectations[index]);
    });
  });
});
