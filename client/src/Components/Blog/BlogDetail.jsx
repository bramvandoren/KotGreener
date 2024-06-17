import React, { useEffect, useState } from 'react';
import './Blog.css';
import Navbar from '../Navbar/Navbar';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/helper/supabaseClient';
import Header from '../Header/Header';
import {marked} from 'marked';
import Loading from '../Loading/Loading';
import Comments from './Comments';


function BlogDetail() {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        if (!session) {
          navigate('/login');
        }
      } catch (error) {
        console.error('Error fetching session:', error);
      }
    };
    const fetchBlog = async () => {
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) {
        console.error('Error fetching blog:', error);
      } else {
        setBlog(data);
        updateViews(data.id, data.views + 1);

      }
    };
    
    const updateViews = async (blogId, newViews) => {
      try {
        await supabase
          .from('blogs')
          .update({ views: newViews })
          .eq('id', blogId);
      } catch (error) {
        console.error('Error updating views:', error);
      }
    };
    setLoading(false);
    fetchSession();

    if (blog === null) {
      fetchBlog();
    } else {
      updateViews();
    }
  }, [slug]);

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

  if (loading) {
    return <Loading/>;
  }

  if (!blog) {
    return <div>Blog niet gevonden</div>;
  }

  // Converteer Markdown naar HTML
  const convertedContent = marked(blog.content);

  return (
    <>
      <div className="blog-detail">
        <Header/>
        <div className="blog-image-overlay">
          <img
            src={blog.image_url}
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
            <div className="blog-detail-intro">
              <h2>{blog.title}</h2>
              <p className="blog-content-date">Weergaven {blog.views}</p>
              <p className="blog-content-date">{formatDate(blog.created_at)}</p>
            </div>
            <div dangerouslySetInnerHTML={{ __html: convertedContent }}></div>
          </div>
          <Comments blogId={blog.id} session={session} />
        </main>
    </div>
    <Navbar />
  </>
  );
}

export default BlogDetail;
