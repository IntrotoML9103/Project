import { useEffect, useState } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Demo from './components/Demo'
import HowItWorks from './components/HowItWorks'
import Metrics from './components/Metrics'
import About from './components/About'
import Footer from './components/Footer'
import { fetchInfo } from './api'

export default function App() {
  const [info, setInfo] = useState(null)

  useEffect(() => {
    fetchInfo().then(setInfo).catch(() => setInfo(null))
  }, [])

  return (
    <>
      <Navbar />
      <main>
        <Hero info={info} />
        <Demo />
        <HowItWorks />
        <Metrics info={info} />
        <About />
      </main>
      <Footer />
    </>
  )
}
