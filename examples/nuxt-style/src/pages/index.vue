<template>
  <div>
    <p>index.vue</p>
    <router-link to="/blog">
      blog
    </router-link> |
    <router-link to="/about">
      about
    </router-link> |
    <router-link to="/components">
      components
    </router-link> |
    <router-link to="/markdown">
      markdown
    </router-link> |
    <router-link to="/xxx">
      not exists
    </router-link> |
    <router-link to="/features/dashboard">
      features:dashboard
    </router-link> |
    <router-link to="/features/admin">
      features:admin
    </router-link> |
    <router-link to="/admin">
      admin
    </router-link> |
    <router-link to="/optional">
      optional
    </router-link>
  </div>
</template>

<!-- <route lang="yaml">
  name: "name-override"
  meta:
    requiresAuth: false
</route> -->
