import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/helper/supabaseClient';
import Loading from '../Loading/Loading';

const Comments = ({ blogId, session }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComments();
  }, [blogId]);

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
        setComments(data || []);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

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
        fetchComments();
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
        console.error('Error deleting comment:', error);
      } else {
        setComments(comments.filter((comment) => comment.id !== commentId));
        console.log(comments)

      }
    } catch (error) {
      console.error('Unexpected error:', error);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="blog-comments">
      <h3 className="blog-comments-title">
        Reacties <span className="comments-count">{comments.length}</span>
      </h3>
      {comments.length === 0 ? (
        <p className="blog-comments-empty">Geen reacties</p>
      ) : (
        comments.map((comment) => (
          <div key={comment.id} className="comment">
            <p className="comment-user">
              <strong>{comment.username}</strong>
            </p>
            <p className="comment-content">{comment.content}</p>
            <p className="comment-date">{formatDate(comment.created_at)}</p>
            {comment.profile_id === session.user.id && (
              <button
                className="comment-delete"
                onClick={() => handleDeleteComment(comment.id)}
              >
                X
              </button>
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
          <p>
            <Link to="/login">Log in</Link> om een reactie te plaatsen.
          </p>
        </div>
      )}
    </div>
  );
};

export default Comments;
