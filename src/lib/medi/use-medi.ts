import { useEffect, useState } from "react";
import { mediEngine } from "./engine";

export function useMedi() {
  const [, setTick] = useState(0);
  useEffect(() => mediEngine.subscribe(() => setTick((n) => n + 1)), []);
  return mediEngine;
}
