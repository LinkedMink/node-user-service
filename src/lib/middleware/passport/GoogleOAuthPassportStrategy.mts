import { OAuth2Client } from "google-auth-library";
import { IncomingMessage } from "node:http";
import { Strategy } from "passport-strategy";

export const PASSPORT_GOOGLE_OAUTH_STRATEGY = "googleOAuth";

export interface GoogleOAuthPassportOptions {
  clientId: string;
}

export class GoogleOAuthPassportError extends Error {}

export class GoogleOAuthPassportStrategy extends Strategy {
  readonly options: GoogleOAuthPassportOptions;
  private readonly oauthClient: OAuth2Client;

  constructor(options: GoogleOAuthPassportOptions) {
    super();
    this.options = options;
    this.oauthClient = new OAuth2Client(this.options.clientId);
  }

  async authenticate(req: IncomingMessage, options?: GoogleOAuthPassportOptions): Promise<void> {
    const idTokenHeader = req.headers.authorization;
    if (!idTokenHeader) {
      return this.pass();
    }

    const idToken = idTokenHeader.substring("Bearer ".length);
    const client = options ? new OAuth2Client(options.clientId) : this.oauthClient;

    try {
      const result = await client.verifyIdToken({ idToken });
      if (result.getUserId()) {
        this.success(result);
      } else {
        this.fail(401);
      }
    } catch (_e) {
      this.fail(401);
    }
  }
}
