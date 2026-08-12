export default defineNuxtRouteMiddleware(async (to, from) => {
  // Try to fetch current user to check if token is valid
  try {
    const { data } = await useFetch('/api/admin/me');
    // If not successful or no user, redirect to login
    if (!data.value || !data.value.success) {
      return navigateTo('/login');
    }
  } catch (err) {
    return navigateTo('/login');
  }
});
