/* eslint-disable @typescript-eslint/no-explicit-any */
import winston from "winston";
import Transport from "winston-transport";
import { Logger } from "../../src/lib/infrastructure/Logger.mjs";

export class MockTransport extends Transport {
  private callsValue: any[] = [];
  get calls(): any[] {
    return this.callsValue;
  }

  constructor(opts: Transport.TransportStreamOptions) {
    super(opts);
  }

  reset(): void {
    this.callsValue = [];
  }

  log(info: any, next: () => void): void {
    this.callsValue.push(info);
    next();
  }
}

export const setGlobalMockTransport = (): Transport => {
  const transport = new MockTransport({
    format: winston.format.simple(),
  });

  Logger.optionsFunc = (_label: string) => ({
    transports: [transport],
  });

  return transport;
};
