/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { all, create } from "mathjs";

const config = {
  number: "BigNumber",
  precision: 79,
};

const math = create(all, config)!;
const mbn = math.bignumber!;

export { mbn };
