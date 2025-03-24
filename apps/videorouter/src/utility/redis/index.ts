import { configuration } from "../../configuration/index.js";
import { Redis } from "ioredis";

const REDIS_CHANNEL_PREFIX = configuration.redis.prefix;
const CHANNEL_ROOM_CREATE = `${REDIS_CHANNEL_PREFIX}room:create`;
const CHANNEL_ROOM_CLOSE = `${REDIS_CHANNEL_PREFIX}room:close`;
const CHANNEL_PEER_JOIN = `${REDIS_CHANNEL_PREFIX}peer:join`;
const CHANNEL_PEER_LEAVE = `${REDIS_CHANNEL_PREFIX}peer:leave`;
const CHANNEL_PRODUCER_ADD = `${REDIS_CHANNEL_PREFIX}producer:add`;
const CHANNEL_PRODUCER_REMOVE = `${REDIS_CHANNEL_PREFIX}producer:remove`;

const redisClient = new Redis(configuration.redis);
const redisSub = new Redis(configuration.redis);
const redisPublisher = new Redis(configuration.redis);

export {
  REDIS_CHANNEL_PREFIX,
  CHANNEL_PEER_JOIN,
  CHANNEL_ROOM_CREATE,
  CHANNEL_ROOM_CLOSE,
  CHANNEL_PEER_LEAVE,
  CHANNEL_PRODUCER_ADD,
  CHANNEL_PRODUCER_REMOVE,
  redisClient,
  redisSub,
  redisPublisher,
};
