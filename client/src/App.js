import "./App.css";
import Layout from "./Components/Layout/Layout.js";
import MainSection from "./Components/MainSection/MainSection.js";
import axios from "axios";
import { Route, Switch } from "react-router-dom";
import Registration from "./Components/Registration/Registration.js";
// import logo from "./logo.svg";
// import TestComponent from "./Components/TestComponent.js";
// import TestComponent from "./Components/TestComponent.js";

function App() {
  axios.defaults.withCredentials = true;

  return (
    <div>
      <Layout>
        <Switch>
          <Route path="/registration" component={Registration} />
          <Route path="/" component={MainSection} />
        </Switch>
      </Layout>
    </div>
  );
}

export default App;
