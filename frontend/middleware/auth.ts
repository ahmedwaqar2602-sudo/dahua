export default defineNuxtRouteMiddleware(async (to, from) => {
  if (to.path === '/login' || to.path === '/admin/login') {
    return;
  }
  
  try {
    const headers = import.meta.server ? useRequestHeaders(['cookie']) as Record<string, string> : {};
    const res = await $fetch('/api/admin/me', { headers });
    
    if (!res || !res.authenticated) {
      return navigateTo('/admin/login?expired=1');
    }
  } catch (err) {
    return navigateTo('/admin/login?expired=1');
  }
});
