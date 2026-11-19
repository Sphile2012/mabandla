export function getLessonLoadErrorMessage(error) {
  if (error?.data?.error === 'API unavailable') {
    return 'The local API is not running. Start the app with "npm run dev:all" and configure its Supabase connection.';
  }
  if (error?.data?.error === 'Backend not configured') {
    return 'Lesson data needs Supabase settings. Add SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and a private JWT_SECRET to your local environment, then restart the API.';
  }
  return 'The lesson service could not be reached. Check the API and database connection, then try again.';
}
