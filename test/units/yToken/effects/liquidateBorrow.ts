import { expect } from "chai";

export default function shouldBehaveLikeLiquidateBorrow(): void {
  describe("when the liquidator is not the borrower", function () {});

  describe("when the liquidator is the borrower", function () {
    it("reverts", async function () {});
  });

  describe("when the underlying amount is not zero", function () {});

  describe("when the underlying amount is zero", function () {
    it("reverts", async function () {});
  });

  describe("when the call to transfer the underlying succeeds", function () {});

  describe("when the call to transfer the underlying does not succeed", function () {
    it("reverts", async function () {});
  });

  describe("when the liquidator has enough underlying", function () {});

  describe("when the liquidator does not have enough underlying", function () {
    it("reverts", async function () {});
  });
}
