'use client';

import { useEffect } from 'react';
import supabase from '@/libs/supabaseClient';
import { useAuth } from '@/hooks/useAuth';
import Bookmarks from '@/query/bookmarks/bookmarks';
import { Bookmark } from '@/types/bookmarksTypes';
import toast from 'react-hot-toast';
import Loader from '@/components/Loader';


export default function BookMarkList({ fetchBookmarks, bookmarks, loading, setBookmarks }: { fetchBookmarks: () => void, bookmarks: Bookmark[], loading: boolean, setBookmarks: React.Dispatch<React.SetStateAction<Bookmark[]>> }) {
  const { user } = useAuth();

    
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this bookmark?')) {
      return;
    }

    const result = await Bookmarks.deleteBookmark(id);
    
    if (result.success) {
      toast.success('Bookmark deleted successfully!');
      await fetchBookmarks();
    } else {
      toast.error(result.error || 'Failed to delete bookmark');
    }
  };

  // Fetch initial bookmarks and set up real-time subscription
  useEffect(() => {
    if (!user) return;

   
     (async () => {
      await fetchBookmarks();
     })();
    

    // Set up real-time subscription
    const channel = supabase
      .channel('bookmarks-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookmarks',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setBookmarks((prev: Bookmark[]) => [payload.new as Bookmark, ...prev]);
          } else if (payload.eventType === 'DELETE') {
            setBookmarks((prev: Bookmark[]) => prev.filter((b: Bookmark) => b.id !== payload.old.id));
          } else if (payload.eventType === 'UPDATE') {
            setBookmarks((prev: Bookmark[]) =>
              prev.map((b: Bookmark) => (b.id === payload.new.id ? (payload.new as Bookmark) : b))
            );
          }
        }
      )
      .subscribe(
        (status => {
          console.log("Realtime:", status);
        })
      );

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchBookmarks, setBookmarks]);


  return (
    <>
    
        {/* Bookmarks List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Bookmarks List
        </h2>
        {loading ? <Loader /> : bookmarks.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No bookmarks</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by adding a new bookmark above.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {bookmarks.map((bookmark) => (
                <div
                  key={bookmark.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <a
                      href={bookmark.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-lg font-medium text-blue-600 hover:text-blue-800 hover:underline block truncate"
                    >
                      {bookmark.title}
                    </a>
                    <p className="text-sm text-gray-500 truncate mt-1">{bookmark.url}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(bookmark.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(bookmark.id)}
                    className="ml-4 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
    </>
  );
}