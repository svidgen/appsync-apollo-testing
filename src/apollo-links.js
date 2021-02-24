import { API } from "aws-amplify";
import { ApolloLink, Observable } from "@apollo/client";
import { getMainDefinition } from "apollo-utilities";

function createLink() {

  // this is probably even more simple than i've made it. i have a sense that
  // 50% of this can be trimmed away ... but, i need to step AFK to let my brain
  // rest. and when i come back, i may just be happy to continue on to the next
  // problem ... shaving off ~25 LOC may not be a big enough win.
  //
  // ... we'll see.

  return ApolloLink.split(

    // is it a subscription? ... let's ask apollo.
    (operation) => {
      const { query } = operation;
      const { kind, operation: graphqlOperation } = getMainDefinition(query);
      const isSubscription =
        kind === "OperationDefinition" && graphqlOperation === "subscription";
      return isSubscription;
    },

    // yes, it's a subscription. let's subscribe.
    new ApolloLink((operation) => {
      let { query, variables } = operation;
      return new Observable(observer => {
        return API.graphql({ query, variables })
          .map(result => result.value)
          .subscribe(observer)
          .unsubscribe
        ;
      });
    }),

    // nope! not a subscription. execute a regular query and `complete()` as soon
    // as we've sent a result to the observer.
    new ApolloLink((operation) => {
      let { query, variables } = operation;
      return new Observable((observer) => {
        let q = API.graphql({ query, variables });
        q.then((r) => {
          observer.next(r);
          observer.complete();
        });
        q.catch((e) => {
          observer.error(e);
        });
        return () => API.cancel(q);
      });
    })

  );
}

export default createLink;
