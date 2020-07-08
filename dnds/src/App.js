import React from "react";
import logo from "./logo.png";
import "./App.css";
import { Auth, API, graphqlOperation } from "aws-amplify";
import awsconfig from "./aws-exports";
import { withAuthenticator } from "aws-amplify-react";
import "@aws-amplify/ui/dist/style.css";
import * as queries from "./graphql/queries";
import * as mutations from "./graphql/mutations";
import BusyForm from "./components";
Auth.configure(awsconfig);
API.configure(awsconfig);

function App() {
  // API.graphql(graphqlOperation(queries.listUserSchedules)).then((data) => {
  //   console.log(data);
  // });

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
      </header>
      <div className="App-body">
        <BusyForm></BusyForm>
      </div>
    </div>
  );
}

export default withAuthenticator(App, {
  includeGreetings: true,
  signUpConfig: {
    hiddenDefaults: ["phone_number"],
    signUpFields: [{ key: "phone_number", required: false }],
  },
});
