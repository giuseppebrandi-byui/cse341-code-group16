const { MongoClient } = require('mongodb');
const request = require("supertest");
const { app, initializeApp } = require("../server");
const mongodb = require('../data/database');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { ObjectId } = require('mongodb');

jest.mock('passport-github2', () => ({
  Strategy: jest.fn((options, verify) => ({
    name: 'github',
    authenticate: jest.fn(),
    options,
    verify
  }))
}));


// Increase Jest's default timeout to allow for MongoDB Memory Server startup
jest.setTimeout(30000);

describe('Newsletters API Tests - GET Endpoints', () => {
  // Test suite-wide variables
  let connection;        // MongoDB connection instance
  let mongoServer;       // MongoDB Memory Server instance
  let db;               // Database instance
  let server;           // Express server instance

  // Create fixed ObjectIds for consistent test data and snapshots
  // Using predictable IDs makes our snapshots deterministic
  const testId1 = new ObjectId('679e81faa04d19f37756ea87');
  const testId2 = new ObjectId('679e81faa04d19f37756ea88');

  /**
   * Before all tests:
   * 1. Create an in-memory MongoDB server
   * 2. Connect to the in-memory database
   * 3. Mock the database functions
   * 4. Initialize the Express app
   */
  beforeAll(async () => {
    // Create and start MongoDB Memory Server
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    // Connect to the in-memory database
    connection = await MongoClient.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    db = connection.db();

    // Mock the database.getDatabase() function to return our test db
    jest.spyOn(mongodb, 'getDatabase').mockImplementation(() => ({
      db: () => db
    }));

    // Mock the database.initDb() function to simulate successful initialization
    jest.spyOn(mongodb, 'initDb').mockImplementation((callback) => {
      callback(null, connection);
    });

    // Initialize the Express app with our mocked database
    await initializeApp();
    // Start the server on a test port (3001)
    server = app.listen(3001);
  }, 30000); // 30 second timeout for setup

  /**
   * After all tests:
   * Clean up all resources to prevent memory leaks
   */
  afterAll(async () => {
    // Close MongoDB connection if it exists
    if (connection) {
      await connection.close();
    }
    // Stop the in-memory MongoDB server
    if (mongoServer) {
      await mongoServer.stop();
    }
    // Close the Express server
    if (server) {
      await server.close();
    }
    // Restore all mocked functions to their original implementations
    jest.restoreAllMocks();
  });

  /**
   * Before each test:
   * Reset the database to a known state with predictable test data
   */
  beforeEach(async () => {
    // Clear all existing data from the newsletters collection
    await db.collection('newsletters').deleteMany({});

    // Insert test data with our fixed ObjectIds
    await db.collection('newsletters').insertMany([
      {
        "_id": testId1,
        "name": "John Doe",
        "email": "john.doe@example.com"
      },
      {
        _id: testId2,
        name: "Michael Johnson",
        email: "michael.johnson@example.com"
      }
    ]);
  });

  /**
   * GET /newsletters endpoint tests
   * Tests retrieving the list of all newsletters
   */
  describe('GET /newsletters', () => {
    // Test successful retrieval of all newsletters
    it("should get all newsletters and match snapshot", async () => {
      const response = await request(app).get("/newsletters");

      // Verify basic response structure
      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);

      // Verify each newsletter has required fields
      expect(Object.keys(response.body[0])).toEqual(
        expect.arrayContaining(['_id', 'name', 'email'])
      );

      // Verify response matches stored snapshot
      // No need to mask _id since we're using consistent ObjectIds
      expect(response.body).toMatchSnapshot();
    });

    // Test behavior when no newsletters exist
    it("should return 400 when no newsletters exist", async () => {
      // Remove all newsletters
      await db.collection('newsletters').deleteMany({});

      const response = await request(app).get("/newsletters");
      expect(response.statusCode).toBe(400);
      expect(response.body).toMatchSnapshot();
    });
  });

  /**
   * GET /newsletters/:id endpoint tests
   * Tests retrieving a single newsletter by ID
   */
  describe('GET /newsletters/:id', () => {
    // Test successful retrieval of a specific newsletter
    it("should get specific newsletter and match snapshot", async () => {
      const response = await request(app)
        .get(`/newsletters/${testId1.toString()}`);

      expect(response.statusCode).toBe(200);
      expect(Object.keys(response.body)).toEqual(
        expect.arrayContaining(['_id', 'name', 'email'])
      );

      expect(response.body).toMatchSnapshot();
    });

    // Test behavior with invalid ID format
    it("should return 400 for invalid id format", async () => {
      const response = await request(app)
        .get('/newsletters/invalid-id');

      expect(response.statusCode).toBe(400);
      expect(response.body).toMatchSnapshot();
    });

    // Test behavior with non-existent ID
    it("should return 400 for non-existent id", async () => {
      const nonExistentId = new ObjectId('000000000000000000000099');
      const response = await request(app)
        .get(`/newsletters/${nonExistentId.toString()}`);

      expect(response.statusCode).toBe(400);
      expect(response.body).toMatchSnapshot();
    });
  });
});