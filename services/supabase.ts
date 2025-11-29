import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zbwtcfwrarxghzggybln.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpid3RjZndyYXJ4Z2h6Z2d5YmxuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQzMTcwNDIsImV4cCI6MjA3OTg5MzA0Mn0.CrFsQu9zMAXP7ulV-z6jRTSxdtc5kzKgbavLU2Xy3zo';


export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Supabase Storage helpers
export async function uploadImage(file: File, path: string, bucket: string = 'images') {
	const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
		cacheControl: '3600',
		upsert: true,
	});
	if (error) throw error;
	return data;
}

export function getImageUrl(path: string, bucket: string = 'images') {
	return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}
