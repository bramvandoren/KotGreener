import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { Register } from './Components/Register/Register'
import {supabase} from "./lib/helper/supabaseClient";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {BrowserRouter, createBrowserRouter, Route, RouterProvider, Routes} from 'react-router-dom'
import Home from './Components/Home/Home'
import Blog from './Components/Blog/Blog'
import MyPlants from './Components/MyPlants/MyPlants'
import Search from './Components/Search/Search'
import DetailPage from './Components/Search/Detailpage'
import LoginPage from './Components/LoginPage/LoginPage'
// import Market from './Components/Market/Market'
import Profile from './Components/Profile/Profile'
// import AdminRoute from './Components/Admin/AdminRoute'
// import AdminPage from './Components/Admin/AdminPage'
// import AdminBlogPage from './Components/Admin/AdminBlogPage/AdminBlogPage'
// import AdminProfilePage from './Components/Admin/AdminProfilepage.jsx/AdminProfilePage'
// import AdminPlantsPage from './Components/Admin/AdminPlantsPage/AdminPlantsPage'
import BlogDetail from './Components/Blog/BlogDetail'
import MyPlant from './Components/MyPlants/MyPlant'
import Account from './Components/Profile/Account'
import AddPlant from './Components/MyPlants/AddPlant'
import EditPlant from './Components/MyPlants/EditPlant'

function App() {
  const [session, setSession] = useState(null)

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
      {/* <div className="container" style={{ padding: '50px 0 100px 0' }}>
        {!session ? <Auth /> : <Home key={session.user.id} session={session} />}
      </div> */}
      <Routes>
      <Route path="/" exact element={<Home session={session} />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/edit" element={<Account />} />

        <Route path="/blog" element={<Blog session = {session}/>} />
        <Route path="/blog/:blogId" element={<BlogDetail/>} />

        <Route path="/plants" element={<Search />} />
        <Route path="/plants/:plantId" element={<DetailPage/>} />

        <Route path="/my-plants" element={<MyPlants/>} />
        <Route path="/my-plants/add" element={<AddPlant/>} />
        <Route path="/my-plants/:id" element={<MyPlant/>} />
        <Route path="/my-plants/edit/:id" element={<EditPlant/>} />

    </Routes>
    </BrowserRouter>
      {/* <BrowserRouter>
        <Routes>
          <Route path="/" exact element={<Home />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/blog" element={<Blog/>} />
          <Route path="/blog/:blogId" element={<BlogDetail/>} />
          <Route path="/my-plants" element={<MyPlants/>} />
          <Route path="/my-plants/:id" element={<MyPlant/>} />
          <Route path="/winkel" element={<Market/>} />
          <Route path="/search" element={<Search/>} />
          <Route path="/search/:plantId" element={<DetailPage/>} />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminPage />
              </AdminRoute>
            }
          />
          <Route path="/admin/blog" 
          element={
            <AdminRoute>
              <AdminBlogPage />
            </AdminRoute>
          } />
          <Route path="/admin/plants" 
          element={
            <AdminRoute>
              <AdminPlantsPage />
            </AdminRoute>
          } />
          <Route path="/admin/profile" 
          element={
            <AdminRoute>
              <AdminProfilePage />
            </AdminRoute>
          } />
          <Route path="/stats" element={<DetailPage/>} />
        </Routes>
      </BrowserRouter> */}
      {/* <div>
        <button onClick={Login}>Login with Github</button>
      </div> */}
    </>
  )
}

export default App
