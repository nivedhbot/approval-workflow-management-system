const mongoose = require("mongoose");
const request = require("supertest");
const { MongoMemoryServer } = require("mongodb-memory-server");
const User = require("../models/User");
const Request = require("../models/Request");

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
