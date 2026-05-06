const mongoose = require("mongoose");
const request = require("supertest");
const { MongoMemoryServer } = require("mongodb-memory-server");
const User = require("../models/User");
const Request = require("../models/Request");
const BudgetTransaction = require("../models/BudgetTransaction");
const Requirement = require("../models/Requirement");

let app;
let mongoServer;

jest.setTimeout(30000);

const registerUser = async (data) => {
  const res = await request(app).post("/api/auth/register").send(data);
  return res;
};

const createRequestAs = async (token, data) => {
  const payload = {
    category: "BUG_REPORT",
    ...data,
  };
  const res = await request(app)
    .post("/api/requests")
    .set("Authorization", `Bearer ${token}`)
    .send(payload);
  return res;
};

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongoServer.getUri();
  process.env.JWT_SECRET = process.env.JWT_SECRET || "test_jwt_secret";
  process.env.NODE_ENV = "test";
  app = require("../server");
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

beforeEach(async () => {
  await User.deleteMany({});
  await Request.deleteMany({});
  await BudgetTransaction.deleteMany({});
  await Requirement.deleteMany({});
});

describe("Approval workflow access control", () => {
  test("CREATOR cannot access /pending", async () => {
    const creator = await registerUser({
      username: "creator1",
      email: "creator1@example.com",
      password: "Password1!",
      role: "CREATOR",
      teamId: "alpha",
    });

    const res = await request(app)
      .get("/api/requests/pending")
      .set("Authorization", `Bearer ${creator.body.token}`);

    expect(res.status).toBe(403);
  });

  test("APPROVER cannot create a request", async () => {
    const approver = await registerUser({
      username: "approver1",
      email: "approver1@example.com",
      password: "Password1!",
      role: "APPROVER",
      teamId: "alpha",
    });

    const res = await createRequestAs(approver.body.token, {
      title: "Budget request",
      description: "Requesting approval for Q2 budget.",
    });

    expect(res.status).toBe(403);
  });

  test("Self-approval returns 403", async () => {
    const approver = await registerUser({
      username: "approver2",
      email: "approver2@example.com",
      password: "Password1!",
      role: "APPROVER",
      teamId: "alpha",
    });

    const requestDoc = await Request.create({
      title: "Self request",
      description: "This should not be self-approved.",
      category: "BUG_REPORT",
      creatorId: approver.body.user.id,
      teamId: "alpha",
      status: "PENDING",
    });

    const res = await request(app)
      .put(`/api/requests/${requestDoc._id}/approve`)
      .set("Authorization", `Bearer ${approver.body.token}`)
      .send({ comments: "Looks good." });

    expect(res.status).toBe(403);
  });

  test("Cross-team approval returns 403", async () => {
    const creator = await registerUser({
      username: "creator2",
      email: "creator2@example.com",
      password: "Password1!",
      role: "CREATOR",
      teamId: "alpha",
    });

    const createRes = await createRequestAs(creator.body.token, {
      title: "Team alpha request",
      description: "Only alpha approvers should act.",
    });

    const approver = await registerUser({
      username: "approver3",
      email: "approver3@example.com",
      password: "Password1!",
      role: "APPROVER",
      teamId: "beta",
    });

    const res = await request(app)
      .put(`/api/requests/${createRes.body.request.id}/approve`)
      .set("Authorization", `Bearer ${approver.body.token}`)
      .send({ comments: "Attempt cross-team approval" });

    expect(res.status).toBe(403);
  });

  test("Double-approve returns 400", async () => {
    const creator = await registerUser({
      username: "creator3",
      email: "creator3@example.com",
      password: "Password1!",
      role: "CREATOR",
      teamId: "alpha",
    });

    const createRes = await createRequestAs(creator.body.token, {
      title: "Approval needed",
      description: "Needs review by alpha approvers.",
    });

    const approver1 = await registerUser({
      username: "approver4",
      email: "approver4@example.com",
      password: "Password1!",
      role: "APPROVER",
      teamId: "alpha",
    });

    const approver2 = await registerUser({
      username: "approver5",
      email: "approver5@example.com",
      password: "Password1!",
      role: "APPROVER",
      teamId: "alpha",
    });

    const firstApprove = await request(app)
      .put(`/api/requests/${createRes.body.request.id}/approve`)
      .set("Authorization", `Bearer ${approver1.body.token}`)
      .send({ comments: "Approved" });

    expect(firstApprove.status).toBe(200);

    const secondApprove = await request(app)
      .put(`/api/requests/${createRes.body.request.id}/approve`)
      .set("Authorization", `Bearer ${approver2.body.token}`)
      .send({ comments: "Approve again" });

    expect(secondApprove.status).toBe(400);
  });
});

jest.mock("openai", () => {
  return function OpenAI() {
    return {
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue({
            choices: [
              {
                message: {
                  content: '{"verdict":"PASS","reason":"ok"}',
                },
              },
            ],
          }),
        },
      },
    };
  };
});

describe("Auto-check validation", () => {
  test.each([
    "BUG_REPORT",
    "SERVER_ISSUE",
    "DEADLINE_EXTENSION",
    "FEATURE_REQUEST",
    "HR_REQUEST",
    "OTHER",
  ])("Allows valid category %s", async (category) => {
    const creator = await registerUser({
      username: `creator-category-${category.toLowerCase()}`,
      email: `${category.toLowerCase()}@example.com`,
      password: "Password1!",
      role: "CREATOR",
      teamId: "delta",
    });

    const res = await createRequestAs(creator.body.token, {
      title: `Request for ${category}`,
      description: "Valid request for category coverage.",
      category,
    });

    expect(res.status).toBe(201);
    expect(res.body.request.category).toBe(category);
  });

  test.each(["LOW", "MEDIUM", "HIGH", "CRITICAL"])(
    "Preserves priority %s",
    async (priority) => {
      const creator = await registerUser({
        username: `creator-priority-${priority.toLowerCase()}`,
        email: `${priority.toLowerCase()}@example.com`,
        password: "Password1!",
        role: "CREATOR",
        teamId: "epsilon",
      });

      const res = await createRequestAs(creator.body.token, {
        title: `Priority ${priority} request`,
        description: "Valid request for priority coverage.",
        category: "FEATURE_REQUEST",
        priority,
      });

      expect(res.status).toBe(201);
      expect(res.body.request.priority).toBe(priority);
    },
  );

  test("Pending requests are ordered by priority before age", async () => {
    const creator = await registerUser({
      username: "creator-order",
      email: "creator-order@example.com",
      password: "Password1!",
      role: "CREATOR",
      teamId: "zeta",
    });

    await createRequestAs(creator.body.token, {
      title: "Low priority request",
      description: "Should appear after higher priorities.",
      category: "OTHER",
      priority: "LOW",
    });

    await createRequestAs(creator.body.token, {
      title: "Critical priority request",
      description: "Should be listed first.",
      category: "FEATURE_REQUEST",
      priority: "CRITICAL",
    });

    const approver = await registerUser({
      username: "approver-order",
      email: "approver-order@example.com",
      password: "Password1!",
      role: "APPROVER",
      teamId: "zeta",
    });

    const pending = await request(app)
      .get("/api/requests/pending")
      .set("Authorization", `Bearer ${approver.body.token}`);

    expect(pending.status).toBe(200);
    expect(pending.body.requests[0].priority).toBe("CRITICAL");
  });

  test("Duplicate request is auto-rejected", async () => {
    const creator = await registerUser({
      username: "creator-auto-1",
      email: "creator-auto-1@example.com",
      password: "Password1!",
      role: "CREATOR",
      teamId: "alpha",
    });

    const first = await createRequestAs(creator.body.token, {
      title: "Bug report alpha",
      description: "Same bug report request.",
      category: "BUG_REPORT",
    });

    expect(first.status).toBe(201);

    const second = await createRequestAs(creator.body.token, {
      title: "Bug report alpha",
      description: "Same bug report request.",
      category: "BUG_REPORT",
    });

    expect(second.status).toBe(201);
    expect(second.body.request.autoCheckStatus).toBe("DUPLICATE");
    expect(second.body.request.status).toBe("AUTO_REJECTED");
  });

  test("Budget exceeded is auto-rejected", async () => {
    const creator = await registerUser({
      username: "creator-auto-2",
      email: "creator-auto-2@example.com",
      password: "Password1!",
      role: "CREATOR",
      teamId: "beta",
    });

    await User.findByIdAndUpdate(creator.body.user.id, { budgetLimit: 100 });

    const res = await createRequestAs(creator.body.token, {
      title: "Large budget request",
      description: "This exceeds the budget limit.",
      category: "FEATURE_REQUEST",
      requestedAmount: 500,
    });

    expect(res.status).toBe(201);
    expect(res.body.request.autoCheckStatus).toBe("BUDGET_EXCEEDED");
    expect(res.body.request.status).toBe("AUTO_REJECTED");
  });

  test("Clean request passes all checks", async () => {
    const creator = await registerUser({
      username: "creator-auto-3",
      email: "creator-auto-3@example.com",
      password: "Password1!",
      role: "CREATOR",
      teamId: "gamma",
    });

    const res = await createRequestAs(creator.body.token, {
      title: "Unique ops request",
      description: "A clear request with enough details for review.",
      category: "SERVER_ISSUE",
      requestedAmount: 0,
    });

    expect(res.status).toBe(201);
    expect(res.body.request.autoCheckStatus).toBe("PASSED");
    expect(res.body.request.status).toBe("PENDING");
  });
});

describe("Revision workflow", () => {
  test("Approver can request changes and creator can resubmit", async () => {
    const creator = await registerUser({
      username: "creator-revise",
      email: "creator-revise@example.com",
      password: "Password1!",
      role: "CREATOR",
      teamId: "omega",
    });

    const approver = await registerUser({
      username: "approver-revise",
      email: "approver-revise@example.com",
      password: "Password1!",
      role: "APPROVER",
      teamId: "omega",
    });

    const createRes = await createRequestAs(creator.body.token, {
      title: "Initial request",
      description: "Needs more detail.",
      category: "FEATURE_REQUEST",
    });

    const requestId = createRes.body.request.id;

    const revisionRes = await request(app)
      .put(`/api/requests/${requestId}/request-changes`)
      .set("Authorization", `Bearer ${approver.body.token}`)
      .send({ comments: "Please add a rollout plan." });

    expect(revisionRes.status).toBe(200);

    const resubmitRes = await request(app)
      .put(`/api/requests/${requestId}/resubmit`)
      .set("Authorization", `Bearer ${creator.body.token}`)
      .send({
        title: "Updated request",
        description: "Now includes rollout plan and impact.",
        category: "FEATURE_REQUEST",
        priority: "HIGH",
      });

    expect(resubmitRes.status).toBe(200);
    expect(resubmitRes.body.request.status).toBe("PENDING");
    expect(resubmitRes.body.request.revisionCount).toBe(1);
  });
});

describe("Budget allocation and disbursement", () => {
  test("Approval allocates budget and disbursement updates status", async () => {
    const creator = await registerUser({
      username: "creator-budget",
      email: "creator-budget@example.com",
      password: "Password1!",
      role: "CREATOR",
      teamId: "sigma",
    });

    const approver = await registerUser({
      username: "approver-budget",
      email: "approver-budget@example.com",
      password: "Password1!",
      role: "APPROVER",
      teamId: "sigma",
    });

    const createRes = await createRequestAs(creator.body.token, {
      title: "Budgeted request",
      description: "Requires funding.",
      category: "FEATURE_REQUEST",
      requestedAmount: 250,
    });

    const approveRes = await request(app)
      .put(`/api/requests/${createRes.body.request.id}/approve`)
      .set("Authorization", `Bearer ${approver.body.token}`)
      .send({ comments: "Approved with budget" });

    expect(approveRes.status).toBe(200);

    const approvedRequest = await Request.findById(createRes.body.request.id);
    expect(approvedRequest.budgetStatus).toBe("ALLOCATED");

    const transaction = await BudgetTransaction.findOne({
      requestId: approvedRequest._id,
    });
    expect(transaction).toBeTruthy();
    expect(transaction.status).toBe("ALLOCATED");

    const disburseRes = await request(app)
      .put(`/api/requests/${approvedRequest._id}/disburse`)
      .set("Authorization", `Bearer ${approver.body.token}`)
      .send({ notes: "Funds released" });

    expect(disburseRes.status).toBe(200);

    const updatedRequest = await Request.findById(approvedRequest._id);
    expect(updatedRequest.budgetStatus).toBe("DISBURSED");

    const updatedTransaction = await BudgetTransaction.findOne({
      requestId: approvedRequest._id,
    });
    expect(updatedTransaction.status).toBe("DISBURSED");
  });
});

describe("Requirements knowledge base", () => {
  test("Approver can create requirements and creators can read them", async () => {
    const approver = await registerUser({
      username: "approver-req",
      email: "approver-req@example.com",
      password: "Password1!",
      role: "APPROVER",
      teamId: "lambda",
    });

    const creator = await registerUser({
      username: "creator-req",
      email: "creator-req@example.com",
      password: "Password1!",
      role: "CREATOR",
      teamId: "lambda",
    });

    const createRequirement = await request(app)
      .post("/api/requirements")
      .set("Authorization", `Bearer ${approver.body.token}`)
      .send({
        title: "Security check",
        rule: "Requests must include a mitigation plan for risks.",
        category: "FEATURE_REQUEST",
        enforcement: "BLOCKING",
        tags: ["security", "risk"],
      });

    expect(createRequirement.status).toBe(201);

    const listRes = await request(app)
      .get("/api/requirements")
      .set("Authorization", `Bearer ${creator.body.token}`);

    expect(listRes.status).toBe(200);
    expect(listRes.body.requirements.length).toBe(1);
    expect(listRes.body.requirements[0].title).toBe("Security check");
  });
});
