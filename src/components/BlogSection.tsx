import { useEffect, useState } from 'react';
import { Card } from './ui/card';
import { supabase } from '@/integrations/supabase/client';
import { ExternalLink, Newspaper } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  preview_text: string | null;
  thumbnail_url: string | null;
  content_url: string;
  created_at: string;
}

export const BlogSection = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBlogPosts();
  }, []);

  const loadBlogPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error loading blog posts:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Newspaper className="w-6 h-6 text-primary" />
          From Our Blog
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="glass-card p-4 animate-pulse">
              <div className="aspect-video bg-muted rounded-lg mb-3" />
              <div className="h-4 bg-muted rounded w-3/4 mb-2" />
              <div className="h-3 bg-muted rounded w-full" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (posts.length === 0) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <Newspaper className="w-6 h-6 text-primary" />
        From Our Blog
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {posts.map((post) => (
          <a
            key={post.id}
            href={post.content_url}
            target="_blank"
            rel="noopener noreferrer"
            className="group"
          >
            <Card className="glass-card p-4 transition-all hover:scale-105 hover:shadow-lg hover:shadow-primary/20">
              {post.thumbnail_url && (
                <div className="aspect-video bg-muted rounded-lg mb-3 overflow-hidden">
                  <img
                    src={post.thumbnail_url}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform group-hover:scale-110"
                  />
                </div>
              )}
              <h3 className="font-semibold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                {post.title}
              </h3>
              {post.preview_text && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                  {post.preview_text}
                </p>
              )}
              <div className="flex items-center gap-1 text-xs text-primary">
                <span>Read more</span>
                <ExternalLink className="w-3 h-3" />
              </div>
            </Card>
          </a>
        ))}
      </div>
    </div>
  );
};