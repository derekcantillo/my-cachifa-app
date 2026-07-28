/**
 * The date picker is a native view with no JS implementation under Jest, so
 * tests render an inert placeholder in its place. Manual mocks for node_modules
 * are picked up automatically — no `jest.mock` call needed.
 */
const React = require('react')
const { View } = require('react-native')

function DateTimePicker(props) {
  return React.createElement(View, {
    testID: props.testID ?? 'date-time-picker',
  })
}

module.exports = DateTimePicker
