import { LeetCode } from "leetcode-query";

async function getDailyChallenge() {
  const leetcode = new LeetCode();
  
  try {
    const dailyChallenge = await leetcode.daily();
    console.log(dailyChallenge);
    // Process the dailyChallenge object as needed
  } catch (error) {
    console.error("Failed to fetch daily challenge:", error);
  }
}

getDailyChallenge();