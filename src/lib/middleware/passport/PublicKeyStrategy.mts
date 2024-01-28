import { IncomingMessage } from "node:http";
import { Strategy } from "passport-strategy";

export const PASSPORT_PUBLIC_KEY_STRATEGY = "publicKey";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface PublicKeyPassportOptions {}

export class PublicKeyPassportStrategy extends Strategy {
  readonly options;

  constructor(options: PublicKeyPassportOptions) {
    super();
    this.options = options;
  }

  authenticate(_req: IncomingMessage, _options?: PublicKeyPassportOptions): Promise<void> {
    return Promise.resolve();
  }
}
