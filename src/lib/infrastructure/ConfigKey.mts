export enum ConfigKey {
  AppName = "APP_NAME",
  AllowedOrigins = "ALLOWED_ORIGINS",
  EnableCompression = "ENABLE_COMPRESSION",
  ListenPort = "LISTEN_PORT",
  LogFile = "LOG_FILE",
  LogLevel = "LOG_LEVEL",

  JwtAudience = "JWT_AUDIENCE",
  JwtExpirationDays = "JWT_EXPIRATION_DAYS",
  JwtIssuer = "JWT_ISSUER",
  JwtSecretKeyFile = "JWT_SECRET_KEY_FILE",
  JwtSigningAlgorithm = "JWT_SIGNING_ALGORITHM",
  ChallengeExpiresInMinutes = "CHALLENGE_EXPIRES_IN_MINUTES",

  MongoDbConnectionString = "MONGO_DB_CONNECTION_STRING",
  RedisMode = "REDIS_MODE",
  RedisHosts = "REDIS_HOSTS",
  RedisKeyPrefix = "REDIS_KEY_PREFIX",

  UserRegistrationIsEnabled = "USER_REGISTRATION_IS_ENABLED",
  UserDefaultClaims = "USER_DEFAULT_CLAIMS",
  UserPassHashCostFactor = "USER_PASS_HASH_COST_FACTOR",
  UserPassMinLength = "USER_PASS_MIN_LENGTH",
  UserPassMaxAttempts = "USER_PASS_MAX_ATTEMPTS",
  UserLockoutMinutes = "USER_LOCKOUT_MINUTES",
  UserTemporaryKeyMinutes = "USER_TEMPORARY_KEY_MINUTES",

  SystemEmailAddress = "SYSTEM_EMAIL_ADDRESS",
  NodeMailerTransport = "NODE_MAILER_TRANSPORT",
  PasswordResetUiUrl = "PASSWORD_RESET_UI_URL",
  ServiceBaseUrl = "SERVICE_BASE_URL",
}

export const configDefaultMap: Map<ConfigKey, string | undefined> = new Map([
  [ConfigKey.AppName, "LinkedMink"],
  [ConfigKey.AllowedOrigins, "*"],
  [ConfigKey.EnableCompression, String(true)],
  [ConfigKey.ListenPort, "8080"],
  [ConfigKey.LogFile, "combined.log"],
  [ConfigKey.LogLevel, "info"],

  [ConfigKey.JwtExpirationDays, String(30)],
  [ConfigKey.JwtSigningAlgorithm, "RS256"],
  [ConfigKey.ChallengeExpiresInMinutes, String(2)],

  [ConfigKey.RedisMode, "Single"],
  [ConfigKey.RedisHosts, JSON.stringify({ host: "localhost", port: 6379 })],
  [ConfigKey.RedisKeyPrefix, "nus"],

  [ConfigKey.UserRegistrationIsEnabled, "true"],
  [ConfigKey.UserDefaultClaims, ""],
  [ConfigKey.UserPassHashCostFactor, String(10)],
  [ConfigKey.UserPassMinLength, String(8)],
  [ConfigKey.UserPassMaxAttempts, String(5)],
  [ConfigKey.UserLockoutMinutes, String(5)],
  [ConfigKey.UserTemporaryKeyMinutes, String(120)],

  [ConfigKey.SystemEmailAddress, "noreply@linkedmink.space"],
  [ConfigKey.NodeMailerTransport, ""],
  [ConfigKey.PasswordResetUiUrl, "http://localhost/passwordReset"],
  [ConfigKey.ServiceBaseUrl, "http://localhost:8080"],
]);
