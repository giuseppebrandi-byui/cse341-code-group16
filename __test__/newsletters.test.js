const dotenv = require('dotenv');
dotenv.config();
const { MongoClient } = require('mongodb');
const request = require("supertest");
const { app } = require("../server");
const mongodb = require('../data/database');

describe('Newsletters API Tests', () => {
  let mongoClient;
  let db;
  let server;
  const URI = process.env.MONGODB_URI;

  beforeAll(async () => {
    // Connect to the in-memory database
    mongoClient = await MongoClient.connect(URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    db = mongoClient.db();

    // Replace the database connection in your app with the test database
    jest.spyOn(mongodb, 'getDatabase').mockImplementation(() => ({
      db: () => db
    }));

    // Start the server and store the reference
    server = app.listen(3001);
  });

  afterAll(async () => {
    // Clean up resources
    if (mongoClient) {
      await mongoClient.close();
    }
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
    jest.restoreAllMocks();
  });

  let randomId;

  it("should get all newsletters", async () => {
    const response = await request(app).get("/newsletters");
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(Object.keys(response.body[0])).toEqual(expect.arrayContaining(['_id', 'name', 'email']));
    randomId = response.body[0]['_id'] ?? '';
  });

  it("should get specific newsletters", async () => {
    const response = await request(app).get("/newsletters/" + randomId);
    expect(response.statusCode).toBe(200);
    expect(Object.keys(response.body)).toEqual(expect.arrayContaining(['_id', 'name', 'email']));
  });

});

