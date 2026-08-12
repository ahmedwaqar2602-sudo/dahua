export default defineNuxtRouteMiddleware(async (to, from) => {
  if (to.path === '/login' || to.path === '/admin/login') {
    return;
  }
  
  try {
    const { data } = await useFetch('/api/admin/me');
    if (!data.value || !data.value.success) {
      return navigateTo('/admin/login');
    }
  } catch (err) {
    return navigateTo('/admin/login');
  }
});
