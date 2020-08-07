import { BigNumber } from "@ethersproject/bignumber";

export const UnitsPerToken: BigNumber = BigNumber.from("1000000000000000000");

export const AddressOne: string = "0x0000000000000000000000000000000000000001";
/* Equivalent to 1% in mantissa form */
export const OnePercent: BigNumber = BigNumber.from("10000000000000000");
/* Equivalent to 100% in mantissa form */
export const OneHundredPercent: BigNumber = BigNumber.from("1000000000000000000");
/* Equivalent to 10,000% in mantissa form */
export const TenThousandPercent: BigNumber = BigNumber.from("100000000000000000000");

export const OneToken: BigNumber = UnitsPerToken;
export const TenTokens: BigNumber = UnitsPerToken.mul(10);
export const OneHundredTokens: BigNumber = UnitsPerToken.mul(100);
export const OneThousandTokens: BigNumber = UnitsPerToken.mul(1000);

export const FintrollerConstants = {
  CollateralizationRatioLowerBoundMantissa: OneHundredPercent,
  CollateralizationRatioUpperBoundMantissa: TenThousandPercent,
};
