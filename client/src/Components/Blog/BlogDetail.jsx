import React, { useEffect, useState } from 'react';
import './Blog.css';
import Navbar from '../Navbar/Navbar';
import { Link, NavLink, useNavigate, useParams } from 'react-router-dom';
import logo from "../../assets/logo-kotgreener.svg";
import { supabase } from '../../lib/helper/supabaseClient';


function BlogDetail() {
  const { blogId } = useParams();
  const [blog, setBlog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [session, setSession] = useState(null);
  const navigate = useNavigate();


  useEffect(() => {
    const fetchSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        if (session) {
          // fetchMyPlant(session.user.id);
        }
      } catch (error) {
        console.error('Error fetching session:', error);
      }
    };
    const fetchBlog = async () => {
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .eq('id', blogId)
        .single();

      if (error) {
        console.error('Error fetching blog:', error);
      } else {
        setBlog(data);
      }
      setLoading(false);
    };
    const fetchComments = async () => {
      try {
        const { data, error } = await supabase
          .from('blog_comments')
          .select('*')
          .eq('blog_id', blogId)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching comments:', error);
        } else {
          setComments(data);
        }
      } catch (error) {
        console.error('Error fetching comments:', error);
      }
    };
    fetchSession();
    fetchBlog();
    fetchComments();
  }, [blogId]);

  const formatDate = (dateString) => {
    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };

    return new Date(dateString).toLocaleDateString('nl-NL', options);
  }

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!session) {
      alert("Je moet ingelogd zijn om een reactie te plaatsen.");
      return;
    }
    try {
      // const user = supabase.auth.user();
      const { data, error } = await supabase
        .from('blog_comments')
        .insert([
          {
            blog_id: blogId,
            profile_id: session.user.id,
            username: session.user.email,
            content: newComment,
          },
        ]);

      if (error) {
        throw new Error(error.message);
      }

      setComments([data[0], ...comments]);
      setNewComment('');
    } catch (error) {
      console.error('Failed to post comment:', error);
    }
  };

  const handleDeleteEvent = async (commentId) => {
    try {
      const { error } = await supabase
        .from('blog_comments')
        .delete()
        .eq('id', commentId);
  
      if (error) {
        console.error('Error deleting event:', error);
      } else {
        setComments(comments.filter(comment => comment.id !== commentId));
      }
    } catch (error) {
      console.error('Unexpected error:', error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!blog) {
    return <div>Blog niet gevonden</div>;
  }

  return (
    <>
      <div className="blog-detail">
        {/* <header className="header">
          <div className="blog-image-overlay">
            <img
              // src={`http://localhost:4000/uploads/${blog.image}`}
              alt={blog.title}
              className="blog-image-background"
            />
          </div>
          <div className="button-back" onClick={() => window.history.back()}>
            <svg width="25" height="25" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6.5625 14.0625H25.3125C25.5611 14.0625 25.7996 14.1613 25.9754 14.3371C26.1512 14.5129 26.25 14.7514 26.25 15C26.25 15.2486 26.1512 15.4871 25.9754 15.6629C25.7996 15.8387 25.5611 15.9375 25.3125 15.9375H6.5625C6.31386 15.9375 6.0754 15.8387 5.89959 15.6629C5.72377 15.4871 5.625 15.2486 5.625 15C5.625 14.7514 5.72377 14.5129 5.89959 14.3371C6.0754 14.1613 6.31386 14.0625 6.5625 14.0625Z" fill="black"/>
              <path d="M6.95059 15L14.7262 22.7737C14.9023 22.9498 15.0012 23.1885 15.0012 23.4375C15.0012 23.6864 14.9023 23.9252 14.7262 24.1012C14.5502 24.2773 14.3114 24.3761 14.0625 24.3761C13.8135 24.3761 13.5748 24.2773 13.3987 24.1012L4.96122 15.6637C4.87391 15.5766 4.80464 15.4732 4.75738 15.3593C4.71012 15.2454 4.68579 15.1233 4.68579 15C4.68579 14.8766 4.71012 14.7545 4.75738 14.6407C4.80464 14.5268 4.87391 14.4233 4.96122 14.3362L13.3987 5.89871C13.5748 5.72268 13.8135 5.62378 14.0625 5.62378C14.3114 5.62378 14.5502 5.72268 14.7262 5.89871C14.9023 6.07475 15.0012 6.31351 15.0012 6.56246C15.0012 6.81142 14.9023 7.05018 14.7262 7.22621L6.95059 15Z" fill="black"/>
            </svg>
            <p>Terug</p>
          </div>
        </header> */}
        <header className="header">
          <img className="logo" src={logo} alt='Logo' />
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
        </header>
        <div className="blog-image-overlay">
          <img
            // src={`http://localhost:4000/uploads/${blog.image}`}
            alt={blog.title}
            className="blog-image-background"
          />
        </div>
        {/* <div className="button-back" onClick={() => window.history.back()}>
          <svg width="25" height="25" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6.5625 14.0625H25.3125C25.5611 14.0625 25.7996 14.1613 25.9754 14.3371C26.1512 14.5129 26.25 14.7514 26.25 15C26.25 15.2486 26.1512 15.4871 25.9754 15.6629C25.7996 15.8387 25.5611 15.9375 25.3125 15.9375H6.5625C6.31386 15.9375 6.0754 15.8387 5.89959 15.6629C5.72377 15.4871 5.625 15.2486 5.625 15C5.625 14.7514 5.72377 14.5129 5.89959 14.3371C6.0754 14.1613 6.31386 14.0625 6.5625 14.0625Z" fill="black"/>
            <path d="M6.95059 15L14.7262 22.7737C14.9023 22.9498 15.0012 23.1885 15.0012 23.4375C15.0012 23.6864 14.9023 23.9252 14.7262 24.1012C14.5502 24.2773 14.3114 24.3761 14.0625 24.3761C13.8135 24.3761 13.5748 24.2773 13.3987 24.1012L4.96122 15.6637C4.87391 15.5766 4.80464 15.4732 4.75738 15.3593C4.71012 15.2454 4.68579 15.1233 4.68579 15C4.68579 14.8766 4.71012 14.7545 4.75738 14.6407C4.80464 14.5268 4.87391 14.4233 4.96122 14.3362L13.3987 5.89871C13.5748 5.72268 13.8135 5.62378 14.0625 5.62378C14.3114 5.62378 14.5502 5.72268 14.7262 5.89871C14.9023 6.07475 15.0012 6.31351 15.0012 6.56246C15.0012 6.81142 14.9023 7.05018 14.7262 7.22621L6.95059 15Z" fill="black"/>
          </svg>
          <p>Terug</p>
        </div> */}
        <main>
          <div className="blog-detail-content">
            <div>
              <Link to={'/blog'} className="breadcrumb">Blog</Link>
              <span> / </span>
              <Link className="breadcrumb">{blog.title}</Link>
            </div>
            <h2>{blog.title}</h2>
            <p className="blog-content-date">Weergaven {blog.views}</p>
            <p className="blog-content-date">{formatDate(blog.created_at)}</p>
            <p>{blog.content}</p>
          </div>
          <div className="blog-comments">
            <h3 className="blog-comments-title">Reacties <span className="comments-count">{comments.length}</span></h3>
            {comments.length == 0 ? (
              <p className="blog-comments-empty">Geen reacties</p> 
            ) : (
            comments.map((comment, index) => (
              <div key={comment.id} className="comment">
                <p className="comment-user"><strong>{comment.username}</strong></p>
                <p className="comment-content">{comment.content}</p>
                <p className="comment-date">{formatDate(comment.created_at)}</p>
                <button className="comment-delete" onClick={() => handleDeleteEvent(comment.id)}>X</button>
              </div>
            ))
            )}
            {session ? (
              <form onSubmit={handleCommentSubmit}>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Voeg een reactie toe"
                  required
                />
                <button type="submit">Plaats reactie</button>
              </form>
            ) : (
              <div className="blog-comments-create">
                <p><Link to="/login">Log in</Link> om een reactie te plaatsen.</p>
              </div>
            )}
          </div>
        </main>
    </div>
    <Navbar />
  </>
  );
}

export default BlogDetail;
