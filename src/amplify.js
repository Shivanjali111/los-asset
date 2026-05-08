import { Amplify } from "aws-amplify";

Amplify.configure({
  API: {
    GraphQL: {
      endpoint:
        "https://nrpmhfv7ifeljj4g3lyljsfqcy.appsync-api.ap-south-1.amazonaws.com/graphql",
      region: "ap-south-1",
      defaultAuthMode: "apiKey",
      apiKey: "da2-2ndczobjsbbfzg47lacvecyuou",
    },
  },
});