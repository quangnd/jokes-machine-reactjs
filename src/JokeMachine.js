import React from "react";
import axios from "axios";
import VoteButton from "./VoteButton";

class JokeMachine extends React.Component {
  static defaultProps = {
    numJokesToGet: 10
  };
  constructor(props) {
    super(props);
    this.state = { jokes: this.getFromLocalStorage() || [], isLoaded: false };
    this.seenJokes = new Set(this.state.jokes.map(j => j.joke));
    this.handleVote = this.handleVote.bind(this);
  }

  componentDidMount() {
    console.log('in did mount')
    console.log(this.state.jokes.length)
    if (this.state.jokes.length === 0) this.getJokes();
  }

  async getJokes() {
    try {
      console.log('in get Jokes')
      const jokeUrl = "https://icanhazdadjoke.com/";
      const axiosConfig = { headers: { Accept: "application/json" } };
      let jokes = [];

      while(jokes.length < this.props.numJokesToGet) {
        let response = await axios.get(jokeUrl, axiosConfig);
        let newJokeObj = { ...response.data, votes: 0 };
        if (!this.seenJokes.has(response.data.joke)) {
          jokes.push(newJokeObj);
        } else {
          console.log("FOUND A DUPLICATE!");
        }
      }
      console.log(jokes)
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

  handleVote(id, votes, delta) {
    let updatedList = this.state.jokes.map(joke => {
      if (joke.id === id) {
        return { ...joke, votes: votes + delta };
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
    return jokes.sort((a, b) => b.votes - a.votes);
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
              upVote={this.handleVote}
            />
            {joke.votes}
            <VoteButton
              name="Down"
              id={joke.id}
              votes={joke.votes}
              downVote={this.handleVote}
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
