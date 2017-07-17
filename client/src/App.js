import React, { Component } from 'react';
import axios from 'axios';
import './App.css';

const getWordsFromText = text =>
  text.split('\n').map(w => w.trim()).filter(a => a);

class App extends Component {
  constructor() {
    super();

    this.state = {
      text: '',
      results: {},
      loading: false,
    };

    this.search = this.search.bind(this);
  }

  search() {
    const { text, results } = this.state;
    const words = getWordsFromText(text);
    if (words.length < 1) {
      return;
    }
    this.setState({ loading: true });

    const getResult = index => {
      if (results[words[index]]) {
        // Get the result for the next word, if there is one
        if (index + 1 < words.length) {
          getResult(index + 1);
        } else {
          this.setState({ loading: false });
        }

        return;
      }

      axios
        .post('/query', { phrase: words[index] })
        .then(res => {
          this.setState(state => ({
            results: {
              ...state.results,
              [words[index]]: res.data.category,
            },
          }));

          // Get the result for the next word, if there is one
          if (index + 1 < words.length) {
            getResult(index + 1);
          } else {
            this.setState({ loading: false });
          }
        })
        .catch(err => {
          console.error(err); // eslint-disable-line no-console
          this.setState({ loading: false });
        });
    };

    getResult(0);
  }

  render() {
    const { text, results, loading } = this.state;

    return (
      <div>
        <button disabled={loading} onClick={this.search}>
          {loading ? '読み込み中。。' : '分類'}
        </button>

        <textarea
          placeholder={'1行に1項目ずつを入力し、\n「分類」ボタンを押してください'}
          value={text}
          rows={10}
          cols={40}
          onChange={event => this.setState({ text: event.target.value })}
        />

        <table>
          <tbody>
            {getWordsFromText(text).map(word =>
              <tr key={word}>
                <td>
                  {word}
                </td>
                <td>
                  {(results[word] && results[word].classes[0].class_name) ||
                    '???'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  }
}

export default App;
