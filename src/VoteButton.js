import React from "react";

class VoteButton extends React.Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(e) {
    if (this.props.name === 'Up') {
      this.props.upVote(this.props.id, this.props.votes)
    }
    if (this.props.name === 'Down') {
      this.props.downVote(this.props.id, this.props.votes)
    }
  }
  render() {
    return (
      <div>
        <button onClick={this.handleClick}>{this.props.name}</button>
      </div>
    );
  }
}

export default VoteButton;
