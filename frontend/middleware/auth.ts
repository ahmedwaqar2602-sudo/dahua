export default defineNuxtRouteMiddleware(async (to, from) => {
  if (to.path === '/login' || to.path === '/admin/login') {
    return;
  }
  
  const token = useCookie('admin_token');
  if (!token.value) {
    return navigateTo('/admin/login');
  }
});
