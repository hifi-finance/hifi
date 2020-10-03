import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";

/**
 * ADDRESSES
 */
export const AddressOne: string = "0x0000000000000000000000000000000000000001";

/**
 * NUMBERS
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
 * PRIVATE KEYS
 */
export const DefaultPrivateKeys = {
  Admin: "0x907eb204083c9b1c24fdfc26bb120a8713fcc3323edf1b8423a2ad58d0fbaeb8",
  Brad: "0xd0792a518700b34f3cf29d533f1d8bb81262eabca4f1817212a5044ee866c3a6",
  Eve: "0xc0152f90ad35f85568c66192307be596aaa3431cb23dda6d99e7393b959b0930",
  Grace: "0x2630b870626d4f8d344cb7a3eb9f775a66b19a8a00779a30bb401739a4c9ec6b",
  Lucy: "0x6a9bff3d641bc1311f1f67d58440c76acaa81a273d287aeb6af96950ad59df65",
  Mark: "0x638b667580ca2334d72ed39f20c802b7a07cd0614a9a43c64f91d8058cfe884b",
};

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
