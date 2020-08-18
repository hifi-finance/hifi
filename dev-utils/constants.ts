import { BigNumber } from "@ethersproject/bignumber";

/* Reusable constants */
export const OnePercent: BigNumber = BigNumber.from("10000000000000000");
export const UnitsPerToken: BigNumber = BigNumber.from("1000000000000000000");

/* Final constants */
export const AddressOne: string = "0x0000000000000000000000000000000000000001";
export const DefaultBlockGasLimit: BigNumber = BigNumber.from("10000000");
export const OneHundredPercent: BigNumber = OnePercent.mul(100);
export const OneHundredAndFiftyPercent: BigNumber = OnePercent.mul(150);
export const OneToken: BigNumber = UnitsPerToken;
export const OneHundredTokens: BigNumber = UnitsPerToken.mul(100);
export const OneThousandTokens: BigNumber = UnitsPerToken.mul(1000);
export const TenThousandPercent: BigNumber = OnePercent.mul(10000);
export const TenTokens: BigNumber = UnitsPerToken.mul(10);

/* Contract-specific constants */
export const FintrollerConstants = {
  CollateralizationRatioLowerBoundMantissa: OneHundredPercent,
  CollateralizationRatioUpperBoundMantissa: TenThousandPercent,
  DefaultCollateralizationRatioMantissa: OneHundredAndFiftyPercent,
};
