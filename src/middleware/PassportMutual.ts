import {
  AgingCacheReplacementPolicy,
  AgingCacheWriteMode,
  createAgingCache,
  JsonSerializer,
  MemoryStorageProvider,
  StorageHierarchy,
  StringSerializer,
} from "@linkedmink/multilevel-aging-cache";
import {
  challengeByBase64Body,
  MutualKeyChallengeOptions,
  MutualKeyChallengeStrategy,
  Types,
} from "@linkedmink/passport-mutual-key-challenge";
import { IncomingMessage } from "http";
import { PassportStatic } from "passport";
import { RedisChallengeCache } from "../data/RedisChallengeCache";
import { config } from "../infastructure/Config";
import { ConfigKey } from "../infastructure/ConfigKey";
import { createRedisStorageProvider } from "../infastructure/Redis";
import { IdentityType, IPublicKeyIdentity } from "../models/database/Identity";
import { IUser, User } from "../models/database/User";

export const PASSPORT_MUTUAL_STRATEGY = "mutual";

const getDistributedChallengeCache = () => {
  const memoryProvider = new MemoryStorageProvider<string, Types.CachedChallenge>();
  const redisProvider = createRedisStorageProvider<string, Types.CachedChallenge>(
    "challenges",
    new JsonSerializer(),
    new StringSerializer(),
    `${config.getString(ConfigKey.RedisKeyPrefix)}.challenges.publish`
  );

  const expiresMinutes = config.getNumber(ConfigKey.ChallengeExpiresInMinutes);
  const agingCache = createAgingCache(new StorageHierarchy([memoryProvider, redisProvider]), {
    maxEntries: undefined,
    ageLimit: expiresMinutes,
    purgeInterval: 30,
    replacementPolicy: AgingCacheReplacementPolicy.FIFO,
    setMode: AgingCacheWriteMode.OverwriteAlways,
    deleteMode: AgingCacheWriteMode.OverwriteAlways,
    evictAtLevel: undefined,
  });

  return new RedisChallengeCache(agingCache, expiresMinutes * 1000);
};

const getUser = async (
  req: IncomingMessage,
  userId: string
): Promise<Types.UserKeyRecord<IUser> | null> => {
  const user = await User.findById(userId).exec();
  const identity = user?.identities?.find(i => i.type === IdentityType.PublicKey) as
    | IPublicKeyIdentity
    | undefined;

  if (!user || !identity) {
    return null;
  }

  return { user, publicKey: identity.publicKey };
};

export const addMutualStrategy = (passport: PassportStatic): void => {
  const options: MutualKeyChallengeOptions = {
    serverKey: config.getFileBuffer(ConfigKey.JwtSecretKeyFile),
    userFunc: getUser,
    challengeOrResponseFunc: challengeByBase64Body("userId", "challenge", "response"),
    challengeCache: getDistributedChallengeCache(),
  };

  passport.use(PASSPORT_MUTUAL_STRATEGY, new MutualKeyChallengeStrategy(options));
};
