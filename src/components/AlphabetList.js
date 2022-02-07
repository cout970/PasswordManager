import {Alphabet} from './Alphabet';
import {getAndIncrementId} from '../storage';

export function AlphabetList({alphabets, setAlphabets}) {
  const addAlphabet = () => {
    setAlphabets([...alphabets, createAlphabet()]);
  };

  const setAlphabet = (newValue) => {
    if (typeof newValue === 'string') {
      setAlphabets(alphabets.filter(service => service.id !== newValue));
    } else {
      setAlphabets(alphabets.map(service => service.id === newValue.id ? validateAlphabet(newValue) : service));
    }
  };

  let content = <div>There are no stored alphabets</div>;
  if (alphabets.length) {
    content = alphabets.map(s =>
      <Alphabet
        key={'alphabet-' + s.id}
        alphabet={s}
        onChange={setAlphabet}
      />,
    );
  }

  return <div className="alphabet-list">
    <h2>Alphabets</h2>
    <div className="list-header">
      <button className="btn add-alphabet" onClick={addAlphabet}>Add alphabet</button>
    </div>
    {content}
  </div>;
}

/**
 * Creates a new alphabet
 * @returns {{}}
 */
export function createAlphabet() {
  let index = getAndIncrementId('alphabet-index');

  return {
    id: 'alphabet-' + index,
    name: 'Alphabet #' + index,
    summary: 'Summary',
    chars: '0123456789',
  };
}

export function validateAlphabet(alphabet) {
  return alphabet;
}