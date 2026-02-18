'use client';
import { Bookmark } from "@/types/bookmarksTypes";
import BookmarkForm from "./BookmarkForm";
import BookMarkList from "./BookMarkList";
import { useCallback, useState } from "react";    
import { useAuth } from "@/hooks/useAuth";
import Bookmarks from "@/query/bookmarks/bookmarks";
import toast from "react-hot-toast";

export default function Index() {

    const { user } = useAuth();
    const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const fetchBookmarks = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    const result = await Bookmarks.getBookmarks();
    if (result.success && result.data) {
      setBookmarks(result.data);
    } else {
      toast.error(result.error || 'Failed to fetch bookmarks');
    }
    setLoading(false);
  }, [user]);
    return (
        <>
            <BookmarkForm fetchBookmarks={fetchBookmarks} />
            <BookMarkList fetchBookmarks={fetchBookmarks}  bookmarks={bookmarks} loading={loading} setBookmarks={setBookmarks}/>
        </>
    )
}   