
const randomDate = (start, end) => () => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

const rDate = randomDate(new Date(2015, 0, 1), new Date())

const randomString = () => String.fromCharCode(
  ...Array(Math.ceil(Math.random() * 500) + 1)
    .fill()
    .map(() => Math.ceil(Math.random() * 26))
)

export default (req, res) => {
  res.json(Array(100).fill().map((_, i) => ({
    id: i,
    done: !!(i%2),
    time: rDate(),
    thing: randomString()
  })))
}
