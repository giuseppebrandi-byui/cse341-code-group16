const { MongoClient } = require('mongodb');
const request = require("supertest");
const { app, initializeApp } = require("../server");
const mongodb = require('../data/database');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { ObjectId } = require('mongodb');

// Bypass the real authentication
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

describe('Practitioners API Tests - GET Endpoints', () => {
  // Test suite-wide variables
  let connection;        // MongoDB connection instance
  let mongoServer;       // MongoDB Memory Server instance
  let db;               // Database instance
  let server;           // Express server instance

  // Create fixed ObjectIds for consistent test data and snapshots
  const testId1 = new ObjectId('67adf59d365e6487fa46ef12');
  const testId2 = new ObjectId('67adf59d365e6487fa46ef13');
  const testId3 = new ObjectId('67adf59d365e6487fa46ef14');
  const testId4 = new ObjectId('67adf59d365e6487fa46ef15');

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
    // Clear all existing data from the practitioners collection
    await db.collection('practitioners').deleteMany({});

    // Insert test data with our fixed ObjectIds
    await db.collection('practitioners').insertMany([
      {
        "_id": testId1,
        "name": "Jeff Morrell",
        "specialization": "Allergy & Immunology", "dea_number": "C91234563",
        "address": {
          "street": "256 Beverly Street",
          "city": "Cityville",
          "zip": "12345"
        },
        "phone": "555-133-3527",
        "email": "jeff.morrell@yourhealth.com"
      },
      {
        "_id": testId2,
        "name": "Laura Jones",
        "specialization": "Behavioral Health",
        "dea_number": "B81234353",
        "address": {
          "street": "433 Park Avenue",
          "city": "Townsville",
          "zip": "54321"
        },
        "phone": "555-987-6543",
        "email": "laura.jones@healthcenter.com"
      },
      {
        "_id": testId3,
        "name": "James Norton Jr",
        "specialization": "Endocrinology and Metabolism",
        "dea_number": "B81222353",
        "address": {
          "street": "766 Wood Lane",
          "city": "Villageland",
          "zip": "67890"
        },
        "phone": "555-456-7000",
        "email": "james.norton@we-care.com"
      },
      {
        "_id": testId4,
        "name": "Jessica Wilson",
        "specialization": "Cardiovascular Disease",
        "dea_number": "C91224313",
        "address": {
          "street": "467 Elm Street",
          "city": "Townsville",
          "zip": "54321"
        },
        "phone": "555-333-7010",
        "email": "jessica.wilson@medical.com"
      }
    ]);
  });

  /**
   * GET /practitioners endpoint tests
   * Tests retrieving the list of all practitioners
   */
  describe('GET /practitioners', () => {
    // Test successful retrieval of all practitioners
    it("should get all practitioners and match snapshot", async () => {
      const response = await request(app).get("/practitioners");

      // Verify basic response structure
      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(4);

      // Verify each practitioner has required fields
      expect(Object.keys(response.body[0])).toEqual(
        expect.arrayContaining([
          '_id',
          'name',
          'specialization',
          'dea_number',
          'address',
          'phone',
          'email'
        ])
      );

      // Verify response matches stored snapshot
      expect(response.body).toMatchSnapshot();
    });

    // Test behavior when no practitioners exist
    it("should return 400 when no practitioners exist", async () => {
      // Remove all practitioners
      await db.collection('practitioners').deleteMany({});

      const response = await request(app).get("/practitioners");
      expect(response.statusCode).toBe(400);
      expect(response.body).toMatchSnapshot();
    });
  });

  /**
   * GET /practitioners/:id endpoint tests
   * Tests retrieving a single practitioner by ID
   */
  describe('GET /practitioners/:id', () => {
    // Test successful retrieval of a specific practitioner
    it("should get specific practitioner and match snapshot", async () => {
      const response = await request(app)
        .get(`/practitioners/${testId1.toString()}`);

      expect(response.statusCode).toBe(200);
      expect(Object.keys(response.body)).toEqual(
        expect.arrayContaining([
          '_id',
          'name',
          'specialization',
          'dea_number',
          'address',
          'phone',
          'email'
        ])
      );

      expect(response.body).toMatchSnapshot();
    });

    // Test behavior with invalid ID format
    it("should return 400 for invalid id format", async () => {
      const response = await request(app)
        .get('/practitioners/invalid-id');

      expect(response.statusCode).toBe(400);
      expect(response.body).toMatchSnapshot();
    });

    // Test behavior with non-existent ID
    it("should return 400 for non-existent id", async () => {
      const nonExistentId = new ObjectId('000000000000000000000099');
      const response = await request(app)
        .get(`/practitioners/${nonExistentId.toString()}`);

      expect(response.statusCode).toBe(400);
      expect(response.body).toMatchSnapshot();
    });
  });

  /**
   * GET /practitioners/zip/:zip endpoint tests
   * Tests retrieving practitioners by zip code
   */
  describe('GET /practitioners/zip/:zip', () => {
    // Test successful retrieval of practitioners by zip
    it("should get practitioners by zip and match snapshot", async () => {
      const response = await request(app)
        .get('/practitioners/zip/12345');

      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body).toMatchSnapshot();
    });

    // Test behavior when no practitioners exist in zip code
    it("should return 400 when no practitioners exist in zip", async () => {
      const response = await request(app)
        .get('/practitioners/zip/99999');

      expect(response.statusCode).toBe(400);
      expect(response.body).toMatchSnapshot();
    });
  });
});