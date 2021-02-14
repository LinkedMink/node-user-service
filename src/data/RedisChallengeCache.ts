import { IAgingCache } from "@linkedmink/multilevel-aging-cache";
import { Types } from "@linkedmink/passport-mutual-key-challenge";

export class RedisChallengeCache implements Types.ChallengeCache {
  constructor(
    private readonly agingCache: IAgingCache<string, Types.CachedChallenge>,
    private readonly ttlMs = 120000
  ) {}

  async get(key: string): Promise<Types.CachedChallenge | null> {
    const challenge = await this.agingCache.get(key);
    if (!challenge) {
      return null;
    }

    await this.agingCache.delete(key);
    if (Date.now() - challenge.requestDateTime.getTime() > this.ttlMs) {
      return null;
    }

    return challenge;
  }

  set(key: string, value: Types.CachedChallenge): Promise<void> {
    return this.agingCache.set(key, value).then();
  }
}
