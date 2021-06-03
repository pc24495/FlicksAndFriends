import React, { Component } from "react";
import classes from "./Registration.module.css";
import Input from "./Input/Input.js";
import Button from "../../Components/Button/Button.js";
import axios from "../../../../server/node_modules/axios";
import { connect } from "react-redux";

class Registration extends Component {
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
      password_confirmation: {
        name: "password_confirmation",
        type: "password",
        value: "",
        valid: false,
        placeholder: "Confirm password",
        displayWarning: false,
        warningMessages: [],
        label: "Confirm Password",
      },
    },
    loading: false,
    isValid: false,
  };

  checkValidityLive(value, inputIdentifier) {
    let valid = true;
    let displayWarning = false;
    let warningMessages = [];
    switch (inputIdentifier) {
      case "username":
        if (!(value.length >= 8)) {
          valid = false;
          displayWarning = true;
          warningMessages.push("Username must be at least 8 characters");
        }
        break;
      case "password":
        if (!(value.length >= 8)) {
          valid = false;
          displayWarning = true;
          warningMessages.push("Password must be at least 8 characters");
        }
        break;
      case "password_confirmation":
        if (!(value.length >= 8)) {
          valid = false;
          displayWarning = true;
          warningMessages.push("Password must be at least 8 characters");
        }
        break;
      default:
    }
    return [valid, displayWarning, warningMessages];
  }

  inputChangedHandler = (event, inputIdentifier) => {
    const updatedOrderForm = { ...this.state.orderForm };
    const updatedFormElement = { ...updatedOrderForm[inputIdentifier] };
    updatedFormElement.value = event.target.value;
    updatedFormElement.touched = true;
    [
      updatedFormElement.valid,
      updatedFormElement.displayWarning,
      updatedFormElement.warningMessages,
    ] = this.checkValidityLive(updatedFormElement.value, inputIdentifier);
    updatedOrderForm[inputIdentifier] = updatedFormElement;
    let formIsValid = true;
    for (let field in updatedOrderForm) {
      formIsValid = updatedOrderForm[field].valid && formIsValid;
    }
    this.setState({ orderForm: updatedOrderForm, isValid: formIsValid });
  };

  submitRegistration = (event) => {
    event.preventDefault();
    const updatedOrderForm = { ...this.state.orderForm };
    const hasNumber = /\d/;
    const special = /[ `!@#$%^&*()_+\-=\]{};':"\\|,.<>?~]/;
    let valid = true;
    if (
      !hasNumber.test(updatedOrderForm.password.value) ||
      !special.test(updatedOrderForm.password.value)
    ) {
      updatedOrderForm.password.warningMessages.length = 0;
      updatedOrderForm.password.valid = false;
      updatedOrderForm.password.displayWarning = true;
      updatedOrderForm.password.warningMessages.push(
        "Password must contain at least one number and at least one special character"
      );
      updatedOrderForm.password.valid = false;
    } else {
      updatedOrderForm.password.valid = true;
      updatedOrderForm.password.displayWarning = false;
      updatedOrderForm.password.warningMessages.length = 0;
      updatedOrderForm.password.valid = true;
    }

    if (
      updatedOrderForm.password_confirmation.value !==
      updatedOrderForm.password.value
    ) {
      updatedOrderForm.password_confirmation.warningMessages.length = 0;
      updatedOrderForm.password_confirmation.valid = false;
      updatedOrderForm.password_confirmation.displayWarning = true;
      updatedOrderForm.password_confirmation.warningMessages.push(
        "Passwords do not match"
      );
      updatedOrderForm.password_confirmation.valid = false;
    } else {
      updatedOrderForm.password_confirmation.valid = true;
      updatedOrderForm.password_confirmation.displayWarning = false;
      updatedOrderForm.password_confirmation.warningMessages.length = 0;
    }
    for (let key in updatedOrderForm) {
      valid = valid && updatedOrderForm[key].valid;
    }

    if (valid) {
      // console.log("Valid!");
      axios
        .post("http://localhost:3000/api/register", {
          username: updatedOrderForm.username.value,
          password: updatedOrderForm.password.value,
        })
        .then((res) => {
          // console.log(res.data);
          if (res.data === "User already exists") {
            updatedOrderForm.username.valid = false;
            updatedOrderForm.username.displayWarning = true;
            updatedOrderForm.username.warningMessages.push(
              "Username is taken, please select a different one"
            );
          } else {
            // console.log("Username is unique!");
            axios
              .post("http://localhost:3000/api/login", {
                username: updatedOrderForm.username.value.trim(),
                password: updatedOrderForm.password.value,
              })
              .then((res) => {
                console.log("Setting token");
                localStorage.setItem("token", res.data.token);

                this.props.login(res.data);
                this.props.history.push("/profilepic");
              });
          }
          for (let key in updatedOrderForm) {
            valid = valid && updatedOrderForm[key].valid;
          }
          this.setState({ orderForm: updatedOrderForm, isValid: valid });
        });
    } else {
      this.setState({ orderForm: updatedOrderForm, isValid: valid });
    }

    // console.log("Submitting");
    // this.props.history.push("/");
  };

  render() {
    const formElementsArray = [];
    for (let key in this.state.orderForm) {
      formElementsArray.push({
        config: this.state.orderForm[key],
      });
    }

    return (
      <div>
        <div className={classes.Registration}>
          <form
            onSubmit={(event) => this.submitRegistration(event)}
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
                shouldValidate={formElement.config.validation}
                touched={formElement.config.touched}
                displayWarning={formElement.config.displayWarning}
                warningMessages={formElement.config.warningMessages}
                labelName={formElement.config.label}
                style={{ width: "80%" }}
                className={classes.InputBox}
              />
            ))}
            <Button disabled={this.state.isValid ? "" : "true"}>Submit</Button>
          </form>
        </div>
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

export default connect(mapStateToProps, mapDispatchToProps)(Registration);
