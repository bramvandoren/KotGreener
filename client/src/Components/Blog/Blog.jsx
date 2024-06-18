import React, { useEffect, useState } from 'react';
import './Blog.css';
import Navbar from '../Navbar/Navbar';
import BlogDetail from './BlogDetail';
import { Link, NavLink, Navigate, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/helper/supabaseClient';
import Loading from '../Loading/Loading';
import Header from '../Header/Header';

function Blog() {
  const [blogs, setBlogs] = useState([]);
  const [session, setSession] = useState(true);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
      } catch (error) {
        console.error('Error fetching session:', error);
      }
    };
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
    fetchSession();
    fetchBlogs();
  }, []);

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
    return <Loading/>
  }

  if (!blogs) {
    return <div>Blog niet gevonden</div>;
  }

  return (
    <>
      <div className="blog">
        <Header/>
        <main>
        <div className="blog-intro">
          <Link className="breadcrumb">Blog</Link>
          <div className="blog-intro-header">
            <h2>KotGreener's Blog</h2>
          </div>
          <p className="blog-intro-text">
            Ontdek de nieuwste ontwikkelingen en handige tips voor groener te leven op kot.
          </p>
        </div>
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
                <h3>{blog.title}</h3>
                <p>{truncateText(blog.content, 30)}</p>
                <p className="blog-content-date">{formatDate(blog.created_at)}</p>
                {session ? (
                  <Link to={`/blog/${blog.slug}`} className="read-more">Lees meer</Link>
                ) :
                (
                  <p><Link to="/login">Log in</Link> om een blog te lezen.</p>
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
