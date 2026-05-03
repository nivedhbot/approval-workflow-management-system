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
