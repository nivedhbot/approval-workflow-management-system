const Requirement = require("../models/Requirement");

const normalizeTeamId = (teamId) => {
  if (!teamId || typeof teamId !== "string") return null;
  const normalized = teamId.trim().toLowerCase();
  if (!normalized || normalized === "all" || normalized === "global") {
    return null;
  }
  return normalized.replace(/\s+/g, "-");
};

const normalizeList = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item).trim())
      .filter((item) => item.length > 0);
  }
  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }
  return [];
};

const allowedCategories = [
  "ALL",
  "BUG_REPORT",
  "SERVER_ISSUE",
  "DEADLINE_EXTENSION",
  "FEATURE_REQUEST",
  "HR_REQUEST",
  "OTHER",
];

exports.listRequirements = async (req, res) => {
  try {
    const category = req.query.category;
    const includeInactive =
      req.query.includeInactive === "true" && req.user.role === "APPROVER";
    const teamId = normalizeTeamId(req.query.teamId || req.user.teamId);

    const filters = [];
    filters.push({ $or: [{ teamId }, { teamId: null }, { teamId: "" }] });

    if (category && category !== "ALL") {
      if (!allowedCategories.includes(category)) {
        return res.status(400).json({
          success: false,
          error: "Invalid category filter",
        });
      }
      filters.push({ $or: [{ category }, { category: "ALL" }] });
    }

    const query = filters.length > 0 ? { $and: filters } : {};
    if (!includeInactive) {
      query.status = "ACTIVE";
    }

    const requirements = await Requirement.find(query)
      .sort({ status: 1, enforcement: -1, updatedAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: requirements.length,
      requirements: requirements.map((req) => ({
        id: req._id,
        title: req.title,
        rule: req.rule,
        category: req.category,
        enforcement: req.enforcement,
        tags: req.tags || [],
        examples: req.examples || [],
        status: req.status,
        teamId: req.teamId,
        createdAt: req.createdAt,
        updatedAt: req.updatedAt,
      })),
    });
  } catch (error) {
    res.status(500).json({ success: false, error: "Server error" });
  }
};

exports.createRequirement = async (req, res) => {
  try {
    const {
      title,
      rule,
      category,
      enforcement,
      tags,
      examples,
      status,
      teamId,
    } = req.body;

    if (!title || !rule) {
      return res.status(400).json({
        success: false,
        error: "Title and rule are required",
      });
    }

    if (category && !allowedCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        error: "Invalid category",
      });
    }

    const requirement = await Requirement.create({
      title: title.trim(),
      rule: rule.trim(),
      category: category || "ALL",
      enforcement: enforcement || "GUIDANCE",
      tags: normalizeList(tags),
      examples: normalizeList(examples),
      status: status || "ACTIVE",
      teamId: normalizeTeamId(teamId),
      createdBy: req.user.id,
      updatedBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      requirement: {
        id: requirement._id,
        title: requirement.title,
        rule: requirement.rule,
        category: requirement.category,
        enforcement: requirement.enforcement,
        tags: requirement.tags,
        examples: requirement.examples,
        status: requirement.status,
        teamId: requirement.teamId,
        createdAt: requirement.createdAt,
      },
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        error: messages.join(", "),
      });
    }

    res.status(500).json({ success: false, error: "Server error" });
  }
};

exports.updateRequirement = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      rule,
      category,
      enforcement,
      tags,
      examples,
      status,
      teamId,
    } = req.body;

    if (category && !allowedCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        error: "Invalid category",
      });
    }

    const update = {
      updatedBy: req.user.id,
    };

    if (title !== undefined) update.title = title.trim();
    if (rule !== undefined) update.rule = rule.trim();
    if (category !== undefined) update.category = category;
    if (enforcement !== undefined) update.enforcement = enforcement;
    if (status !== undefined) update.status = status;
    if (tags !== undefined) update.tags = normalizeList(tags);
    if (examples !== undefined) update.examples = normalizeList(examples);
    if (teamId !== undefined) update.teamId = normalizeTeamId(teamId);

    const requirement = await Requirement.findByIdAndUpdate(id, update, {
      new: true,
    });

    if (!requirement) {
      return res.status(404).json({
        success: false,
        error: "Requirement not found",
      });
    }

    res.status(200).json({
      success: true,
      requirement: {
        id: requirement._id,
        title: requirement.title,
        rule: requirement.rule,
        category: requirement.category,
        enforcement: requirement.enforcement,
        tags: requirement.tags || [],
        examples: requirement.examples || [],
        status: requirement.status,
        teamId: requirement.teamId,
        updatedAt: requirement.updatedAt,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: "Server error" });
  }
};

exports.deleteRequirement = async (req, res) => {
  try {
    const { id } = req.params;
    const requirement = await Requirement.findByIdAndDelete(id);
    if (!requirement) {
      return res.status(404).json({
        success: false,
        error: "Requirement not found",
      });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: "Server error" });
  }
};
