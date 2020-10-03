import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";

/**
 * ADDRESSES
 */
export const AddressOne: string = "0x0000000000000000000000000000000000000001";

/**
 * Numbers
 */
export const BuidlerEvmChainId: BigNumber = BigNumber.from(31337);
export const DefaultBlockGasLimit: BigNumber = BigNumber.from("10000000");
export const DefaultNumberOfDecimals: BigNumber = BigNumber.from(18);
export const UnitsPerToken: BigNumber = BigNumber.from("1000000000000000000");

export const OnePercentMantissa: BigNumber = BigNumber.from("10000000000000000");
export const OneHundredPercentMantissa: BigNumber = OnePercentMantissa.mul(100);
export const OneHundredAndFiftyPercentMantissa: BigNumber = OnePercentMantissa.mul(150);
export const OneThousandPercentMantissa: BigNumber = OnePercentMantissa.mul(1000);
export const TenThousandPercentMantissa: BigNumber = OnePercentMantissa.mul(10000);

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

export const Erc20PermitConstants = {
  decimals: BigNumber.from(18),
  name: "Erc20 Permit",
  symbol: "ERC20",
};

export const FintrollerConstants = {
  CollateralizationRatioLowerBoundMantissa: OneHundredPercentMantissa,
  CollateralizationRatioUpperBoundMantissa: TenThousandPercentMantissa,
  DefaultCollateralizationRatioMantissa: OneHundredAndFiftyPercentMantissa,
  OraclePrecisionScalar: BigNumber.from("1000000000000"),
};

export const YTokenConstants = {
  /* TODO: find a way to make this a runtime-generated constant */
  DefaultExpirationTime: BigNumber.from(1609459199) /* December 31, 2020 at 23:59:59 */,
};
