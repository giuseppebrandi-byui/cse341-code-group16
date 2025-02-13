const swaggerAutogen = require("swagger-autogen");

const doc = {
  info: {
    title: "Online Doctor API",
    description:
      "An API to manage medicine practicioners, patients, newsletters and comments",
  },
  host: "cse341-code-group16.onrender.com",
  schemes: ["https"],
  definitions: {
    Comment: {
      _id: "67a15593581f535664c32de7",
      name: "Jason Born",
      username: "jasonborn",
      email: "jason.bourne@example.com",
      comment: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
    },
    Newsletter: {
      _id: "67a15593581f535664c32de7",
      name: "John Doe",
      email: "john.doe@example.com",
    },
    Patient: {
      _id: "679e801fa04d19f37756ea79",
      name: "Sophia Adams",
      dob: "09/18/79",
      email: "sophia.adams@example.com",
      address: {
        street: "567 Maple Street",
        city: "Villageland",
        zip: "67890",
      },
      phone: "555-789-2345",
      insurer: "National",
      request:
        "Morbi posuere enim quis ornare laoreet. Donec imperdiet lacus odio, ut sollicitudin velit vulputate non. Sed mattis dolor purus, vel efficitur metus porta vel. Donec in aliquam nisl. Suspendisse venenatis eros molestie nunc eleifend, vel euismod elit tincidunt.",
    },
    Practitioner: {
      _id: "679e903aa04d19f37756eafa",
      name: "Jessica Wilson",
      specialization: "Cardiovascular Disease",
      dea_number: "C91224313",
      address: {
        street: "467 Elm Street",
        city: "Townsville",
        zip: "54321",
      },
      phone: "555-333-701",
      email: "jessica.wilson@medical.com",
    },
  },
  securityDefinitions: {
    OAuth2: {
      type: "oauth2",
      flow: "authorizationCode",
      authorizationUrl: "/login",
      scopes: { user: "Access user data" },
    },
  },
  security: [
    {
      OAuth2: ["user"],
    },
  ],
};

const outputFile = "./swagger-output.json";
const routes = ["./server.js"];

swaggerAutogen()(outputFile, routes, doc);
