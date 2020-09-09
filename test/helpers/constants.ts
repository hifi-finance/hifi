import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";

/**
 * ADDRESSES
 */
export const AddressOne: string = "0x0000000000000000000000000000000000000001";

/**
 * AMOUNTS
 */
export const DefaultBlockGasLimit: BigNumber = BigNumber.from("10000000");
export const UnitsPerToken: BigNumber = BigNumber.from("1000000000000000000");

export const OneDollar: BigNumber = UnitsPerToken;
export const OneHundredDollars: BigNumber = OneDollar.mul(100);
export const OneThousandDollars: BigNumber = OneDollar.mul(1000);

export const OnePercent: BigNumber = BigNumber.from("10000000000000000");
export const OneHundredPercent: BigNumber = OnePercent.mul(100);
export const OneHundredAndFiftyPercent: BigNumber = OnePercent.mul(150);
export const TenThousandPercent: BigNumber = OnePercent.mul(10000);

export const OneToken: BigNumber = UnitsPerToken;
export const TenTokens: BigNumber = OneToken.mul(10);
export const OneHundredTokens: BigNumber = OneToken.mul(100);
export const OneThousandTokens: BigNumber = OneToken.mul(1000);
export const OneMillionTokens: BigNumber = OneToken.mul(1000000);

/**
 * CONTRACT-SPECIFIC CONSTANTS
 */
export const BalanceSheetConstants = {
  DefaultVault: {
    debt: Zero,
    freeCollateral: Zero,
    lockedCollateral: Zero,
    isOpen: true,
  },
};

export const FintrollerConstants = {
  CollateralizationRatioLowerBoundMantissa: OneHundredPercent,
  CollateralizationRatioUpperBoundMantissa: TenThousandPercent,
  DefaultCollateralizationRatioMantissa: OneHundredAndFiftyPercent,
};

export const YTokenConstants = {
  /* TODO: find a way to make this a runtime-generated constant */
  DefaultExpirationTime: BigNumber.from(1609459199) /* December 31, 2020 at 23:59:59 */,
};
