
const get = async () => {
  console.log(await fetch('/api/get'))
}

const Home = () => (
  <>
    <h1>Stuff!</h1>
    <button onclick={ get }>Hit!</button>
  </>
)

export default Home
