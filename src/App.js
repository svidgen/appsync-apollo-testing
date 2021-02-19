import React, { Component, useState, useEffect } from "react";
import logo from "./logo.svg";
import "./App.css";
import '@aws-amplify/ui/dist/style.css';
import {
  ApolloClient,
  ApolloProvider,
  ApolloLink,
  HttpLink,
  InMemoryCache,
} from "@apollo/client";
import { withAuthenticator } from "aws-amplify-react";
import Amplify, { Auth } from "aws-amplify";
import { createAuthLink } from "aws-appsync-auth-link";
import { createSubscriptionHandshakeLink } from 'aws-appsync-subscription-link';
import aws_exports from "./aws-exports";
import NoteEditor from "./NoteEditor";

Amplify.configure(aws_exports);

let _client;

async function get_client() {
  if (_client) {
    return _client;
  }

  const aws_auth_config = {
    url: aws_exports.aws_appsync_graphqlEndpoint,
    region: aws_exports.aws_appsync_region,
    auth: {
      type: aws_exports.aws_appsync_authenticationType,
      jwtToken: (await Auth.currentSession()).getIdToken().getJwtToken()
    }
  };
  const httpLink = new HttpLink({uri: aws_auth_config.url});
  
  const link = ApolloLink.from([
    createAuthLink(aws_auth_config),
    createSubscriptionHandshakeLink(aws_auth_config, httpLink)
  ]);
  
  _client = new ApolloClient({
    link,
    cache: new InMemoryCache()
  });

  return _client;
};


function App() {
  const [client, setClient] = useState(null);

  useEffect(() => {
    if (!client) {
      get_client().then(setClient);
    }
  }, []);

  if (!client) return (<p>Loading ...</p>);

  return (
    <ApolloProvider client={client}>
      <NoteEditor></NoteEditor>
    </ApolloProvider>
  );

};

export default withAuthenticator(App, true);
