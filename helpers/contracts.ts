import { BigNumber } from "@ethersproject/bignumber";

export function getHTokenName(maturity: BigNumber, prefix: string = "Hifi USDC"): string {
  const expirationDate: Date = new Date(maturity.toNumber() * 1000);
  const expirationDateFull: string = expirationDate.toISOString().slice(0, 10);
  return prefix + " (" + expirationDateFull + ")";
}

export function getHTokenSymbol(maturity: BigNumber, prefix: string = "hUSDC"): string {
  const expirationDate: Date = new Date(maturity.toNumber() * 1000);
  const expirationDateShort: string =
    expirationDate.toLocaleString("default", { year: "2-digit" }).toUpperCase() +
    expirationDate.toLocaleString("default", { month: "short" }).toUpperCase();
  return prefix + expirationDateShort;
}
