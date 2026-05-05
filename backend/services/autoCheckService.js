const OpenAI = require("openai");
const Request = require("../models/Request");
const Team = require("../models/Team");
const User = require("../models/User");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

exports.runAutoChecks = async (request, creatorUser) => {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const duplicate = await Request.findOne({
    creatorId: request.creatorId,
    category: request.category,
    teamId: request.teamId,
    status: { $in: ["PENDING", "APPROVED"] },
    createdAt: { $gte: sevenDaysAgo },
    _id: { $ne: request._id },
  });

  if (duplicate) {
    return {
      passed: false,
      status: "DUPLICATE",
      reason:
        "A similar " +
        request.category +
        " request was already submitted in the last 7 days.",
    };
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 150,
      messages: [
        {
          role: "system",
          content:
            'You are a request validation assistant. Evaluate if the request is clear, specific, and actionable. Reply ONLY with valid JSON: {"verdict":"PASS" or "REJECT","reason":"one sentence"}',
        },
        {
          role: "user",
          content: `Title: ${request.title}\nDescription: ${request.description}\nCategory: ${request.category}\nRequested Amount: ${request.requestedAmount}`,
        },
      ],
    });

    const content = response.choices?.[0]?.message?.content || "";
    const parsed = JSON.parse(content);

    if (parsed.verdict === "REJECT") {
      return {
        passed: false,
        status: "AI_REJECTED",
        reason: parsed.reason || "Request rejected by AI check",
      };
    }
  } catch (error) {
    console.error(error);
    return {
      passed: true,
      status: "PASSED",
      reason: "AI check skipped",
    };
  }

  if (request.requestedAmount > 0) {
    if (creatorUser?.budgetLimit > 0) {
      if (request.requestedAmount > creatorUser.budgetLimit) {
        return {
          passed: false,
          status: "BUDGET_EXCEEDED",
          reason:
            "Requested amount of " +
            request.requestedAmount +
            " exceeds the team budget limit of " +
            creatorUser.budgetLimit,
        };
      }
    }

    try {
      const team = await Team.findOne({ slug: request.teamId });
      if (
        team &&
        team.totalBudget > 0 &&
        team.usedBudget + request.requestedAmount > team.totalBudget
      ) {
        return {
          passed: false,
          status: "BUDGET_EXCEEDED",
          reason:
            "Requested amount exceeds remaining team budget. Available: " +
            (team.totalBudget - team.usedBudget),
        };
      }
    } catch (error) {
      console.error(error);
    }
  }

  return {
    passed: true,
    status: "PASSED",
    reason: "All automated checks passed",
  };
};
