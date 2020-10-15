import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";

/**
 * ADDRESSES
 */
export const AddressOne: string = "0x0000000000000000000000000000000000000001";

/**
 * AMOUNTS
 */

export const Ten: BigNumber = BigNumber.from(10);
export const DefaultBlockGasLimit: BigNumber = Ten.pow(8);
export const DefaultNumberOfDecimals: BigNumber = BigNumber.from(18);
export const PrecisionScalarForTokenWithSixDecimals: BigNumber = Ten.pow(DefaultNumberOfDecimals.sub(6));

/* Represented as mantissas, decimal scalars with 18 decimals. */
export const Percentages: { [name: string]: BigNumber } = {
  One: Ten.pow(16),
  OneHundred: Ten.pow(18),
  OneHundredAndTen: Ten.pow(18).add(Ten.pow(17)),
  OneHundredAndTwenty: Ten.pow(18).add(Ten.pow(17).mul(2)),
  OneHundredAndFifty: Ten.pow(18).add(Ten.pow(17).mul(5)),
  OneThousand: Ten.pow(19),
  TenThousand: Ten.pow(20),
};

export const TokenAmounts: { [name: string]: BigNumber } = {
  PointFiftyFive: Ten.pow(17).mul(5).add(Ten.pow(16).mul(5)),
  One: Ten.pow(18),
  Ten: Ten.pow(19),
  Fifty: Ten.pow(18).mul(50),
  OneHundred: Ten.pow(20),
  OneThousand: Ten.pow(21),
  OneMillion: Ten.pow(24),
};

/**
 * CHAIN IDs
 */
export const ChainIds = {
  BuidlerEvm: 31337,
  Ganache: 1337,
  Goerli: 5,
  Kovan: 42,
  Mainnet: 1,
  Rinkeby: 4,
  Ropsten: 3,
};

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
    Debt: Zero,
    FreeCollateral: Zero,
    LockedCollateral: Zero,
    IsOpen: true,
  },
};

export const FintrollerConstants = {
  CollateralizationRatioLowerBoundMantissa: Percentages.OneHundred,
  CollateralizationRatioUpperBoundMantissa: Percentages.TenThousand,
  DefaultBond: {
    CollateralizationRatio: Percentages.OneHundredAndFifty,
    DebtCeiling: Zero,
    IsBorrowAllowed: true,
    IsDepositCollateralAllowed: true,
    IsLiquidateBorrowAllowed: true,
    IsListed: true,
    IssRedeemUnderlyingAllowed: true,
    IsRepayBorrowAllowed: true,
    IsSupplyUnderlyingAllowed: true,
  },
  LiquidationIncentiveLowerBoundMantissa: Percentages.OneHundred,
  LiquidationIncentiveUpperBoundMantissa: Percentages.OneHundredAndFifty,
  OraclePrecisionScalar: Ten.pow(12),
};

export const YTokenConstants = {
  /* TODO: make this relative to the time at which the tests are run. */
  DefaultExpirationTime: BigNumber.from(1609459199) /* December 31, 2020 at 23:59:59 */,
};
