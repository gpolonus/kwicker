
import React, { useState } from 'react';
import './App.css';
import { group, objectLoop, mergeKey } from './utils'
import { v4 as uuid } from 'uuid'

const STATES = {
  done: 'done',
  now: 'now',
  next: 'next'
}

const MetaCzechBox = ({ content: c1, className: cl1 = '' }, { content: c2, className: cl2 = '' }) => ({ checked, onClick = () => {alert('DEFAULT')}, payload }) =>
  <span className="czechbox" onClick={() => onClick(!checked, payload)}>
    {checked
      ? <span className={cl1}>{c1}</span>
      : <span className={cl2}>{c2}</span>
    }
  </span>

const CzechBox = MetaCzechBox(
  { content: '[x]' },
  { content: '[ ]' }
)

const EditCzechBox = MetaCzechBox(
  { content: 'X' },
  { content: 'E' }
)

const DoneWillDo = ({ line, id, date, focus, setFocus, setDone }) => (
  <div className="done willdo">
    <span className={`contents ${focus ? 'focused' : ''}`} onClick={() => setFocus(id)}>
      <CzechBox checked={true} onClick={done => setDone(id, done)} />
      {line}
      <span className='willdo-date'>{date.toLocaleString()}</span>
    </span>
  </div>
)

const NowWillDo = ({ line, id, focus, setFocus, editing, setEditing, editValue, setEditValue, setDone }) => {
  return (
    <div className="now willdo">
      <span className={`contents ${focus ? 'focused' : ''}`} onClick={() => setFocus(id)}>
        <CzechBox checked={false} onClick={done => setDone(id, done)} />
        {editing
          ? <input type="text" value={editValue} onChange={({ target: { value } }) => setEditValue(value)} />
          : line
        }
        <EditCzechBox checked={editing} onClick={setEditing} payload={id} />
      </span>
    </div>
  )
}

const NextWillDo = ({ line, id, focus, setFocus, editing, setEditing, editValue, setEditValue }) => {
  return (
    <div className="next willdo">
      <span className={`contents ${focus ? 'focused' : ''}`} onClick={() => setFocus(id)}>
        {editing
          ? <input type="text" value={editValue} onChange={({ target: { value } }) => setEditValue(value)} />
          : line
        }
        <EditCzechBox checked={editing} onClick={setEditing} payload={id} />
      </span>
    </div>
  )
}

const newWillDo = () => ({
  line: '',
  state: STATES.next,
  id: uuid()
})

function App() {
  const [ state, setWholeState ] = useState({
    willDos: {},
    editing: false,
    editValue: '',
    focus: false
  })

  const {
    willDos: wds,
    editing,
    editValue,
    focus
  } = state

  console.log('rendered', Date.now(), editing, editValue, focus)

  function setState(newState) {
    setWholeState({
      ...state,
      ...newState
    })
  }

  function addWillDo() {
    const willDo = newWillDo()
    console.log('addWillDo', willDo.id, focus, editing)
    setState({
      focus: willDo.id,
      editing: willDo.id,
      willDos: mergeKey(wds, willDo.id, willDo)
    })
  }

  function setFocus(id) {
    console.log('setFocus', id, editing)
    // switch the focus
    // finish editing the old one
      // save the curent value in the old editing
      // and stop the editing
      // and reset the editvalue
    setState({
      focus: id,
      // editing: editing && focus === id && id,
      willDos: mergeKey(wds, id, { line: editValue }),
    })
  }

  function setDone(id, isDone) {
    console.log('setDone')
    setState({
      willDos: mergeKey(wds, id, {
        state: isDone
          ? STATES.done
          : STATES.next,
        date: isDone
          ? new Date()
          : null
      })
    })
  }

  function setEditingCallback(editing, id) {
    console.log('setEditingCallback', editing, id)
    setState({
      editValue: wds[id].line,
      editing: editing && id,
      willDos: mergeKey(wds, id, { line: editValue })
    })
  }

  function setEditValue(editValue) {
    setState({ editValue })
  }

  const focusedWillDos = objectLoop(wds, ([id, wd]) => [id, focus === id ? {...wd, focus: true} : wd])

  let addedEditingWillDos = focusedWillDos
  if(editing) {
    addedEditingWillDos = {
      ...focusedWillDos,
      [editing]: { ...focusedWillDos[editing], editing: true, editValue }
    }
  }

  const {
    [STATES.done]: dones,
    [STATES.now]:  nows,
    [STATES.next]: nexts,
  } = group(Object.values(addedEditingWillDos), 'state')

  return (
    <div className="App">
      <h1>Dones:</h1>
      {dones
        ? dones.map(wd =>
          <DoneWillDo
            key={wd.id}
            {...wd}
            setFocus={setFocus}
            setDone={setDone}
          />
        )
        : null
      }
      <h1>Nows:</h1>
      {nows
        ? nows.map(wd =>
          <NowWillDo
            key={wd.id}
            {...wd}
            setFocus={setFocus}
            setEditing={setEditingCallback}
            setEditValue={setEditValue}
            setDone={setDone}
          />
        )
        : null
      }
      <h1>Nexts:</h1>
      {nexts
        ? nexts.map(wd =>
          <NextWillDo
            key={wd.id}
            {...wd}
            setFocus={setFocus}
            setEditing={setEditingCallback}
            setEditValue={setEditValue}
          />
        )
        : null
      }
      <button onClick={addWillDo}>Add</button>
    </div>
  );
}

export default App;
