// Skill icon URLs from CMS, matched by normalized skill name.
const icons = {
  html: "https://github.com/With-ALIF/logo_zone/blob/main/images/html5..png?raw=true",
  css: "https://github.com/With-ALIF/logo_zone/blob/main/images/css3.png?raw=true",
  sql: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQqEtKD-SuIhbRvQo3NVndUkt1j8_SLc5xpEOl3LD2bdvPs1kHkC2E7nOk&s=10",
  postgresql: "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/29/Postgresql_elephant.svg/960px-Postgresql_elephant.svg.png?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=thumbnail&_=20080116191800",
  javafx: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTxS8gIj5vJMCocaMV4kfZyCQ1YCdoaeprJsKW5RSrBIEb9_z4hM7hKXXcp&s=10",
  git: "https://git-scm.com/images/logos/downloads/Git-Icon-1788C.png",
  github: "https://static.vecteezy.com/system/resources/previews/016/833/872/non_2x/github-logo-git-hub-icon-on-white-background-free-vector.jpg",
  vscode: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQfpHRvAxXkFB4MfbjxqSJ2mS8PvHSMKuu4Ouh9Ub0nOQ&s",
  vercel: "https://www.designyourway.net/blog/wp-content/uploads/2026/02/Vercel-featured.jpg",
  javascript: "https://github.com/With-ALIF/logo_zone/blob/main/images/JavaScript.png?raw=true",
  java: "https://github.com/With-ALIF/logo_zone/blob/main/images/java.webp?raw=true",
  c: "https://github.com/With-ALIF/logo_zone/blob/main/images/c.png?raw=true",
  python: "https://github.com/With-ALIF/logo_zone/blob/main/images/python.png?raw=true",
  typescript: "https://github.com/With-ALIF/logo_zone/blob/main/images/TypeScript.png?raw=true",
  supabase: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/supabase/supabase-original.svg",
  firebase: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRPJ2IDz3rtx7pVXKfAdO1YOIU-oYI3zNsczms_pwefrLO4mFV0GgpUZhmY&s=10",
  tailwind: "https://github.com/With-ALIF/logo_zone/blob/main/images/tailwind.png?raw=true",
  tailwindcss: "https://github.com/With-ALIF/logo_zone/blob/main/images/tailwind.png?raw=true",
  lucide: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRI9rIsS-EE48tGtglJBhNcpeiz3OM9PMohWsv8d6FnOCrhA_HUy86oUtU&s=10",
  flexbox: "https://static.thenounproject.com/png/137357-200.png",
  nextjs: "https://github.com/With-ALIF/logo_zone/blob/main/images/Next%20JS.png?raw=true",
  vite: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRgLPtPpD9gmsfrHjpkUhbH6Vd5s034XpQRUeeAq7e3TBTWn7XHNaAqZ5iH&s=10",
  react: "https://github.com/With-ALIF/logo_zone/blob/main/images/React%20JS.png?raw=true",
};

export function getSkillIcon(name) {
  const key = String(name).toLowerCase().replace(/[^a-z0-9]/g, "");
  return icons[key] || null;
}
