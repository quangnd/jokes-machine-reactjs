import React from "react";
import axios from "axios";
import VoteButton from "./VoteButton";

class JokeMachine extends React.Component {
  constructor(props) {
    super(props);
    this.state = { jokes: [], isLoaded: false };
    this.handleUpVote = this.handleUpVote.bind(this);
    this.handleDownVote = this.handleDownVote.bind(this);
  }

  async componentDidMount() {
    if (!localStorage.getItem("jokes")) {
      const jokeUrl = "https://icanhazdadjoke.com/";
      const axiosConfig = { headers: { Accept: "application/json" } };
      let jokes = [];
      for (let i = 0; i < 10; i++) {
        let response = await axios.get(jokeUrl, axiosConfig);
        let newJokeObj = { ...response.data, votes: 0 };
        jokes.push(newJokeObj);
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
    } else {
      let jokes = this.getFromLocalStorage()
      this.setState(st => ({
        jokes: st.jokes.concat(jokes),
        isLoaded: !st.isLoaded
      }));
    }
  }

  updateLocalStorage(jokes) {
    localStorage.setItem("jokes", JSON.stringify(jokes));
  }

  getFromLocalStorage() {
    return JSON.parse(localStorage.getItem("jokes"));
  }

  handleDownVote(id, votes) {
    let updatedList = this.state.jokes.map(joke => {
      if (joke.id === id) {
        return { ...joke, votes: --votes };
      }
      return joke;
    });
    this.setState({ jokes: updatedList }, () =>
      this.updateLocalStorage(this.state.jokes)
    );
  }

  handleUpVote(id, votes) {
    let updatedList = this.state.jokes.map(joke => {
      if (joke.id === id) {
        return { ...joke, votes: ++votes };
      }
      return joke;
    });
    this.setState({ jokes: updatedList }, () =>
      this.updateLocalStorage(this.state.jokes)
    );
  }

  getFeeling(e) {
    let votes = e.votes;
    let feeling = "neutral";
    if (votes < 0) {
      feeling = "bad";
    }
    if (votes < -3) {
      feeling = "very bad";
    }
    if (votes === 0) {
      feeling = "neutral";
    }
    if (votes > 3) {
      feeling = "good";
    }
    if (votes > 6) {
      feeling = "excellent";
    }
    return feeling;
  }
  sortDesc(jokes) {
    return jokes.sort((a, b) => {
      if (a.votes > b.votes) return -1;
      return 1;
    });
  }
  render() {
    let trTables = [];
    if (this.state.jokes.length) {
      this.sortDesc(this.state.jokes);
      trTables = this.state.jokes.map(joke => (
        <tr key={joke.id}>
          <td>
            <VoteButton
              name="Up"
              id={joke.id}
              votes={joke.votes}
              upVote={this.handleUpVote}
            />
            {joke.votes}
            <VoteButton
              name="Down"
              id={joke.id}
              votes={joke.votes}
              downVote={this.handleDownVote}
            />
          </td>
          <td>{joke.joke}</td>
          <td>{this.getFeeling(joke)}</td>
        </tr>
      ));
    }
    return (
      <div className="JokeMachine">
        <h1>🤣Jokes Machine 🤣</h1>
        <h3>
          <button>New Jokes</button>
        </h3>
        {this.state.isLoaded ? (
          <table border="1">
            <tbody>{trTables}</tbody>
          </table>
        ) : (
          "Loading"
        )}
      </div>
    );
  }
}

export default JokeMachine;
