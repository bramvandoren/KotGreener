import { useEffect, useState } from 'react'
import './App.css'
import { Register } from './Components/Register/Register'
import {supabase} from "./lib/helper/supabaseClient";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {BrowserRouter, createBrowserRouter, Route, RouterProvider, Routes} from 'react-router-dom'
import Home from './Components/Home/Home'
import Blog from './Components/Blog/Blog'
import MyPlants from './Components/MyPlants/MyPlants'
import Market from './Components/Market/Market';
import Search from './Components/Search/Search'
import DetailPage from './Components/Search/Detailpage'
import LoginPage from './Components/LoginPage/LoginPage'
import Profile from './Components/Profile/Profile'
import BlogDetail from './Components/Blog/BlogDetail'
import MyPlant from './Components/MyPlants/MyPlant'
import Account from './Components/Profile/Account'
import AddPlant from './Components/MyPlants/AddPlant'
import EditPlant from './Components/MyPlants/EditPlant'
import Footer from './Components/Partials/Footer';
import ScrollToTop from './Components/Scroller/ScrollToTop';
import MarketDrafts from './Components/Market/MarketDrafts';
import EditPlantMarket from './Components/Market/EditPlantMarket';

function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
  }, [])
  return (
    <>
    <BrowserRouter>
      <Routes>
      <Route path="/" exact element={<Home/>} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/edit" element={<Account />} />

        <Route path="/blog" element={<Blog/>} />
        <Route path="/blog/:slug" element={<BlogDetail/>} />

        <Route path="/plants" element={<Search />} />
        <Route path="/plants/:plantId" element={<DetailPage/>} />

        <Route path="/my-plants" element={<MyPlants/>} />
        <Route path="/my-plants/add" element={<AddPlant/>} />
        <Route path="/my-plants/:id" element={<MyPlant/>} />
        <Route path="/my-plants/edit/:id" element={<EditPlant/>} />

        <Route path="/markt" element={<Market/>} />
        <Route path="/markt/add" element={<MarketDrafts/>} />
        <Route path="/markt/edit/:plantId" element={<EditPlantMarket/>} />

    </Routes>
    <ScrollToTop />
    <Footer/>
    </BrowserRouter>
    </>
  )
}

export default App
