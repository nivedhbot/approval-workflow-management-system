const OpenAI = require("openai");
const Request = require("../models/Request");
const Team = require("../models/Team");
const User = require("../models/User");
const Requirement = require("../models/Requirement");

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

  if (!process.env.OPENAI_API_KEY) {
    return {
      passed: true,
      status: "PASSED",
      reason: "AI check skipped: OPENAI_API_KEY is not configured",
    };
  }

  let requirementsContext = "No additional project requirements.";
  try {
    const teamId = request.teamId || "general";
    const requirements = await Requirement.find({
      status: "ACTIVE",
      $and: [
        { $or: [{ teamId }, { teamId: null }, { teamId: "" }] },
        { $or: [{ category: request.category }, { category: "ALL" }] },
      ],
    })
      .sort({ enforcement: -1, updatedAt: -1 })
      .limit(25)
      .lean();

    if (requirements.length > 0) {
      requirementsContext = requirements
        .map((req, index) => {
          const tags = req.tags?.length ? ` Tags: ${req.tags.join(", ")}.` : "";
          const examples = req.examples?.length
            ? ` Examples: ${req.examples.join(" | ")}.`
            : "";
          return `${index + 1}. [${req.enforcement}] ${req.title} - ${req.rule}.${tags}${examples}`;
        })
        .join("\n");
    }
  } catch (error) {
    console.error("Failed to load requirements:", error.message || error);
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 150,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            'You are a request validation assistant. Evaluate if the request is clear, specific, and actionable. Apply the project requirements. If any BLOCKING requirement is violated, respond with REJECT. Reply ONLY with valid JSON: {"verdict":"PASS" or "REJECT","reason":"one sentence"}',
        },
        {
          role: "user",
          content:
            `Project requirements:\n${requirementsContext}\n\n` +
            `Title: ${request.title}\n` +
            `Description: ${request.description}\n` +
            `Category: ${request.category}\n` +
            `Deadline: ${request.deadline ? request.deadline.toISOString() : "not provided"}\n` +
            `Requested Amount: ${request.requestedAmount || 0}`,
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
    console.error("OpenAI auto-check failed:", error.message || error);
    return {
      passed: true,
      status: "PASSED",
      reason: "AI check skipped: OpenAI request failed",
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
