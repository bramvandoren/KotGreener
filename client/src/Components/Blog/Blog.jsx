import React, { useEffect, useState } from 'react';
import './Blog.css';
import Navbar from '../Navbar/Navbar';
import BlogDetail from './BlogDetail';
import { Link, NavLink } from 'react-router-dom';
import { supabase } from '../../lib/helper/supabaseClient';

function Blog({session}) {
  const [blogs, setBlogs] = useState([]);
  const [userSession, setUserSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching blogs:', error);
      } else {
        setBlogs(data);
      }
      setLoading(false);
    };

    fetchBlogs();
  }, []);

  // const fetchBlogs = async () => {
  //   try {
  //     const { data: blogs, error } = await supabase
  //       .from('blogs')
  //       .select('*')
  //       .order('created_at', { ascending: false });
  //     console.log(blogs);
  //     if (error) {
  //       throw new Error('Failed to fetch blogs');
  //     }

  //     setBlogs(blogs);
  //   } catch (error) {
  //     console.error('Error fetching blogs:', error.message);
  //   }
  // };

  const truncateText = (text, wordLimit) => {
    const words = text.split(' ');
    if (words.length > wordLimit) {
      return words.slice(0, wordLimit).join(' ') + '...';
    }
    return text;
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('nl-NL', options);
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!blogs) {
    return <div>Blog not found</div>;
  }

  return (
    <>
      <div className="blog">
        <header className="header">
          <h1>Blog</h1>
          <div className='nav-desktop'>
            <NavLink to="/" className="nav-item">
              <p>Home</p>
            </NavLink>
            <NavLink to="/blog" className="nav-item">
              <p>Ontdek</p>
            </NavLink>
            <NavLink to="/my-plants" className="nav-item">
              <p>Mijn Planten</p>
            </NavLink>
            <NavLink to="/winkel" className="nav-item">
              <p>Winkel</p>
            </NavLink>
            <NavLink to="/search" className="nav-item">
              <p>Zoeken</p>
            </NavLink>
          </div>
          <div className="profile-icon">B</div>
        </header>
        <main>
          <div className="blogs">
            {blogs.map((blog) => (
              <div className="blog-post" key={blog.id}>
                <div className="blog-image-overlay">
                  <img
                    src={blog.image_url}
                    alt={blog.title}
                    className="blog-image"
                  />
                </div>
                <div className="blog-content">
                  <h2>{blog.title}</h2>
                  <p>{truncateText(blog.content, 30)}</p>
                  <p className="blog-content-date">{formatDate(blog.created_at)}</p>
                  {session && (
                    <Link to={`/blog/${blog.id}`} className="button--tertiair">Lees meer</Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
      <Navbar />
    </>
  );
}

export default Blog;
