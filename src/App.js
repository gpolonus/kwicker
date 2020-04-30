
import React, { useState, useEffect } from 'react';
import './App.css';
import { swapListItem, filterOut, posmod as mod } from './utils'
import { v4 as uuid } from 'uuid'
import Mousetrap from 'mousetrap'

const TYPES = {
  done: 0,
  now: 1,
  next: 2
}

const getInitialState = () => {
  let state = localStorage.getItem('state')
  if(state) {
    state = JSON.parse(state);
    if(stateIsValid(state)) {
      return state
    }
  }

  return ({
    [TYPES.done]: [],
    [TYPES.now]: [],
    [TYPES.next]: []
  })
}

const stateIsValid = (state) =>
  !!state[TYPES.done] &&
  !!state[TYPES.now] &&
  !!state[TYPES.next]

const initialState = getInitialState()

function App() {
  const [ state, setState ] = useState(initialState)
  const [ focus, setFocus ] = useState({})
  console.log(focus)
  useEffect(() => {
    Mousetrap.bind('up', () => setNewFocus(-1, 0))
    Mousetrap.bind('down', () => setNewFocus(1, 0))
    Mousetrap.bind('left', () => setNewFocus(0, -1))
    Mousetrap.bind('right', () => setNewFocus(0, 1))
    Mousetrap.bind('ctrl+up', () => {})
    Mousetrap.bind('ctrl+down', () => {})
    Mousetrap.bind('ctrl+left', () => {})
    Mousetrap.bind('ctrl+right', () => {})
  })

  localStorage.setItem('state', JSON.stringify(state))

  const {
    [TYPES.done]: dones,
    [TYPES.now]: nows,
    [TYPES.next]: nexts
  } = state

  const setDones = (donesList) => setPartialState({
    dones: donesList
  })

  const setNows = (nowsList) => setPartialState({
    nows: nowsList
  })

  const setNexts = (nextsList) => setPartialState({
    nexts: nextsList
  })

  const setPartialState = ({ dones, nows, nexts }) => setState({
    [TYPES.done]: dones || state[TYPES.done],
    [TYPES.now]: nows || state[TYPES.now],
    [TYPES.next]: nexts || state[TYPES.next]
  })

  const setNewFocus = (vert, horz) => {
    let { index, type } = focus
    switch(horz) {
      case -1:
        type = type !== undefined ? mod(type - 1, 3) : TYPES.done
        break
      case 0:
        type = type !== undefined ? type : TYPES.now
        break
      case 1:
        type = type !== undefined ? mod(type + 1, 3) : TYPES.next
        break
      default:
    }

    const length = state[type].length
    switch(vert) {
      case -1:
        index = index !== undefined ? mod(index - 1, length) : length - 1
        break
      case 0:
        index = index !== undefined ? index : 0
        break
      case 1:
        index = index !== undefined ? mod(index + 1, length) : 0
        break
      default:
    }

    // TODO: match up the indexes if its too big for a column
    if(state[type]) {
      // if()
      setFocus({ index, type })
    } else {
      setFocus({})
    }
  }

  const isFocused = (index, type) => index === focus.index && type === focus.type

  const addNext = () => {
    setNexts([
      ...nexts,
      {
        id: uuid(),
        content: ''
      }
    ])
  }

  const editNext = (id, content) => {
    const newNext = { id, content }
    setNexts(swapListItem(nexts, newNext))
  }

  const moveTo = (item, fromType, toType) => () => {
    let newDones = dones;
    let newNows = nows;
    let newNexts = nexts;
    switch(fromType) {
      case TYPES.done:
        newDones = filterOut(dones, item)
        break
      case TYPES.now:
        newNows = filterOut(nows, item)
        break
      case TYPES.next:
        newNexts = filterOut(nexts, item)
        break
      default:
    }

    switch (toType) {
      case TYPES.done:
        newDones = [...dones, item]
        break
      case TYPES.now:
        newNows = [...nows, item]
        break
      case TYPES.next:
        newNexts = [...nexts, item]
        break
      default:
    }

    setPartialState({
      dones: newDones,
      nows: newNows,
      nexts: newNexts
    })
  }

  const remove = (item, type) => () => {
    const sure = window.confirm('Sure?')
    if(sure) {
      switch(type) {
        case TYPES.done:
          setDones(filterOut(dones, item))
          break
        case TYPES.now:
          setNows(filterOut(nows, item))
          break
        case TYPES.next:
          setNexts(filterOut(nexts, item))
          break
        default:
      }
    }
  }

  return (
    <div className='App'>
      <div className='column'>
        <h1>Dones</h1>
        {!!dones.length && dones.map((item, index) =>
          <div key={item.id} className={`item done${isFocused(index, TYPES.done) ? ' focused' : ''}`}>
            <div>
              <span>[x] { item.content }</span>
              <span className='control' onClick={moveTo(item, TYPES.done, TYPES.now)}>Now</span>
            </div>
            <span className='control' onClick={remove(item, TYPES.done)}>Remove</span>
          </div>
        )}
      </div>
      <div className='column'>
        <h1>Nows</h1>
        {!!nows.length && nows.map((item, index) =>
          <div key={item.id} className={`item now${isFocused(index, TYPES.now) ? ' focused' : ''}`}>
            <div>
              <span className='control' onClick={moveTo(item, TYPES.now, TYPES.done)}>Done</span>
              <span>[ ] { item.content }</span>
              <span className='control' onClick={moveTo(item, TYPES.now, TYPES.next)}>Next</span>
            </div>
            <span className='control' onClick={remove(item, TYPES.now)}>Remove</span>
          </div>
        )}
      </div>
      <div className='column'>
        <h1>Nexts</h1>
        {!!nexts.length && nexts.map((item, index) =>
          <div key={item.id} className={`item next${isFocused(index, TYPES.next) ? ' focused' : ''}`}>
            <div>
              <span className='control' onClick={moveTo(item, TYPES.next, TYPES.now)}>Now</span>
              <input
                value={item.content}
                onChange={({ target: { value } }) => editNext(item.id, value)}
              />
            </div>
            <span className='control' onClick={remove(item, TYPES.next)}>Remove</span>
          </div>
        )}
        <button onClick={addNext}>Add</button>
      </div>
    </div>
  );
}

export default App;
