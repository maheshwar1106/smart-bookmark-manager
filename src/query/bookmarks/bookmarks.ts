import { SupabaseClient } from "@supabase/supabase-js";
import supabase from "@/libs/supabaseClient";
import { Bookmark } from "@/types/bookmarksTypes";

type BookmarkResult<T> = {
    success: boolean;
    data?: T;
    error?: string;
};

class Bookmarks {
    private readonly supabase: SupabaseClient;
    private static instance: Bookmarks;

    private constructor(supabase: SupabaseClient) {
        this.supabase = supabase;
    }

    static getInstance(supabase: SupabaseClient) {
        if (!Bookmarks.instance) {
            Bookmarks.instance = new Bookmarks(supabase);
        }
        return Bookmarks.instance;
    }

    async getBookmarks(): Promise<BookmarkResult<Bookmark[]>> {
        try {
            // Get user from Supabase server-side session
            const { data: { user }, error: userError } = await this.supabase.auth.getUser();
            
            if (userError) {
                return { success: false, error: userError.message || 'Failed to get user' };
            }
            if (!user) {
                return { success: false, error: 'User not authenticated' };
            }

            const { data, error } = await this.supabase
                .from('bookmarks')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });
            
            if (error) {
                return { success: false, error: error.message || 'Failed to fetch bookmarks' };
            }
            return { success: true, data: data || [] };
        } catch (err) {
            return { 
                success: false, 
                error: err instanceof Error ? err.message : 'An unexpected error occurred' 
            };
        }
    }

    async addBookmark(title: string, url: string): Promise<BookmarkResult<Bookmark>> {
        try {
            const { data: { user }, error: userError } = await this.supabase.auth.getUser();
            if (userError) {
                return { success: false, error: userError.message || 'Failed to get user' };
            }
            if (!user) {
                return { success: false, error: 'User not authenticated' };
            }

            const { data, error } = await this.supabase
                .from('bookmarks')
                .insert([{
                    user_id: user.id,
                    title: title.trim(),
                    url: url.trim(),
                }]);

            if (error) {
                return { success: false, error: error.message || 'Failed to add bookmark' };
            }
            return { success: true, data: data?.[0] };
        } catch (err) {
            return { 
                success: false, 
                error: err instanceof Error ? err.message : 'An unexpected error occurred' 
            };
        }
    }

    async deleteBookmark(id: string): Promise<BookmarkResult<Bookmark[]>> {
        try {
            const { data: { user }, error: userError } = await this.supabase.auth.getUser();
            if (userError) {
                return { success: false, error: userError.message || 'Failed to get user' };
            }
            if (!user) {
                return { success: false, error: 'User not authenticated' };
            }

            const { data, error } = await this.supabase
                .from('bookmarks')
                .delete()
                .eq('id', id)
                .eq('user_id', user.id);
            
            if (error) {
                return { success: false, error: error.message || 'Failed to delete bookmark' };
            }
            return { success: true, data: data || [] };
        } catch (err) {
            return { 
                success: false, 
                error: err instanceof Error ? err.message : 'An unexpected error occurred' 
            };
        }
    }
}

export default Bookmarks.getInstance(supabase);