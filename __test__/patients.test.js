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

describe('Patients API Tests - GET Endpoints', () => {
  // Test suite-wide variables
  let connection;        // MongoDB connection instance
  let mongoServer;       // MongoDB Memory Server instance
  let db;               // Database instance
  let server;           // Express server instance

  // Create fixed ObjectIds for consistent test data and snapshots
  const testId1 = new ObjectId('679e801fa04d19f37756ea79');
  const testId2 = new ObjectId('679e801fa04d19f37756ea72');
  const testId3 = new ObjectId('679e801fa04d19f37756ea75');

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
   * This ensures each test starts with the same data state
   */
  beforeEach(async () => {
    // Clear all existing data from the patients collection
    await db.collection('patients').deleteMany({});

    // Insert test data with our fixed ObjectIds
    await db.collection('patients').insertMany([
      {
        "_id": testId1,
        "name": "Sofia Adams",
        "dob": "09/18/79",
        "email": "sophia.adams@example.com",
        "address": {
          "street": "567 Maple Street",
          "city": "Villageland",
          "zip": "67890"
        },
        "phone": "555-789-2345",
        "insurer": "National",
        "request": "Morbi posuere enim quis ornare laoreet. Donec imperdiet lacus odio, ut sollicitudin velit vulputate non. Sed mattis dolor purus, vel efficitur metus porta vel. Donec in aliquam nisl. Suspendisse venenatis eros molestie nunc eleifend, vel euismod elit tincidunt."
      },
      {
        "_id": testId2,
        "name": "Jane Smith",
        "dob": "03/10/00",
        "email": "jane.smith@example.com",
        "address": {
          "street": "456 Park Avenue",
          "city": "Townsville",
          "zip": "54321"
        },
        "phone": "555-987-6543",
        "insurer": "The Exeter",
        "request": "Vestibulum dignissim sapien sit amet massa rhoncus posuere. Nunc volutpat ullamcorper magna, vel elementum purus malesuada sed. Phasellus condimentum enim magna, nec feugiat metus imperdiet eget. Ut ut risus laoreet velit sagittis pharetra in nec diam. Proin tincidunt ultrices euismod."
      },
      {
        "_id": testId3,
        "name": "Michael Brown",
        "dob": "07/22/65",
        "email": "michael.brown@example.com",
        "address": {
          "street": "789 Maple Avenue",
          "city": "Cityville",
          "zip": "12345"
        },
        "phone": "555-234-5678",
        "insurer": "Aviva",
        "request": "Cras ligula mi, varius a lorem nec, cursus fringilla elit. Nulla eleifend luctus est et laoreet. Integer suscipit metus eu lectus fringilla, quis iaculis tellus faucibus. Integer lacinia, urna at efficitur auctor, odio ante vehicula tortor, eu lacinia odio neque vitae tellus. Donec eget auctor mauris. Pellentesque sed cursus neque, id dictum leo."
      }

    ]);
  });

  /**
   * GET /patients endpoint tests
   * Tests retrieving the list of all patients
   */
  describe('GET /patients', () => {
    // Test successful retrieval of all patients
    it("should get all patients and match snapshot", async () => {
      const response = await request(app).get("/patients");

      // Verify basic response structure
      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(3);

      // Verify each patient has required fields
      expect(Object.keys(response.body[0])).toEqual(
        expect.arrayContaining([
          '_id',
          'name',
          'dob',
          'email',
          'address',
          'phone',
          'insurer',
          'request'
        ])
      );

      // Verify address structure
      expect(Object.keys(response.body[0].address)).toEqual(
        expect.arrayContaining([
          'street',
          'city',
          'zip'
        ])
      );

      // Verify response matches stored snapshot
      expect(response.body).toMatchSnapshot();
    });

    // Test behavior when no patients exist
    it("should return 400 when no patients exist", async () => {
      // Remove all patients
      await db.collection('patients').deleteMany({});

      const response = await request(app).get("/patients");
      expect(response.statusCode).toBe(400);
      expect(response.body).toMatchSnapshot();
    });
  });

  /**
   * GET /patients/:id endpoint tests
   * Tests retrieving a single patient by ID
   */
  describe('GET /patients/:id', () => {
    // Test successful retrieval of a specific patient
    it("should get specific patient and match snapshot", async () => {
      const response = await request(app)
        .get(`/patients/${testId1.toString()}`);

      expect(response.statusCode).toBe(200);

      // Verify patient data structure
      expect(Object.keys(response.body)).toEqual(
        expect.arrayContaining([
          '_id',
          'name',
          'dob',
          'email',
          'address',
          'phone',
          'insurer',
          'request'
        ])
      );

      // Verify address structure
      expect(Object.keys(response.body.address)).toEqual(
        expect.arrayContaining([
          'street',
          'city',
          'zip'
        ])
      );

      expect(response.body).toMatchSnapshot();
    });

    // Test behavior with invalid ID format
    it("should return 400 for invalid id format", async () => {
      const response = await request(app)
        .get('/patients/invalid-id');

      expect(response.statusCode).toBe(400);
      expect(response.body).toMatchSnapshot();
    });

    // Test behavior with non-existent ID
    it("should return 400 for non-existent id", async () => {
      const nonExistentId = new ObjectId('000000000000000000000099');
      const response = await request(app)
        .get(`/patients/${nonExistentId.toString()}`);

      expect(response.statusCode).toBe(400);
      expect(response.body).toMatchSnapshot();
    });
  });
});