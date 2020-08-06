import { BigNumber } from "@ethersproject/bignumber";

/* Equivalent to 1% in mantissa form */
export const OnePercent: BigNumber = BigNumber.from("10000000000000000");
/* Equivalent to 100% in mantissa form */
export const OneHundredPercent: BigNumber = BigNumber.from("1000000000000000000");
/* Equivalent to 10,000% in mantissa form */
export const TenThousandPercent: BigNumber = BigNumber.from("100000000000000000000");

export const AddressOne: string = "0x0000000000000000000000000000000000000001";
export const UnitsPerToken: BigNumber = BigNumber.from("1000000000000000000");

export const FintrollerConstants = {
  CollateralizationRatioLowerBoundMantissa: OneHundredPercent,
  CollateralizationRatioUpperBoundMantissa: TenThousandPercent,
};
