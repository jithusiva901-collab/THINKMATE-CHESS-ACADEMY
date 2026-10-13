const isAdmin = location.pathname === '/admin/login';
if (isAdmin) {
  document.title = 'Admin sign in · ThinkMate';
  document.querySelector('#login-label').textContent = 'ADMINISTRATOR PORTAL';
  document.querySelector('#login-title').textContent = 'Academy admin login.';
  document.querySelector('#login-description').textContent = 'Sign in with your administrator credentials to manage the academy.';
  document.querySelector('.login-submit').textContent = 'Sign in to admin portal →';
  document.querySelector('#role-link').textContent = 'Student? Use student login ↗';
  document.querySelector('#role-link').href = '/login';
}
document.querySelector('#show-password').addEventListener('change',e=>document.querySelector('#password').type=e.target.checked?'text':'password');
document.querySelector('#login-form').addEventListener('submit',async e=>{
  e.preventDefault(); const button=document.querySelector('.login-submit'), error=document.querySelector('#login-error');
  button.disabled=true; error.textContent=''; const values=Object.fromEntries(new FormData(e.target));
  try {
    const response=await fetch('/api/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...values,role:isAdmin?'admin':'student'})});
    const result=await response.json(); if(!response.ok)throw new Error(result.error || 'Unable to sign in.');
    location.replace('/app');
  }catch(err){error.textContent=err.message || 'Unable to connect. Please try again.';button.disabled=false;}
});
