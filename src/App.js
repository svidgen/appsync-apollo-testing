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
import createLink from "./apollo-links";
import aws_exports from "./aws-exports";
import NoteEditor from "./NoteEditor";

Amplify.configure(aws_exports);

let _client;

async function get_client() {
  if (_client) {
    return _client;
  }
  
  const link = createLink();
  
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
