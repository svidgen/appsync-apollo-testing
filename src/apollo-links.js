import { API } from "aws-amplify";
import { ApolloLink, Observable } from "@apollo/client";

function createLink() {
  return new ApolloLink(operation => {
    let query = API.graphql(operation);
    if (query.subscribe) {
      return new Observable(observer => {
        return query.map(result => result.value).subscribe(observer).unsubscribe;
      });
    } else {
      return new Observable((observer) => {
        query.then((r) => {
          observer.next(r);
          observer.complete();
        });
        query.catch((e) => {
          observer.error(e);
        });
        return () => API.cancel(query);
      });
    }
  });
}

export default createLink;
