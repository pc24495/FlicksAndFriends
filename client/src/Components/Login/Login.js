import React, { Component } from "react";
import { connect } from "react-redux";
import Input from "../Registration/Input/Input.js";
import classes from "./Login.module.css";
import Button from "../Button/Button.js";
import axios from "axios";

class Login extends Component {
  state = {
    orderForm: {
      username: {
        name: "username",
        type: "text",
        value: "",
        valid: false,
        placeholder: "Enter a username",
        displayWarning: false,
        warningMessages: [],
        label: "Username",
      },
      password: {
        name: "password",
        type: "password",
        value: "",
        valid: false,
        placeholder: "Enter a password",
        displayWarning: false,
        warningMessages: [],
        label: "Password",
      },
    },
    loading: false,
    isValid: false,
  };

  checkValidityLive(value, inputIdentifier) {
    return true;
  }

  submitLogin = async (event) => {
    axios.defaults.withCredentials = true;
    event.preventDefault();
    const updatedOrderForm = { ...this.state.orderForm };
    let valid = true;
    if (updatedOrderForm.username.value.length === 0) {
      updatedOrderForm.username.warningMessages.length = 0;
      updatedOrderForm.username.valid = false;
      updatedOrderForm.username.warningMessages.push("Please enter a username");
      updatedOrderForm.username.displayWarning = true;
    } else {
      updatedOrderForm.username.warningMessages.length = 0;
      updatedOrderForm.username.valid = true;
      updatedOrderForm.username.displayWarning = false;
    }

    if (updatedOrderForm.password.value.length === 0) {
      updatedOrderForm.password.warningMessages.length = 0;
      updatedOrderForm.password.valid = false;
      updatedOrderForm.password.warningMessages.push("Please enter a password");
      updatedOrderForm.password.displayWarning = true;
    } else {
      updatedOrderForm.password.warningMessages.length = 0;
      updatedOrderForm.password.valid = true;
      updatedOrderForm.password.displayWarning = false;
    }

    for (let key in updatedOrderForm) {
      valid = valid && updatedOrderForm[key].valid;
    }

    if (valid) {
      //   console.log("Valid");
      axios
        .post("http://localhost:3000/api/login", {
          username: updatedOrderForm.username.value.trim(),
          password: updatedOrderForm.password.value,
        })
        .then((res) => {
          // console.log(res.data);

          if (res.data.auth) {
            localStorage.setItem("token", res.data.token);
            this.props.login(res.data.result.username);
            // console.log(res.data);
            this.props.history.push("/");
          } else {
            updatedOrderForm.password.warningMessages.length = 0;
            updatedOrderForm.password.valid = false;
            updatedOrderForm.password.warningMessages.push(
              "Wrong username/password combination"
            );
            updatedOrderForm.password.displayWarning = true;
            for (let key in updatedOrderForm) {
              valid = valid && updatedOrderForm[key].valid;
            }
            this.setState({ orderForm: updatedOrderForm, isValid: valid });
          }
        });
      //   console.log(response);
    } else {
      // console.log("Invalid!");
      this.setState({ orderForm: updatedOrderForm, isValid: valid });
    }
  };

  userAuthenticated = () => {
    axios.get("http://localhost:3000/api/isUserAuth", {
      headers: {
        "x-access-token": localStorage.getItem("token"),
      },
    });
    // .then((response) => console.log(response));
  };

  inputChangedHandler = (event, inputIdentifier) => {
    const updatedOrderForm = { ...this.state.orderForm };
    const updatedFormElement = { ...updatedOrderForm[inputIdentifier] };
    updatedFormElement.value = event.target.value;
    updatedFormElement.valid = this.checkValidityLive(
      updatedFormElement.value,
      inputIdentifier
    );
    let formIsValid = true;
    updatedOrderForm[inputIdentifier] = updatedFormElement;
    for (let field in updatedOrderForm) {
      formIsValid = formIsValid && updatedOrderForm[field].valid;
    }
    this.setState({ orderForm: updatedOrderForm, isValid: formIsValid });
  };

  render() {
    const formElementsArray = [];
    for (let key in this.state.orderForm) {
      formElementsArray.push({
        config: this.state.orderForm[key],
      });
    }

    return (
      <div className={classes.Login}>
        <form
          onSubmit={(event) => this.submitLogin(event)}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            width: "100%",
          }}
        >
          {formElementsArray.map((formElement) => (
            <Input
              key={formElement.config.name}
              type={formElement.config.type}
              placeholder={formElement.config.placeholder}
              value={formElement.config.value}
              changed={(event) =>
                this.inputChangedHandler(event, formElement.config.name)
              }
              invalid={formElement.config.valid ? "false" : "true"}
              touched={formElement.config.touched}
              displayWarning={formElement.config.displayWarning}
              warningMessages={formElement.config.warningMessages}
              labelName={formElement.config.label}
            />
          ))}
          <Button disabled={""}>Submit</Button>
        </form>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    loggedIn: state.loggedIn,
    user: state.user,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    login: (user) => dispatch({ type: "LOGIN", user: user }),
    logout: () => dispatch({ type: "LOGOUT" }),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Login);
