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
      name: "Jason Born",
      username: "jasonborn",
      email: "jason.bourne@example.com",
      comment: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
    },
    Newsletter: {
      name: "John Doe",
      email: "john.doe@example.com",
    },
  },
  //   securityDefinitions: { // This is not implemented yet
  //     OAuth2: {
  //       type: "oauth2",
  //       flow: "authorizationCode",
  //       authorizationUrl: "/login",
  //       scopes: { user: "Access user data" },
  //     },
  //   },
  //   security: [
  //     {
  //       OAuth2: ["user"],
  //     },
  //   ],
};

const outputFile = "./swagger-output.json";
const routes = ["./server.js"];

swaggerAutogen()(outputFile, routes, doc);
