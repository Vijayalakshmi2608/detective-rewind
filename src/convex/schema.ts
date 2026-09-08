import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
);
export type Role = Infer<typeof roleValidator>;

const schema = defineSchema(
  {
    ...authTables,

    users: defineTable({
      name: v.optional(v.string()),
      image: v.optional(v.string()),
      email: v.optional(v.string()),
      emailVerificationTime: v.optional(v.number()),
      isAnonymous: v.optional(v.boolean()),
      role: v.optional(roleValidator),
      detectiveRank: v.optional(v.string()),
      totalCluesFound: v.optional(v.number()),
      casesSolved: v.optional(v.number()),
    }).index("email", ["email"]),

    player_progress: defineTable({
      userId: v.id("users"),
      caseId: v.string(),
      currentScene: v.number(),
      cluesFound: v.array(v.string()),
      score: v.number(),
      completed: v.boolean(),
      startedAt: v.number(),
      updatedAt: v.number(),
    }).index("by_user", ["userId"])
      .index("by_user_case", ["userId", "caseId"]),

    vocabulary_log: defineTable({
      userId: v.id("users"),
      word: v.string(),
      definition: v.string(),
      timesSeen: v.number(),
      mastered: v.boolean(),
      lastSeenAt: v.number(),
    }).index("by_user", ["userId"])
      .index("by_user_word", ["userId", "word"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;
