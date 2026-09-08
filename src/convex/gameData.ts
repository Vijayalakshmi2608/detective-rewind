import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getCase = query({
  args: { caseId: v.string() },
  handler: async (ctx, args) => {
    return cases[args.caseId] ?? null;
  },
});

export const getAllCases = query({
  args: {},
  handler: async () => {
    return Object.values(cases);
  },
});

export const getProgress = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const progress = await ctx.db
      .query("player_progress")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    return progress;
  },
});

export const startCase = mutation({
  args: { userId: v.id("users"), caseId: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("player_progress")
      .withIndex("by_user_case", (q) =>
        q.eq("userId", args.userId).eq("caseId", args.caseId),
      )
      .first();
    if (existing) return existing._id;

    return await ctx.db.insert("player_progress", {
      userId: args.userId,
      caseId: args.caseId,
      currentScene: 0,
      cluesFound: [],
      score: 0,
      completed: false,
      startedAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const advanceScene = mutation({
  args: {
    progressId: v.id("player_progress"),
    sceneIndex: v.number(),
    clueId: v.optional(v.string()),
    scoreAdd: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const progress = await ctx.db.get(args.progressId);
    if (!progress) throw new Error("Progress not found");

    const cluesFound = args.clueId && !progress.cluesFound.includes(args.clueId)
      ? [...progress.cluesFound, args.clueId]
      : progress.cluesFound;

    await ctx.db.patch(args.progressId, {
      currentScene: args.sceneIndex,
      cluesFound,
      score: progress.score + (args.scoreAdd ?? 0),
      updatedAt: Date.now(),
    });
  },
});

export const completeCase = mutation({
  args: { progressId: v.id("player_progress") },
  handler: async (ctx, args) => {
    const progress = await ctx.db.get(args.progressId);
    if (!progress) throw new Error("Progress not found");

    await ctx.db.patch(args.progressId, {
      completed: true,
      updatedAt: Date.now(),
    });

    const user = await ctx.db.get(progress.userId);
    if (user) {
      await ctx.db.patch(progress.userId, {
        totalCluesFound: (user.totalCluesFound ?? 0) + progress.cluesFound.length,
        casesSolved: (user.casesSolved ?? 0) + 1,
      });
    }
  },
});

export const logVocabulary = mutation({
  args: {
    userId: v.id("users"),
    word: v.string(),
    definition: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("vocabulary_log")
      .withIndex("by_user_word", (q) =>
        q.eq("userId", args.userId).eq("word", args.word),
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        timesSeen: existing.timesSeen + 1,
        mastered: existing.timesSeen + 1 >= 3,
        lastSeenAt: Date.now(),
      });
    } else {
      await ctx.db.insert("vocabulary_log", {
        userId: args.userId,
        word: args.word,
        definition: args.definition,
        timesSeen: 1,
        mastered: false,
        lastSeenAt: Date.now(),
      });
    }
  },
});

export const getVocabulary = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("vocabulary_log")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

// ─── Case Content ───────────────────────────────────────────────

export type SceneType = {
  id: string;
  title: string;
  location: string;
  locationIcon: string;
  passage: string;
  witnessName: string | null;
  witnessRole: string | null;
  witnessStatement: string;
  question: string;
  options: { id: string; text: string; correct: boolean; feedback: string }[];
  clueUnlocked?: { id: string; name: string; description: string; icon: string };
  vocabulary: { word: string; definition: string }[];
};

export type CaseType = {
  id: string;
  title: string;
  subtitle: string;
  location: string;
  difficulty: "Easy" | "Medium" | "Hard";
  icon: string;
  suspectCount: number;
  totalClues: number;
  description: string;
  suspects: { name: string; role: string; icon: string; description: string }[];
  scenes: SceneType[];
};

export const cases: Record<string, CaseType> = {
  "midnight-library": {
    id: "midnight-library",
    title: "The Midnight Library",
    subtitle: "Books are vanishing — and someone is leaving notes behind.",
    location: "Maplewood Public Library",
    difficulty: "Easy",
    icon: "📚",
    suspectCount: 3,
    totalClues: 4,
    description:
      "Three rare books have disappeared from the locked special collections room. The librarian found a strange bookmark with a riddle. Can you read the clues and solve the mystery?",
    suspects: [
      {
        name: "Ms. Finch",
        role: "Head Librarian",
        icon: "👩‍🏫",
        description: "She noticed the books were missing this morning.",
      },
      {
        name: "Theo",
        role: "Student Volunteer",
        icon: "🧒",
        description: "He shelved books in the special collection yesterday.",
      },
      {
        name: "Mr. Dalton",
        role: "Security Guard",
        icon: "👮",
        description: "He was on duty the night the books disappeared.",
      },
    ],
    scenes: [
      {
        id: "scene-1",
        title: "The Discovery",
        location: "Special Collections Room",
        locationIcon: "📖",
        passage:
          "Ms. Finch led you to the special collections room. The glass case that held three rare first editions was empty. 'They were here when I locked up last night,' she said, adjusting her glasses. 'But look — someone left this.' She held up a leather bookmark with gold lettering: 'Reading between the lines reveals the truth.'",
        witnessName: "Ms. Finch",
        witnessRole: "Head Librarian",
        witnessStatement:
          "I locked this room myself at 6 PM. Only three people have keys: me, Theo the volunteer, and Mr. Dalton.",
        question:
          "Based on Ms. Finch's statement, who had the ability to access the locked room?",
        options: [
          {
            id: "a",
            text: "Only Ms. Finch and Theo",
            correct: false,
            feedback: "Ms. Finch said three people have keys, not two.",
          },
          {
            id: "b",
            text: "Ms. Finch, Theo, and Mr. Dalton",
            correct: true,
            feedback:
              "Exactly! Three people have keys to the special collections room.",
          },
          {
            id: "c",
            text: "Anyone in the library",
            correct: false,
            feedback:
              "The room was locked — only keyholders could get in.",
          },
        ],
        clueUnlocked: {
          id: "clue-1",
          name: "The Keyholder List",
          description:
            "Only three people have keys: Ms. Finch, Theo, and Mr. Dalton.",
          icon: "🔑",
        },
        vocabulary: [
          {
            word: "collections",
            definition: "A group of valuable items kept together, like rare books.",
          },
          {
            word: "first edition",
            definition: "The very first printing of a book — often rare and valuable.",
          },
        ],
      },
      {
        id: "scene-2",
        title: "The Bookmark Riddle",
        location: "Reading Nook",
        locationIcon: "🪑",
        passage:
          "You sat down to examine the bookmark more closely. On the back, someone had written in careful handwriting: 'Page 42 holds a secret. The answer lies where stories sleep.' You pulled a dusty atlas from the shelf — page 42 showed a map of the library itself. Three small X marks were drawn in different rooms.",
        witnessName: "Theo",
        witnessRole: "Student Volunteer",
        witnessStatement:
          "I helped organize the atlas section yesterday afternoon. But I swear I never touched the special collections. Mr. Dalton asked me where the atlas was, though — he seemed really interested in the library layout.",
        question:
          "What does Theo's statement suggest about Mr. Dalton's knowledge of the library?",
        options: [
          {
            id: "a",
            text: "Mr. Dalton wanted to learn the library layout for security purposes",
            correct: false,
            feedback:
              "Security guards already know the library layout — that's their job.",
          },
          {
            id: "b",
            text: "Mr. Dalton was interested in the library's floor plan for an unknown reason",
            correct: true,
            feedback:
              "Good thinking! A security guard asking about the layout is unusual and worth investigating.",
          },
          {
            id: "c",
            text: "Mr. Dalton was simply being friendly",
            correct: false,
            feedback:
              "While possible, this doesn't explain why he specifically asked about the atlas.",
          },
        ],
        clueUnlocked: {
          id: "clue-2",
          name: "The Atlas Connection",
          description:
            "Mr. Dalton asked about the library layout — unusual for a security guard.",
          icon: "🗺️",
        },
        vocabulary: [
          {
            word: "atlas",
            definition: "A book of maps or charts.",
          },
          {
            word: "investigate",
            definition: "To carefully examine or research something to find the truth.",
          },
        ],
      },
      {
        id: "scene-3",
        title: "The Security Footage",
        location: "Security Office",
        locationIcon: "📹",
        passage:
          "Mr. Dalton's security office had a wall of monitors. 'I'll show you last night's footage,' he said, pulling up a recording. The timestamp read 11:47 PM. A shadow moved through the special collections room. But something was wrong — the clock on the wall in the footage showed 3:15, and the timestamp didn't match.",
        witnessName: "Mr. Dalton",
        witnessRole: "Security Guard",
        witnessStatement:
          "See? Nobody was in there. The system must have glitched. Look, the timestamp jumps around all the time. Nothing to worry about.",
        question:
          "The footage timestamp says 11:47 PM, but the clock in the video shows 3:15. What does this discrepancy suggest?",
        options: [
          {
            id: "a",
            text: "The security system has a minor software bug",
            correct: false,
            feedback:
              "A timestamp being off by over 3 hours isn't a minor bug — it's suspicious.",
          },
          {
            id: "b",
            text: "The footage may have been edited or replaced",
            correct: true,
            feedback:
              "Brilliant deduction! The time mismatch strongly suggests the footage was tampered with.",
          },
          {
            id: "c",
            text: "The wall clock is broken",
            correct: false,
            feedback:
              "While possible, the more logical explanation is that someone altered the recording.",
          },
        ],
        clueUnlocked: {
          id: "clue-3",
          name: "Tampered Footage",
          description:
            "The security footage timestamp doesn't match the clock — it may have been edited.",
          icon: "🎞️",
        },
        vocabulary: [
          {
            word: "discrepancy",
            definition: "A difference between things that should be the same.",
          },
          {
            word: "timestamp",
            definition: "A digital record of when something happened.",
          },
        ],
      },
      {
        id: "scene-4",
        title: "The Final Clue",
        location: "Janitor's Closet",
        locationIcon: "🧹",
        passage:
          "Behind a stack of cleaning supplies, you found it — three rare books wrapped in a security blanket, right next to Mr. Dalton's extra uniform. Tucked inside one book was a note: 'I was going to return them. I just needed to prove I could have sold them — it was a test for my true crime novel.'",      witnessName: "Detective",
      witnessRole: "You",
      witnessStatement: "You've pieced together the evidence. Time to make your final deduction.",
        question:
          "You've gathered all the evidence. Who took the books and why?",
        options: [
          {
            id: "a",
            text: "Theo took them to study rare book illustrations",
            correct: false,
            feedback:
              "Theo had no access to the locked room and the evidence points elsewhere.",
          },
          {
            id: "b",
            text: "Ms. Finch hid them to test the library's security",
            correct: false,
            feedback:
              "Ms. Finch reported the books missing — she wouldn't do that if she hid them.",
          },
          {
            id: "c",
            text: "Mr. Dalton took them as research for a novel he's writing",
            correct: true,
            feedback:
              "Case solved! Mr. Dalton used his security key, tampered with the footage, and hid the books as research for his true crime novel.",
          },
        ],
        clueUnlocked: {
          id: "clue-4",
          name: "The Hidden Books",
          description:
            "The missing books were found in the janitor's closet with a confession note.",
          icon: "📕",
        },
        vocabulary: [
          {
            word: "evidence",
            definition: "Facts or information that help prove something is true.",
          },
          {
            word: "deduction",
            definition: "Reaching a conclusion by reasoning from what you know.",
          },
        ],
      },
    ],
  },
};
