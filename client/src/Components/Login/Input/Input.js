import React, { Component } from "react";

export default class Input extends Component {
  render() {
    if (this.props.displayWarning === true) {
      return (
        <div className={classes.Input}>
          <label className={classes.Label}>{this.props.labelName}</label>
          <input
            className={classes.InputElement}
            type={this.props.type}
            value={this.props.value}
            onChange={this.props.changed}
            placeholder={this.props.placeholder}
            invalid={this.props.invalid}
          />
          {this.props.warningMessages.map((el) => (
            <p className={classes.Warning} key={el}>
              {el}
            </p>
          ))}
        </div>
      );
    } else {
      return (
        <div className={classes.Input}>
          <label className={classes.Label}>{this.props.labelName}</label>
          <input
            className={classes.InputElement}
            type={this.props.type}
            value={this.props.value}
            onChange={this.props.changed}
            placeholder={this.props.placeholder}
            invalid={this.props.invalid}
          />
        </div>
      );
    }
  }
}
