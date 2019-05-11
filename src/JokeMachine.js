import React from "react";
import axios from "axios";
import uuid from "uuid/v4";
import VoteButton from "./VoteButton";
import "./JokeMachine.css";

class JokeMachine extends React.Component {
  static defaultProps = {
    numJokesToGet: 10
  };
  constructor(props) {
    super(props);
    this.state = { jokes: this.getFromLocalStorage() || [], isLoaded: false };
    this.seenJokes = new Set(this.state.jokes.map(j => j.joke));
    this.handleVote = this.handleVote.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  componentDidMount() {
    if (this.state.jokes.length === 0) {
      this.getJokes();
    } else {
      this.setState({ isLoaded: true });
    }
  }

  async getJokes() {
    try {
      const jokeUrl = "https://icanhazdadjoke.com/";
      const axiosConfig = { headers: { Accept: "application/json" } };
      let jokes = [];

      while (jokes.length < this.props.numJokesToGet) {
        let response = await axios.get(jokeUrl, axiosConfig);
        let newJokeObj = { id: uuid(), joke: response.data.joke, votes: 0 };
        if (!this.seenJokes.has(response.data.joke)) {
          jokes.push(newJokeObj);
        }
      }
      this.setState(
        st => ({
          jokes: st.jokes.concat(jokes),
          isLoaded: !st.isLoaded
        }),
        () => {
          this.updateLocalStorage(this.state.jokes);
        }
      );
    } catch (e) {
      alert(e);
      this.setState({ isLoaded: true });
    }
  }

  updateLocalStorage(jokes) {
    localStorage.setItem("jokes", JSON.stringify(jokes));
  }

  getFromLocalStorage() {
    return JSON.parse(localStorage.getItem("jokes"));
  }

  getFeeling(e) {
    let votes = e.votes;
    let feeling = "normal 😃";
    if (votes < 0) {
      feeling = "bad 😔";
    }
    if (votes < -3) {
      feeling = "very bad 😣";
    }
    if (votes < -8) {
      feeling = "terrible 😖";
    }
    if (votes === 0) {
      feeling = "normal 😃";
    }
    if (votes > 3) {
      feeling = "good 😆";
    }
    if (votes > 6) {
      feeling = "excellent 🤣";
    }
    return feeling;
  }

  handleClick() {
    this.setState({ isLoaded: false }, this.getJokes);
  }

  handleVote(id, votes, delta) {
    let updatedList = this.state.jokes.map(joke => {
      return joke.id === id ? { ...joke, votes: votes + delta } : joke;
    });
    this.setState({ jokes: updatedList }, () =>
      this.updateLocalStorage(this.state.jokes)
    );
  }

  renderJoke() {
    let trTables = [];
    let jokes = this.state.jokes.sort((a, b) => b.votes - a.votes);
    trTables = jokes.map(joke => (
      <tr key={joke.id}>
        <td>
          <VoteButton
            name="Up"
            id={joke.id}
            votes={joke.votes}
            upVote={this.handleVote}
          />
          <span className="JokeMachine-joke">{joke.votes}</span>
          <VoteButton
            name="Down"
            id={joke.id}
            votes={joke.votes}
            downVote={this.handleVote}
          />
        </td>
        <td>{joke.joke}</td>
        <td>
          <span className="JokeMachine-feeling">{this.getFeeling(joke)}</span>
        </td>
      </tr>
    ));

    return trTables;
  }
  render() {
    return (
      <div className="JokeMachine">
        <h1>🤣Jokes Machine 🤣</h1>
        <p className="JokeMachine-author">
          Made by{" "}
          <a
            href="https://github.com/quangnd/jokes-machine-reactjs"
            target="_blank"
            rel="noopener noreferrer"
          >
            Mun
          </a>{" "}
          with ❤️
        </p>
        <h3>
          <button
            className={
              this.state.isLoaded
                ? "JokeMachine-button"
                : "JokeMachine-button-disable"
            }
            onClick={this.handleClick}
            disabled={!this.state.isLoaded}
          >
            Generate Jokes
          </button>
        </h3>
        {this.state.isLoaded ? (
          <div>
            <p>Total jokes: {this.state.jokes.length} </p>
            <table
              border="1"
              style={{ marginLeft: "auto", marginRight: "auto" }}
            >
              <tbody>{this.renderJoke()}</tbody>
            </table>
          </div>
        ) : (
          "Getting jokes...."
        )}
      </div>
    );
  }
}

export default JokeMachine;
