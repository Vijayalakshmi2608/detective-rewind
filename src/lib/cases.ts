import type { CaseType } from "./gameData";

// ─── Level-based case journey ─────────────────────────────────────
// Every case uses the same CaseType architecture (scenes, witnesses,
// questions, clues, vocabulary). Educational difficulty rises through
// FOCUS areas — not just wording — so Level 1 stays accessible and
// Level 5 combines every skill.

export type CaseLevel = {
  level: number;
  caseData: CaseType;
  focusLabel: string;
  focus: string[];
};

export const CASE_LEVELS: CaseLevel[] = [
  {
    level: 1,
    focusLabel: "Basics",
    focus: ["Literal comprehension", "Evidence finding", "Vocabulary in context"],
    caseData: {
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
        { name: "Ms. Finch", role: "Head Librarian", icon: "👩‍🏫", description: "She noticed the books were missing this morning." },
        { name: "Theo", role: "Student Volunteer", icon: "🧒", description: "He shelved books in the special collection yesterday." },
        { name: "Mr. Dalton", role: "Security Guard", icon: "👮", description: "He was on duty the night the books disappeared." },
      ],
      scenes: [
        {
          id: "scene-1",
          title: "The Discovery",
          location: "Special Collections Room",
          locationIcon: "📖",
          passage:
            "Ms. Finch led you to the special collections room. The glass case that held three rare first editions was empty. \"They were here when I locked up last night,\" she said, adjusting her glasses. \"But look — someone left this.\" She held up a leather bookmark with gold lettering: \"Reading between the lines reveals the truth.\"",
          witnessName: "Ms. Finch",
          witnessRole: "Head Librarian",
          witnessStatement:
            "I locked this room myself at 6 PM. Only three people have keys: me, Theo the volunteer, and Mr. Dalton.",
          question:
            "Based on Ms. Finch's statement, who had the ability to access the locked room?",
          options: [
            { id: "a", text: "Only Ms. Finch and Theo", correct: false, feedback: "Ms. Finch said three people have keys, not two." },
            { id: "b", text: "Ms. Finch, Theo, and Mr. Dalton", correct: true, feedback: "Exactly! Three people have keys to the special collections room." },
            { id: "c", text: "Anyone in the library", correct: false, feedback: "The room was locked — only keyholders could get in." },
          ],
          clueUnlocked: {
            id: "clue-1",
            name: "The Keyholder List",
            description: "Only three people have keys: Ms. Finch, Theo, and Mr. Dalton.",
            icon: "🔑",
          },
          vocabulary: [
            { word: "collections", definition: "A group of valuable items kept together, like rare books." },
            { word: "first edition", definition: "The very first printing of a book — often rare and valuable." },
          ],
        },
        {
          id: "scene-2",
          title: "The Bookmark Riddle",
          location: "Reading Nook",
          locationIcon: "🪑",
          passage:
            "You sat down to examine the bookmark more closely. On the back, someone had written in careful handwriting: \"Page 42 holds a secret. The answer lies where stories sleep.\" You pulled a dusty atlas from the shelf — page 42 showed a map of the library itself. Three small X marks were drawn in different rooms.",
          witnessName: "Theo",
          witnessRole: "Student Volunteer",
          witnessStatement:
            "I helped organize the atlas section yesterday afternoon. But I swear I never touched the special collections. Mr. Dalton asked me where the atlas was, though — he seemed really interested in the library layout.",
          question:
            "What does Theo's statement suggest about Mr. Dalton's knowledge of the library?",
          options: [
            { id: "a", text: "Mr. Dalton wanted to learn the library layout for security purposes", correct: false, feedback: "Security guards already know the library layout — that's their job." },
            { id: "b", text: "Mr. Dalton was interested in the library's floor plan for an unknown reason", correct: true, feedback: "Good thinking! A security guard asking about the layout is unusual and worth investigating." },
            { id: "c", text: "Mr. Dalton was simply being friendly", correct: false, feedback: "While possible, this doesn't explain why he specifically asked about the atlas." },
          ],
          clueUnlocked: {
            id: "clue-2",
            name: "The Atlas Connection",
            description: "Mr. Dalton asked about the library layout — unusual for a security guard.",
            icon: "🗺️",
          },
          vocabulary: [
            { word: "atlas", definition: "A book of maps or charts." },
            { word: "investigate", definition: "To carefully examine or research something to find the truth." },
          ],
        },
        {
          id: "scene-3",
          title: "The Security Footage",
          location: "Security Office",
          locationIcon: "📹",
          passage:
            "Mr. Dalton's security office had a wall of monitors. \"I'll show you last night's footage,\" he said, pulling up a recording. The timestamp read 11:47 PM. A shadow moved through the special collections room. But something was wrong — the clock on the wall in the footage showed 3:15, and the timestamp didn't match.",
          witnessName: "Mr. Dalton",
          witnessRole: "Security Guard",
          witnessStatement:
            "See? Nobody was in there. The system must have glitched. Look, the timestamp jumps around all the time. Nothing to worry about.",
          question:
            "The footage timestamp says 11:47 PM, but the clock in the video shows 3:15. What does this discrepancy suggest?",
          options: [
            { id: "a", text: "The security system has a minor software bug", correct: false, feedback: "A timestamp being off by over 3 hours isn't a minor bug — it's suspicious." },
            { id: "b", text: "The footage may have been edited or replaced", correct: true, feedback: "Brilliant deduction! The time mismatch strongly suggests the footage was tampered with." },
            { id: "c", text: "The wall clock is broken", correct: false, feedback: "While possible, the more logical explanation is that someone altered the recording." },
          ],
          clueUnlocked: {
            id: "clue-3",
            name: "Tampered Footage",
            description: "The security footage timestamp doesn't match the clock — it may have been edited.",
            icon: "🎞️",
          },
          vocabulary: [
            { word: "discrepancy", definition: "A difference between things that should be the same." },
            { word: "timestamp", definition: "A digital record of when something happened." },
          ],
        },
        {
          id: "scene-4",
          title: "The Final Clue",
          location: "Janitor's Closet",
          locationIcon: "🧹",
          passage:
            "Behind a stack of cleaning supplies, you found it — three rare books wrapped in a security blanket, right next to Mr. Dalton's extra uniform. Tucked inside one book was a note: \"I was going to return them. I just needed to prove I could have sold them — it was a test for my true crime novel.\"",
          witnessName: "Detective",
          witnessRole: "You",
          witnessStatement:
            "You've pieced together the evidence. Time to make your final deduction.",
          question: "You've gathered all the evidence. Who took the books and why?",
          options: [
            { id: "a", text: "Theo took them to study rare book illustrations", correct: false, feedback: "Theo had no access to the locked room and the evidence points elsewhere." },
            { id: "b", text: "Ms. Finch hid them to test the library's security", correct: false, feedback: "Ms. Finch reported the books missing — she wouldn't do that if she hid them." },
            { id: "c", text: "Mr. Dalton took them as research for a novel he's writing", correct: true, feedback: "Case solved! Mr. Dalton used his security key, tampered with the footage, and hid the books as research for his true crime novel." },
          ],
          clueUnlocked: {
            id: "clue-4",
            name: "The Hidden Books",
            description: "The missing books were found in the janitor's closet with a confession note.",
            icon: "📕",
          },
          vocabulary: [
            { word: "evidence", definition: "Facts or information that help prove something is true." },
            { word: "deduction", definition: "Reaching a conclusion by reasoning from what you know." },
          ],
        },
      ],
    },
  },
  {
    level: 2,
    focusLabel: "Causal Thinking",
    focus: ["Causal reasoning", "Evidence connection", "Prediction"],
    caseData: {
      id: "vanishing-painting",
      title: "The Vanishing Painting",
      subtitle: "A famous mural vanished overnight — but the wall says something strange.",
      location: "Hillside Community Center",
      difficulty: "Easy",
      icon: "🖼️",
      suspectCount: 3,
      totalClues: 4,
      description:
        "The community center's prize mural — painted by local kids — disappeared from the main hall wall overnight. There was no alarm, no broken glass. If you can figure out WHY each detail happened, you'll find the painting.",
      suspects: [
        { name: "Coach Rivera", role: "Center Director", icon: "🏅", description: "He opened the building this morning and found the wall bare." },
        { name: "Maya", role: "Muralist Student", icon: "🎨", description: "She painted part of the mural and visits every day." },
        { name: "Mr. Kowalski", role: "Building Manager", icon: "🔧", description: "He has keys to every room and controls the alarm system." },
      ],
      scenes: [
        {
          id: "scene-1",
          title: "The Bare Wall",
          location: "Main Hall",
          locationIcon: "🏛️",
          passage:
            "The main hall smelled faintly of paint. Where the mural should have been, there was only a clean rectangle of unfaded wall — and four small holes where bolts used to hold the frame. Coach Rivera stared at it. \"The alarm never went off,\" he said quietly. \"Whoever took it didn't break in. They walked in.\"",
          witnessName: "Coach Rivera",
          witnessRole: "Center Director",
          witnessStatement:
            "I locked the hall at 9 last night and the mural was still there. This morning the door was locked from the inside — with my key. Only me and Mr. Kowalski have keys to this hall.",
          question:
            "The door was still locked and the alarm never sounded. What does this tell you?",
          options: [
            { id: "a", text: "A stranger must have picked the lock", correct: false, feedback: "There were no scratch marks, and the door was locked from the inside with a key." },
            { id: "b", text: "Someone with a key took it, and the alarm was likely off or disarmed", correct: true, feedback: "Exactly! No break-in, no alarm — someone who belongs here walked right in." },
            { id: "c", text: "The mural was never on the wall at all", correct: false, feedback: "The unfaded rectangle and bolt holes prove it hung there for years." },
          ],
          clueUnlocked: {
            id: "clue-1",
            name: "No Forced Entry",
            description: "The thief had a key and knew the alarm schedule — this was an inside job.",
            icon: "🚪",
          },
          vocabulary: [
            { word: "mural", definition: "A large painting made directly on a wall." },
            { word: "disarmed", definition: "Turned off, like an alarm system." },
          ],
        },
        {
          id: "scene-2",
          title: "The Paint Smudge",
          location: "Art Room",
          locationIcon: "🎨",
          passage:
            "In the art room, you found something odd: a roller tray in the sink, still damp, with a swirl of wall paint — the exact blue of the mural's sky. Maya's apron hung on its hook. On the table lay a half-finished sketch of the mural, with fresh corrections in pencil around the edges.",
          witnessName: "Maya",
          witnessRole: "Muralist Student",
          witnessStatement:
            "Yes, I stayed late yesterday — I was fixing the sky. The blue looked flat in the afternoon light, so I mixed a new batch and tried it on a practice board. I left around 8:30, right before Coach locked up. I didn't see anyone.",
          question:
            "Why is the damp roller in the sink an important clue?",
          options: [
            { id: "a", text: "It proves Maya stole the mural", correct: false, feedback: "Maya has an honest reason for the paint — she told you before you found the roller." },
            { id: "b", text: "The thief touched the mural recently enough to leave fresh paint traces", correct: true, feedback: "Right! Fresh paint means the mural was handled recently — it didn't just fall apart." },
            { id: "c", text: "It means the mural was never painted properly", correct: false, feedback: "The sketch corrections show normal art work, not a problem with the mural." },
          ],
          clueUnlocked: {
            id: "clue-2",
            name: "Fresh Paint Traces",
            description: "Fresh mural-blue paint in the sink proves the mural was handled that night.",
            icon: "🖌️",
          },
          vocabulary: [
            { word: "practice board", definition: "A spare surface artists test paint on before the real work." },
            { word: "batch", definition: "An amount of something made at one time, like mixed paint." },
          ],
        },
        {
          id: "scene-3",
          title: "The Work Order",
          location: "Manager's Office",
          locationIcon: "📋",
          passage:
            "Mr. Kowalski's office had a corkboard of work orders. Most were about leaky faucets and light bulbs. But one, dated yesterday, stood out: \"REQUEST: remove and store all artwork from Main Hall for renovation prep. Approved — pending.\" The word pending was underlined twice, and there was no company name on the form.",
          witnessName: "Mr. Kowalski",
          witnessRole: "Building Manager",
          witnessStatement:
            "Sure I got a removal request. Renovation company sent it over. I was going to handle it next week — nothing to do with last night. I was home by eight, my wife will tell you.",
          question:
            "The work order has no company name and is only 'pending' approval. What does this suggest?",
          options: [
            { id: "a", text: "The renovation company made a paperwork mistake", correct: false, feedback: "Real companies sign their work orders — and no renovation was scheduled this week." },
            { id: "b", text: "Someone may have written a fake work order to make the removal look official", correct: true, feedback: "Sharp eye! A fake order could be a trick to move the mural 'for safekeeping'." },
            { id: "c", text: "Pending approval means it was already done", correct: false, feedback: "Pending means waiting — not approved, not done." },
          ],
          clueUnlocked: {
            id: "clue-3",
            name: "The Suspicious Order",
            description: "A work order with no company name — possibly forged to cover the theft.",
            icon: "📄",
          },
          vocabulary: [
            { word: "work order", definition: "A written instruction for a job that needs to be done." },
            { word: "pending", definition: "Waiting to be finished or decided." },
          ],
        },
        {
          id: "scene-4",
          title: "The Storage Room",
          location: "Basement Storage",
          locationIcon: "📦",
          passage:
            "The basement storage room smelled like old cardboard. Behind a stack of folding chairs, wrapped in a moving blanket, stood the mural — unharmed. Stuck to the frame was a sticky note in tidy handwriting: \"Kept safe for renovation. Will return when approved.\" Next to it sat a fresh copy of the same unsigned work order.",
          witnessName: "Detective",
          witnessRole: "You",
          witnessStatement:
            "The mural is safe. Now connect the clues and name the person who took it — and why.",
          question:
            "Who took the mural, and what was their real reason?",
          options: [
            { id: "a", text: "Maya took it to repaint it in private", correct: false, feedback: "Maya only fixed the sky on a practice board — the mural was intact under the blanket." },
            { id: "b", text: "Coach Rivera hid his own mural", correct: false, feedback: "Coach reported the theft and was shocked — the fake order is not his." },
            { id: "c", text: "Mr. Kowalski took it using a fake work order, claiming it was 'for safekeeping'", correct: true, feedback: "Case solved! Kowalski forged the order, used his key, and 'stored' the mural — but the unsigned paperwork gave him away." },
          ],
          clueUnlocked: {
            id: "clue-4",
            name: "The Safekeeping Note",
            description: "The thief's own note — 'kept safe for renovation' — proves he acted alone and knew the fake order.",
            icon: "🖼️",
          },
          vocabulary: [
            { word: "renovation", definition: "Repairing or improving a building." },
            { word: "forged", definition: "Faked or copied illegally to look real." },
          ],
        },
      ],
    },
  },
  {
    level: 3,
    focusLabel: "Deeper Thinking",
    focus: ["Multi-step inference", "Character motivation", "Advanced vocabulary"],
    caseData: {
      id: "clockwork-secret",
      title: "The Clockwork Secret",
      subtitle: "The town's oldest clock stopped at a very specific minute.",
      location: "Old Town Hall",
      difficulty: "Medium",
      icon: "🕰️",
      suspectCount: 3,
      totalClues: 4,
      description:
        "The百年 clock above Town Hall stopped for the first time in 90 years — at exactly 4:37. Inside, a small brass gear is missing. Why would someone stop a clock that everyone loves? Follow the motives.",
      suspects: [
        { name: "Grandpa Ito", role: "Clock Warden", icon: "👴", description: "He has wound the clock every Sunday for 40 years." },
        { name: "Elena", role: "History Club President", icon: "📚", description: "She researches the clock's history for a school project." },
        { name: "Victor", role: "Antiques Dealer", icon: "🎩", description: "He recently offered to 'restore' the clock tower for free." },
      ],
      scenes: [
        {
          id: "scene-1",
          title: "A Stopped Heart",
          location: "Clock Tower Base",
          locationIcon: "🗼",
          passage:
            "The clock tower's door hung open. Inside, the great gears were silent. Grandpa Ito knelt beside the mechanism, his face pale. In his palm sat one small brass gear, snapped cleanly from its pivot. \"I wound it Sunday, like always,\" he said. \"This gear didn't wear out. Someone pried it loose with a tool.\"",
          witnessName: "Grandpa Ito",
          witnessRole: "Clock Warden",
          witnessStatement:
            "Forty years I've cared for this clock. The mechanism was perfect at noon. Whoever stopped it knew exactly which gear to take — the escapement gear. Without it, the clock cannot tick. Only three of us know that: me, Elena from the history club, and Victor the antiques dealer.",
          question:
            "Why is it important that the thief removed the escapement gear specifically?",
          options: [
            { id: "a", text: "It was the easiest gear to reach", correct: false, feedback: "The escapement gear sits deep inside — reaching it takes knowledge, not convenience." },
            { id: "b", text: "Only someone who understands the mechanism would know that gear stops the whole clock", correct: true, feedback: "Precisely! Taking exactly that gear shows inside knowledge, not luck." },
            { id: "c", text: "It was the most valuable gear", correct: false, feedback: "Small brass gears are common — the value was in the knowledge, not the metal." },
          ],
          clueUnlocked: {
            id: "clue-1",
            name: "The Escapement Gear",
            description: "The thief knew clockwork deeply — only three people did.",
            icon: "⚙️",
          },
          vocabulary: [
            { word: "mechanism", definition: "A system of moving parts working together, like inside a clock." },
            { word: "escapement", definition: "The part of a clock that controls its steady ticking." },
          ],
        },
        {
          id: "scene-2",
          title: "The Research Notes",
          location: "Library Archive",
          locationIcon: "🗃️",
          passage:
            "Elena's history-club folder lay open on the archive table. You read her neat notes: '1898 — clock built by the Ashford family. Legend says a brass key to the Ashford vault was hidden INSIDE the clock as a reward for whoever preserves it.' A margin note in different ink read: 'Ask Victor — he keeps asking me for page 12.'",
          witnessName: "Elena",
          witnessRole: "History Club President",
          witnessStatement:
            "Victor kept asking to borrow my page 12 — the page about the hidden vault key. I said no, it's club property. But yesterday he offered me fifty dollars for 'a photo of that page.' Fifty dollars! When I still said no, he asked which shelf the club folder lives on.",
          question:
            "Putting the note and Elena's words together, what was Victor really after?",
          options: [
            { id: "a", text: "He wanted to help preserve the clock as he claimed", correct: false, feedback: "Preservers don't pry out gears or offer cash for hidden vault keys." },
            { id: "b", text: "He was hunting the legendary brass vault key hidden inside the clock", correct: true, feedback: "All the pieces connect: the legend, the offered money, the asked-for shelf — Victor wanted that key." },
            { id: "c", text: "He was collecting old gears to sell", correct: false, feedback: "Then he'd have taken many gears — not the one that stops the clock." },
          ],
          clueUnlocked: {
            id: "clue-2",
            name: "The Vault Key Legend",
            description: "A brass vault key was said to be hidden inside the clock — Victor wanted it.",
            icon: "🗝️",
          },
          vocabulary: [
            { word: "legend", definition: "An old story handed down over time — may or may not be true." },
            { word: "preserves", definition: "Keeps something safe from harm or change." },
          ],
        },
        {
          id: "scene-3",
          title: "The Shop Receipt",
          location: "Antique Shop",
          locationIcon: "🏪",
          passage:
            "Victor's shop window glittered with clocks. On his desk, half under a ledger, you spotted a carbon copy receipt: 'One antique pocket watch, brass, 1900s — SOLD, $200, buyer: private.' Dated the morning after the clock stopped. A small empty brass cradle sat in the display case, sized exactly like the missing escapement gear.",
          witnessName: "Victor",
          witnessRole: "Antiques Dealer",
          witnessStatement:
            "A gear? Certainly not. I would never touch a town treasure. That watch sold the same morning? Coincidence, dear detective. Besides — stopping the clock doesn't profit me. I offered to restore the tower for free, remember?",
          question:
            "Victor says stopping the clock brings him no profit. What does the receipt suggest about that claim?",
          options: [
            { id: "a", text: "He's right — the sale was unrelated", correct: false, feedback: "A 1900s brass watch sold the very morning the clock's brass gear vanished? That timing is not coincidence." },
            { id: "b", text: "The brass gear may have been melted or fitted into the 'antique' watch he sold", correct: true, feedback: "Exactly — free restoration was his cover; the real profit was hidden in the sale." },
            { id: "c", text: "Someone else sold the watch from his shop", correct: false, feedback: "The receipt was in his own ledger, in his own shop." },
          ],
          clueUnlocked: {
            id: "clue-3",
            name: "The Convenient Sale",
            description: "A brass watch sold the morning the brass gear disappeared — Victor's 'free' offer hid a profit.",
            icon: "💰",
          },
          vocabulary: [
            { word: "ledger", definition: "A book for keeping money records." },
            { word: "coincidence", definition: "Two things happening together by chance, without connection." },
          ],
        },
        {
          id: "scene-4",
          title: "Inside the Clock",
          location: "Clock Tower Mechanism",
          locationIcon: "🕰️",
          passage:
            "You climbed the tower one last time and shone your light into the open mechanism. There, wedged behind the main wheel, glinted a small brass key stamped 'ASHFORD 1898.' Beside it, a drop cloth and a pry bar with fresh brass shavings. The legend was true — and Victor had found it with the very tool he used to stop history's favorite clock.",
          witnessName: "Detective",
          witnessRole: "You",
          witnessStatement:
            "The key, the tool, the sale — the chain is complete. Name the motive and the thief.",
          question:
            "What was Victor's full chain of actions, from start to finish?",
          options: [
            { id: "a", text: "He fixed the clock, found the key by accident, and kept it", correct: false, feedback: "Fixers don't bring pry bars — and accidental finds don't come with forged offers of free restoration." },
            { id: "b", text: "He pried out the gear to stop the clock, searched for the vault key, and sold a brass watch to profit", correct: true, feedback: "Case solved! The free-restoration offer earned trust, the gear theft stopped the clock, and the sale turned brass into money." },
            { id: "c", text: "Elena helped him to fund the history club", correct: false, feedback: "Elena refused his money and told you everything — she's a witness, not a partner." },
          ],
          clueUnlocked: {
            id: "clue-4",
            name: "The Ashford Key",
            description: "The legendary vault key was real — found beside Victor's pry bar.",
            icon: "🔑",
          },
          vocabulary: [
            { word: "shavings", definition: "Thin pieces scraped off metal or wood." },
            { word: "consecutive", definition: "Following one after another in order." },
          ],
        },
      ],
    },
  },
  {
    level: 4,
    focusLabel: "Tricky Evidence",
    focus: ["Evidence synthesis", "Emotional inference", "Conflicting clues"],
    caseData: {
      id: "silent-witness",
      title: "The Silent Witness",
      subtitle: "A parrot saw everything — but only speaks in rhymes.",
      location: "Sunnyside Pet Shop",
      difficulty: "Hard",
      icon: "🦜",
      suspectCount: 3,
      totalClues: 4,
      description:
        "The pet shop's prize cockatiel, Pistachio, vanished from a locked cage overnight. The only witness? A rhyming parrot named Professor who repeats what he heard. But his rhymes contradict each other — and people's feelings don't match their words.",
      suspects: [
        { name: "Nadia", role: "Shop Owner", icon: "👩‍🌾", description: "She raised Pistachio from a chick and seems heartbroken." },
        { name: "Omar", role: "Delivery Boy", icon: "🚲", description: "He feeds the animals each morning and knows the codes." },
        { name: "Priscilla", role: "Bird Collector", icon: "👒", description: "A wealthy visitor who admired Pistachio twice this week." },
      ],
      scenes: [
        {
          id: "scene-1",
          title: "The Empty Cage",
          location: "Bird Room",
          locationIcon: "🐦",
          passage:
            "The cage door hung open — but the latch was unbroken and the lock was still locked. Beside it, a half-eaten millet spray. Professor the parrot shuffled on his perch and muttered: 'Keys in the bowl, bowl on the shelf, shelf by the door… I saw it all, I saw it all…'",
          witnessName: "Nadia",
          witnessRole: "Shop Owner",
          witnessStatement:
            "I'd never leave that cage unlatched — never. I fed Pistachio at closing, kissed her head, and went home. This morning the latch was open and my spare key was missing from the bowl by the door. Professor, tell them what you told me! He just repeats rhymes… but he heard everything last night.",
          question:
            "The cage lock was still locked but the latch was open. What does this combination suggest?",
          options: [
            { id: "a", text: "Pistachio learned to open her own cage", correct: false, feedback: "A millet-snacking cockatiel can't unlock a latch from inside a locked cage." },
            { id: "b", text: "Someone used the spare key — the thief opened the lock properly", correct: true, feedback: "Exactly! A key opened the lock, then the latch — no force anywhere." },
            { id: "c", text: "Nadia forgot to lock the cage", correct: false, feedback: "The lock was still locked — she definitely latched it." },
          ],
          clueUnlocked: {
            id: "clue-1",
            name: "The Missing Spare Key",
            description: "The thief took the spare key from the bowl — no broken locks.",
            icon: "🗝️",
          },
          vocabulary: [
            { word: "latch", definition: "A bar or catch that fastens a door or gate." },
            { word: "millet spray", definition: "A seed treat birds eat off a stem." },
          ],
        },
        {
          id: "scene-2",
          title: "The Contradiction",
          location: "Feeding Schedule",
          locationIcon: "📅",
          passage:
            "Professor repeated two rhymes back to back: 'Omar feeds at seven, leaves at half past eight…' Then: 'Late at night a shadow came, quiet as a dream…' But Omar insists he left at 8:30, and the shop alarm log shows no door opening after 9 PM.",
          witnessName: "Omar",
          witnessRole: "Delivery Boy",
          witnessStatement:
            "I fed everyone at seven and left at half past eight, like the schedule says. Pistachio was fine when I left — singing and swinging. I don't have the code to the alarm panel anyway. Nadia sets it herself.",
          question:
            "The alarm never opened after 9 PM, yet Professor heard a 'shadow' at night. How can both be true?",
          options: [
            { id: "a", text: "Professor is making the night visit up", correct: false, feedback: "Parrots repeat real sounds — and the cage WAS opened somehow." },
            { id: "b", text: "The thief never used a door — they were already inside before the alarm was set", correct: true, feedback: "Sharp thinking! Hiding inside before closing time means no alarm ever triggered." },
            { id: "c", text: "The alarm log is broken", correct: false, feedback: "The alarm works fine — that's exactly why there's no record." },
          ],
          clueUnlocked: {
            id: "clue-2",
            name: "Inside Before Closing",
            description: "The thief hid in the shop before the alarm was set — no door ever opened.",
            icon: "🕳️",
          },
          vocabulary: [
            { word: "contradiction", definition: "Two statements that cannot both be true at once." },
            { word: "alarm panel", definition: "The control box that turns an alarm on and off." },
          ],
        },
        {
          id: "scene-3",
          title: "The Twisted Feelings",
          location: "Back Office",
          locationIcon: "💼",
          passage:
            "Priscilla swept in wearing pearls. 'Disgraceful!' she cried. 'I offered Nadia triple the cage price and she refused me twice!' She dabbed dry eyes with a silk scarf. But her scarf pocket bulged — and Professor, from his perch, chirped brightly: 'Pearls and a plan, pearls and a plan!'",
          witnessName: "Priscilla",
          witnessRole: "Bird Collector",
          witnessStatement:
            "That bird was one of a kind and I wanted it, I admit. But steal? How vulgar. I was at the Grand Hotel all evening — ask any of the staff. Now if you'll excuse me, I have a flight to catch tonight.",
          question:
            "Priscilla cries about the theft, but her words and feelings don't match up. What is the clue telling you?",
          options: [
            { id: "a", text: "She genuinely loved Pistachio like a pet", correct: false, feedback: "Real love doesn't vanish the moment a flight is booked — or offer triple the price." },
            { id: "b", text: "Her tears are performance — the bulging pocket and 'flight tonight' say she's leaving with something", correct: true, feedback: "Exactly. Watch actions, not tears: pocket, plane, and 'pearls and a plan.'" },
            { id: "c", text: "Professor's rhyme is about her pearls", correct: false, feedback: "Professor rhymes what he heard — 'plan' rhymes with intent, not jewelry." },
          ],
          clueUnlocked: {
            id: "clue-3",
            name: "The Performance",
            description: "Priscilla's tears were staged — a booked flight and a bulging pocket say more.",
            icon: "🎭",
          },
          vocabulary: [
            { word: "vulgar", definition: "Rude or lacking good manners." },
            { word: "staged", definition: "Deliberately arranged to look a certain way, not genuine." },
          ],
        },
        {
          id: "scene-4",
          title: "The Cage in the Luggage",
          location: "Hotel Lobby",
          locationIcon: "🧳",
          passage:
            "At the Grand Hotel, a porter wheeled a large hat box toward the taxis. Professor's rhyme echoed in your head: 'Small bird, big box, pearls and a plan.' You peeked inside: Pistachio, warm and indignant, atop a silk nest — next to Nadia's missing spare key, dropped like an afterthought. Priscilla's taxi waited outside.",
          witnessName: "Detective",
          witnessRole: "You",
          witnessStatement:
            "Every contradiction is explained now. Say who hid inside the shop, and how you know.",
          question:
            "Who hid inside the pet shop before closing, and which clues prove it?",
          options: [
            { id: "a", text: "Omar hid inside — he knew the feeding schedule", correct: false, feedback: "Omar left on schedule and the alarm log proves he never returned." },
            { id: "b", text: "Nadia staged the theft for the insurance money", correct: false, feedback: "Her grief was real — and the key turned up in Priscilla's luggage, not Nadia's." },
            { id: "c", text: "Priscilla hid inside before closing, took the spare key, opened the cage, and booked a flight to smuggle Pistachio out", correct: true, feedback: "Case solved! Every rhyme fits: the key, the shadow, the plan — and the parrot was right all along." },
          ],
          clueUnlocked: {
            id: "clue-4",
            name: "The Hat Box",
            description: "Pistachio found in Priscilla's luggage — with the stolen spare key beside her.",
            icon: "🦜",
          },
          vocabulary: [
            { word: "indignant", definition: "Annoyed because something feels unfair." },
            { word: "smuggle", definition: "To secretly move something where it isn't allowed." },
          ],
        },
      ],
    },
  },
  {
    level: 5,
    focusLabel: "Master Class",
    focus: ["Combined fluency", "Comprehension", "Vocabulary", "Multi-step reasoning"],
    caseData: {
      id: "final-case",
      title: "The Final Case",
      subtitle: "Every skill you've learned — one last mystery.",
      location: "Maplewood Observatory",
      difficulty: "Hard",
      icon: "🔭",
      suspectCount: 3,
      totalClues: 4,
      description:
        "The observatory's 40-year-old meteorite was swapped for a replica during the town's star party — with two hundred people watching the sky. Use everything: read closely, connect evidence, untangle feelings, and reason across every clue. This is what you trained for, Detective.",
      suspects: [
        { name: "Dr. Halloway", role: "Observatory Director", icon: "🔬", description: "He curated the meteorite exhibit for decades." },
        { name: "Juno", role: "Teen Astronomer", icon: "🌠", description: "She won the stargazing contest and volunteered backstage." },
        { name: "Silas", role: "Meteorite Collector", icon: "💼", description: "A quiet donor who funded the new telescope wing." },
      ],
      scenes: [
        {
          id: "scene-1",
          title: "The Swap",
          location: "Exhibit Hall",
          locationIcon: "🪨",
          passage:
            "The display case still gleamed. But Dr. Halloway's hands trembled as he lifted the 'meteorite' — and it clinked. Stone does not clink. Painted resin, hollow inside, a perfect copy. The case log said the exhibit was checked at 6:00 and again at 6:40, between which the crowd watched the meteor shower in the dome — every guest accounted for, every face pointed upward.",
          witnessName: "Dr. Halloway",
          witnessRole: "Observatory Director",
          witnessStatement:
            "Forty years I've cared for this stone. I checked it at six — the real one, cold and heavy as truth. At 6:40 the case still looked right. Nobody touched it during the shower — two hundred eyes on the sky, not one on the exhibit. Whoever swapped it knew exactly when those six minutes of darkness would fall, and exactly how the case locks. Only three people know the double-latch: Juno, Silas, and me.",
          question:
            "Dr. Halloway checked the exhibit at 6:40 and it 'looked right.' What does that detail tell you about the swap?",
          options: [
            { id: "a", text: "The swap happened after 6:40", correct: false, feedback: "The replica only 'clinked' when lifted later — a real check would have caught the weight difference at 6:40... unless the check itself wasn't real." },
            { id: "b", text: "The swap was done so cleanly before 6:40 that a visual check passed — or the checker wasn't looking honestly", correct: true, feedback: "Precisely — the swap was expert enough to fool a glance, which narrows the suspects to those who know the case AND the stone." },
            { id: "c", text: "The meteorite was never real", correct: false, feedback: "It was cold and heavy at 6:00 — the weight difference is the giveaway." },
          ],
          clueUnlocked: {
            id: "clue-1",
            name: "The Six Dark Minutes",
            description: "The swap needed clockwork timing, case knowledge, and a light-proof glance.",
            icon: "⏱️",
          },
          vocabulary: [
            { word: "resin", definition: "A hard synthetic material that can be molded like plastic." },
            { word: "curated", definition: "Carefully selected and looked after, like a museum piece." },
          ],
        },
        {
          id: "scene-2",
          title: "The Contest Trophy",
          location: "Volunteer Locker Room",
          locationIcon: "🏆",
          passage:
            "Juno's locker was ajar. Inside: her stargazing trophy, a thermos of cocoa — and cotton gloves dusted with something gray. A laminated star map hung from the hook, with a route drawn in marker: 'dome → storage → exhibit → roof.' Juno's sneakers, by the bench, were still damp from the grass outside.",
          witnessName: "Juno",
          witnessRole: "Teen Astronomer",
          witnessStatement:
            "Yes, I was backstage — I carried the cocoa and held doors, that's all. The gloves? I cleaned the telescope with them after, that's why they're gray — it's lens grease, not rock dust. And I went up to the roof after the shower to see the green flash. Check my star map — the route is my shortcut, I take it every night I volunteer.",
          question:
            "Juno's route on the map passes the exhibit case. Why might that NOT make her the thief?",
          options: [
            { id: "a", text: "She has no reason to want the meteorite", correct: false, feedback: "Reasons can hide — you need stronger evidence than 'she seems nice.'" },
            { id: "b", text: "Her route is a known nightly shortcut, her gloves match lens grease, and she was seen on the roof — the story is consistent", correct: true, feedback: "Right! Consistency across three details beats one suspicious-looking clue." },
            { id: "c", text: "Her damp sneakers prove she was outside, not inside", correct: false, feedback: "Damp sneakers don't cover the whole evening — keep the route question open." },
          ],
          clueUnlocked: {
            id: "clue-2",
            name: "The Consistent Alibi",
            description: "Juno's story holds across route, gloves, and roof — evidence of innocence, not guilt.",
            icon: "🌠",
          },
          vocabulary: [
            { word: "laminated", definition: "Covered in clear plastic for protection." },
            { word: "alibi", definition: "Evidence showing someone was elsewhere when something happened." },
          ],
        },
        {
          id: "scene-3",
          title: "The Donor's Watch",
          location: "Telescope Wing",
          locationIcon: "💼",
          passage:
            "Silas's donation plaque was brand new. Nearby, on a velvet tray, lay his pocket watch — stopped at 6:37. 'Keepsake from my father,' he said softly. 'It stopped the night I first saw this meteorite fall, forty years ago.' But the meteorite fell forty years ago TODAY — and the watch's crystal catches light in a strange, layered way, like glass over glass.",
          witnessName: "Silas",
          witnessRole: "Meteorite Collector",
          witnessStatement:
            "I funded this wing because I love the sky, Detective. My watch stopped decades ago at the moment I watched that stone land — poetic, no? Swap a meteorite? I could buy ten legally. Ask anyone: I was on the platform during the entire shower, giving a speech about my father.",
          question:
            "Silas says the watch stopped 40 years ago. What detail quietly contradicts him?",
          options: [
            { id: "a", text: "The watch looks expensive", correct: false, feedback: "Wealth isn't evidence — plenty of honest people own fine watches." },
            { id: "b", text: "A stopped watch showing tonight's exact swap-minute, with a doubled crystal — clocks that 'stop' can be reset as timers", correct: true, feedback: "Excellent synthesis! The 'poetic' story may be a cover for a planted timer." },
            { id: "c", text: "His speech kept people's eyes on the platform", correct: false, feedback: "His speech was during the shower — but that's opportunity, and opportunity alone convicts no one." },
          ],
          clueUnlocked: {
            id: "clue-3",
            name: "The Planted Timer",
            description: "A 'stopped' watch set to 6:37 — with a doubled crystal hiding something inside.",
            icon: "⌚",
          },
          vocabulary: [
            { word: "keepsake", definition: "An item kept to remember a person or event." },
            { word: "contradict", definition: "To say or show the opposite of what was claimed." },
          ],
        },
        {
          id: "scene-4",
          title: "The Weight of Truth",
          location: "Director's Vault",
          locationIcon: "🔐",
          passage:
            "Dr. Halloway opened the vault to sign the incident report — and stopped. In the vault's corner, wrapped in a star map, sat the REAL meteorite, cold and heavy. The vault lock's double-latch showed no forcing. Dr. Halloway paled. 'I... I moved it for safekeeping,' he whispered. 'Silas warned me the case locks were weak. I was going to announce it tomorrow.' The 'weak lock' warning came in a letter dated BEFORE tonight's party.",
          witnessName: "Detective",
          witnessRole: "You",
          witnessStatement:
            "The real stone was never swapped away — it was moved into the vault early, with a warning letter written before the crime. Unite every clue and name the architect of this mystery.",
          question:
            "Using ALL the evidence — the timer watch, the clean swap, the early warning letter, and the vault — who planned the crime and how?",
          options: [
            { id: "a", text: "Juno swapped the stone and used her route to escape", correct: false, feedback: "Her alibi held across three checks — and the vault letter predates her volunteering entirely." },
            { id: "b", text: "Dr. Halloway acted alone, hiding his own meteorite", correct: false, feedback: "He moved the stone — but only after a warning letter HE didn't write told him to." },
            { id: "c", text: "Silas wrote the fake warning letter to make Halloway move the stone, planted the timer watch, and swapped in the replica during the shower — the perfect misdirection", correct: true, feedback: "CASE SOLVED! Silas engineered every piece: a letter to move the stone, a timer to frame the moment, a speech to hold the crowd. The vault was the hiding place all along — and your reading broke the whole chain." },
          ],
          clueUnlocked: {
            id: "clue-4",
            name: "The Warning Letter",
            description: "A letter dated before the party — the thread that unravels the entire scheme.",
            icon: "📜",
          },
          vocabulary: [
            { word: "misdirection", definition: "Guiding attention to the wrong place to hide the truth." },
            { word: "predates", definition: "Comes from an earlier time than something else." },
          ],
        },
      ],
    },
  },
];

export function getCaseLevel(level: number): CaseLevel {
  return CASE_LEVELS.find((l) => l.level === level) ?? CASE_LEVELS[0];
}
