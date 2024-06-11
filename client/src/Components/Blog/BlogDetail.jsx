import React, { useEffect, useState } from 'react';
import './Blog.css';
import Navbar from '../Navbar/Navbar';
import { Link, NavLink, useNavigate, useParams } from 'react-router-dom';
import logo from "../../assets/logo-kotgreener.svg";
import { supabase } from '../../lib/helper/supabaseClient';
import Header from '../Header/Header';


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
          .order('created_at', { ascending: true });

        if (error) {
          console.error('Error fetching comments:', error);
        } else {
          setComments(data);
        }
      } catch (error) {
        console.error('Error fetching comments:', error);
      }
    };
    const updateViews = async () => {
      try {
        await supabase
          .from('blogs')
          .update({ views: blog.views + 1 })
          .eq('id', blogId);
      } catch (error) {
        console.error('Error updating views:', error);
      }
    };
    fetchSession();
    fetchBlog();
    fetchComments();
    updateViews();
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
      } else {
        setComments([data[0], ...comments]);
        setNewComment('');
      }
    } catch (error) {
      console.error('Failed to post comment:', error);
    }
  };

  const handleDeleteComment = async (commentId) => {
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
        <Header/>
        <div className="blog-image-overlay">
          <img
            // src={`http://localhost:4000/uploads/${blog.image}`}
            alt={blog.title}
            className="blog-image-background"
          />
        </div>
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
                {(comment.profile_id == session.user.id) ? (
                  <button className="comment-delete" onClick={() => handleDeleteComment(comment.id)}>X</button>
                ): (
                  <></>
                )}
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
