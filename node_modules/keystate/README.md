keystate
========

Making Javascript key state handling easy. 

## Usage

```js
if(keys.left) {
  console.log('left arrow key down');
}

if(keys.ctrl && keys.p) {
  paste();
}

if(keys.shift && keys[0]) {
  // do magic
}
```

Keystate gives you access to a keys object whose properties reflect the states of the keys on your keyboard. Keystate uses `String.fromCharCode` (along with some predefined mappings) so that you can check the state of any alphanumeric key, along with the following list of modifiers. If you want to check numeric keys, access states like an array.

```
backspace
tab
enter
ctrl
alt
caps
esc
left
space
up
right
down
insert
delete
```

## Installation

`npm install keystate`

or

`bower install keystate`

Then include `keystate.js` in your project and have a good time.
