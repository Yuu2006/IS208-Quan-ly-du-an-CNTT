import { Prisma } from "../generated/prisma/client.ts";

export function jsonSafe<T>(value: T): T {
  return JSON.parse(
    JSON.stringify(value, (_key, currentValue) => {
      if (typeof currentValue === "bigint") {
        return currentValue.toString();
      }

      if (currentValue instanceof Prisma.Decimal) {
        return currentValue.toString();
      }

      return currentValue;
    }),
  ) as T;
}
