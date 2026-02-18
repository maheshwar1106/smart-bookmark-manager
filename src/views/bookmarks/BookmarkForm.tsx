'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Bookmarks from '@/query/bookmarks/bookmarks';
import toast from 'react-hot-toast';

export default function BookmarkForm({ fetchBookmarks }: { fetchBookmarks: () => void }) {
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [formData, setFormData] = useState<{ title: string; url: string }>({ title: '', url: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    if (!user) {
      toast.error('You must be logged in to add bookmarks');
      setSubmitting(false);
      return;
    }

    // Validate URL
    let validUrl = formData.url.trim();
    if (!validUrl.startsWith('http://') && !validUrl.startsWith('https://')) {
      validUrl = 'https://' + validUrl;
    }

    const result = await Bookmarks.addBookmark(formData.title, validUrl);

    if (result.success) {
      toast.success('Bookmark added successfully!');
      setFormData({ title: '', url: '' });
      await fetchBookmarks();
    } else {
      toast.error(result.error || 'Failed to add bookmark');
    }

    setSubmitting(false);
  };

  return (
    <>
      {/* Add Bookmark Form */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Add New Bookmark</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              placeholder="Enter bookmark title"
            />
          </div>
          <div>
            <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
              URL
            </label>
            <input
              type="url"
              id="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              placeholder="https://example.com"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? 'Adding...' : 'Add Bookmark'}
          </button>
        </form>
      </div>
    </>
  );
}
