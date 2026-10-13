const fs=require('node:fs');
const file='outputs/thinkmate/app.js';
let code=fs.readFileSync(file,'utf8');
const from=code.indexOf('const initial='), to=code.indexOf('function toast(');
code=code.slice(0,from)+`let data, currentUser, csrfToken;
let mode='student',page='dashboard',selected=null,moved=false,search='';
let saveQueue=Promise.resolve();
async function api(url,options={}) {
  const response=await fetch(url,{...options,headers:{'Content-Type':'application/json','X-CSRF-Token':csrfToken||'',...options.headers}});
  const result=await response.json();
  if(response.status===401){location.replace(currentUser?.role==='admin'?'/admin/login':'/login');throw new Error('Please sign in again.');}
  if(!response.ok)throw new Error(result.error||'Unable to save your changes.');
  return result;
}
function save(){
  const payload=mode==='admin'?{students:data.students,classes:data.classes,announcements:data.announcements}:{completed:data.completed,enrolled:data.enrolled,solved:data.solved};
  const serialized=JSON.stringify(payload);
  const operation=saveQueue.catch(()=>{}).then(()=>api('/api/state',{method:'PUT',body:serialized}));
  saveQueue=operation;
  return operation;
}
async function refresh(){data=await api('/api/state');render();}
async function startup(){try{const me=await api('/api/me');currentUser=me.user;csrfToken=me.csrf;mode=currentUser.role;data=await api('/api/state');render();}catch(err){if(currentUser)toast(err.message);}}
`+code.slice(to);
code=code.replace('function render(){const title=',"function render(){if(!currentUser||!data)return;if(!navs().some(n=>n[0]===page))page='dashboard';const title=");
code=code.replace("${mode==='admin'?'AD':'AK'}", "${escapeHTML(currentUser.name.split(' ').map(n=>n[0]).slice(0,2).join(''))}");
code=code.replace("${mode==='admin'?'Academy admin':'Aarav Kumar'}", '${escapeHTML(currentUser.name)}');
code=code.replace("${mode==='admin'?'Demo administrator':'Intermediate · Demo student'}", "${mode==='admin'?'Administrator':escapeHTML(currentUser.level)+' · Student'}");
code=code.replace(/<div class="mode" aria-label="Demo workspace switch">.*?<\/div>/, '<span class="signed-in-role">${mode===\'admin\'?\'Admin\':\'Student\'}</span><button class="text-button" data-action="password">Change password</button><button class="btn white" data-action="logout">Log out</button>');
code=code.replace('Local demo · Sample student records', '${escapeHTML(currentUser.name)} · ${mode===\'admin\'?\'Admin\':\'Student\'}');
code=code.replace("heading('Welcome back, Aarav 👋',", "heading('Welcome back, '+escapeHTML(currentUser.name.split(' ')[0])+' 👋',");
code=code.replace("['Learning level','Intermediate','Sample student profile','trophy']", "['Learning level',escapeHTML(currentUser.level),'Your academy profile','trophy']");
code=code.replace('Explore student demo','Open my dashboard');
code=code.replace("'Sample sessions'", "'Your reserved sessions'");
code=code.replace('Sample records · Monthly academy fee:', 'Monthly academy fee:');
code=code.replace('Local sample records','Registered accounts');
code=code.replace('Sample monthly payment statuses','Recorded monthly payment statuses');
code=code.replace('Sample student profile','Your student profile');
code=code.replace('<button class="text-button" data-edit-student=', '<button class="text-button" data-student-password="${s.id}">Set password</button><button class="text-button" data-edit-student=');
code=code.replace('<label class="field">Learning level<select name="level">', '${!id?\'<label class="field">Student login password<input name="password" type="password" autocomplete="new-password" minlength="12" maxlength="128" required placeholder="At least 12 characters"></label><p class="form-note">The student will sign in with this email and password. Share the credentials with the student privately.</p>\':\'\'}<label class="field">Learning level<select name="level">');
const moveStart=code.indexOf('function move(square)'), clickStart=code.indexOf("document.addEventListener('click'");
let move=code.slice(moveStart,clickStart).replace('function move(square)', 'async function move(square)').replace('save();drawBoard();', 'await save();drawBoard();');
code=code.slice(0,moveStart)+move+code.slice(clickStart);
const handlers=code.indexOf("document.addEventListener('click'");
code=code.slice(0,handlers)+`function passwordDialog(studentId){
  const student=data.students.find(s=>s.id===studentId);
  dialog(student?'Set student password':'Change your password',\`<form id="password-form" data-student-id="\${studentId||''}">\${student?'<p>Set a new password for '+escapeHTML(student.name)+'. Their current sessions will be signed out.</p>':'<p>Changing your password signs out your current sessions. Sign in again with your new password.</p><label class="field">Current password<input type="password" name="currentPassword" autocomplete="current-password" required></label>'}<label class="field">New password<input name="password" type="password" autocomplete="new-password" minlength="12" maxlength="128" required></label><label class="field">Confirm new password<input name="confirmPassword" type="password" autocomplete="new-password" minlength="12" maxlength="128" required></label><p class="form-note">Use at least 12 characters.</p><div class="dialog-actions">\${button('Cancel','close','white')}<button class="btn" type="submit">Save password</button></div></form>\`);
}
document.addEventListener('click',async e=>{
  const el=e.target.closest('button');if(!el||!currentUser)return;
  try{
    if(el.dataset.page){page=el.dataset.page;search='';render();window.scrollTo(0,0);return}
    if(el.dataset.square){await move(el.dataset.square);return}
    if(el.dataset.editStudent){studentForm(Number(el.dataset.editStudent));return}
    if(el.dataset.studentPassword){passwordDialog(Number(el.dataset.studentPassword));return}
    if(el.dataset.paid){const s=data.students.find(s=>s.id===Number(el.dataset.paid));s.paid=!s.paid;await save();render();toast('Fee status updated.');return}
    for(const [key,list]of [['deleteStudent','students'],['deleteClass','classes'],['deleteAnnouncement','announcements']]){
      if(el.dataset[key]){const id=Number(el.dataset[key]);dialog('Remove this record?',\`<p>Remove this \${list==='students'?'student account and revoke its access':list==='classes'?'class':'announcement'} from the academy? This cannot be undone.</p><div class="dialog-actions">\${button('Cancel','close','white')}\${button('Remove record','confirm-delete:'+list+':'+id)}</div>\`);return}
    }
    const a=el.dataset.action;if(!a)return;
    if(a==='close'){$('#modal').close();return}
    if(a==='logout'){await saveQueue.catch(()=>{});await api('/api/logout',{method:'POST',body:'{}'});location.replace(mode==='admin'?'/admin/login':'/login');return}
    if(a==='password'){passwordDialog();return}
    if(a==='explore'){page='dashboard';render();window.scrollTo(0,0);return}
    if(a==='contact'){contact();return}
    if(a==='hint'){$('#puzzle-message').textContent='Hint: move the white rook from h1 to h8.';return}
    if(a==='reset-puzzle'){selected=null;moved=false;drawBoard();$('#puzzle-message').textContent='Select a white piece, then its destination.';$('#puzzle-state').textContent='Mate in 1';return}
    if(a==='add-student'){studentForm();return}
    if(a==='add-class'){dialog('Schedule a class',\`<form id="class-form"><label class="field">Class title<input name="title" required maxlength="100"></label><label class="field">Date<input name="date" type="date" required></label><label class="field">Time (IST)<input name="time" type="time" required></label><label class="field">Level<select name="level"><option>Beginner</option><option>Intermediate</option><option>Advanced</option><option>All levels</option></select></label><label class="field">Coach name<input name="coach" required maxlength="80"></label><div class="dialog-actions">\${button('Cancel','close','white')}<button class="btn" type="submit">Create class</button></div></form>\`);return}
    if(a==='add-announcement'){dialog('Share an academy update',\`<form id="announcement-form"><label class="field">Title<input name="title" maxlength="100" required></label><label class="field">Message<textarea name="body" maxlength="1500" required></textarea></label><div class="dialog-actions">\${button('Cancel','close','white')}<button class="btn" type="submit">Publish update</button></div></form>\`);return}
    const [action,id,extra]=a.split(':');
    if(action==='confirm-delete'){data[id]=data[id].filter(x=>x.id!==Number(extra));await save();$('#modal').close();await refresh();toast('Record removed.');}
    if(action==='lesson')openLesson(id);
    if(action==='complete'){if(!data.completed.includes(id))data.completed.push(id);await save();$('#modal').close();render();toast('Lesson completed. Keep up the good work!')}
    if(action==='class'){const c=data.classes.find(c=>c.id===Number(id));if(!c)return;dialog(escapeHTML(c.title),\`<span class="tag">\${escapeHTML(c.level)}</span><p>\${escapeHTML(c.day)} \${escapeHTML(c.month)} · \${escapeHTML(c.time)} IST<br>Coach: \${escapeHTML(c.coach)}</p><div class="lesson-reader"><h3>Your academy session</h3><p>Bring your chess notebook and your questions. Contact the academy to confirm your class location.</p></div><div class="dialog-actions">\${mode==='student'?button(data.enrolled.includes(c.id)?'Cancel reservation':'Reserve class','reserve:'+c.id):''}\${button('Contact academy','contact','white')}</div>\`)}
    if(action==='reserve'){const n=Number(id);if(data.enrolled.includes(n))data.enrolled=data.enrolled.filter(x=>x!==n);else data.enrolled.push(n);await save();$('#modal').close();render();toast('Class reservation updated.');}
  }catch(err){toast(err.message);try{await refresh();}catch{}}
});
document.addEventListener('input',e=>{if(e.target.id==='student-search'){search=e.target.value;$('#student-rows').innerHTML=studentRows()}});
document.addEventListener('submit',async e=>{
  if(!['student-form','class-form','announcement-form','password-form'].includes(e.target.id))return;
  e.preventDefault();const form=e.target, f=Object.fromEntries(new FormData(form));
  const submit=form.querySelector('button[type="submit"]');submit.disabled=true;
  try{
    if(Object.values(f).some(v=>!String(v).trim()))throw new Error('Please complete all fields.');
    if(form.id==='password-form'){
      if(f.password!==f.confirmPassword)throw new Error('The new passwords do not match.');
      const studentId=Number(form.dataset.studentId);
      await api(studentId?'/api/admin/student-password':'/api/password',{method:'POST',body:JSON.stringify(studentId?{studentId,password:f.password}:{currentPassword:f.currentPassword,password:f.password})});
      if(!studentId){location.replace(mode==='admin'?'/admin/login':'/login');return}
      $('#modal').close();toast('Student password updated. Previous sessions have been signed out.');return;
    }
    if(form.id==='student-form'){
      const id=Number(form.dataset.id);const s={name:f.name.trim(),email:f.email.trim(),level:f.level,paid:f.paid==='true'};
      if(!id){await api('/api/students',{method:'POST',body:JSON.stringify({...s,password:f.password})});$('#modal').close();await refresh();toast('Student account created. They can now sign in.');return}
      const at=data.students.findIndex(x=>x.id===id);data.students[at]={...s,id};
    }
    if(form.id==='class-form'){const d=new Date(f.date+'T12:00:00');data.classes.push({id:Date.now(),title:f.title.trim(),level:f.level,day:String(d.getDate()).padStart(2,'0'),month:d.toLocaleString('en',{month:'short'}).toUpperCase(),time:f.time,coach:f.coach.trim(),date:f.date});data.classes.sort((a,b)=>a.date.localeCompare(b.date))}
    if(form.id==='announcement-form')data.announcements.unshift({id:Date.now(),title:f.title.trim(),body:f.body.trim(),date:new Date().toLocaleDateString('en-IN')});
    await save();$('#modal').close();render();toast('Saved successfully.');
  }catch(err){toast(err.message);try{data=await api('/api/state');}catch{}}
  finally{submit.disabled=false}
});
window.addEventListener('pageshow',e=>{if(e.persisted)startup()});
window.addEventListener('focus',async()=>{if(currentUser){try{await refresh();}catch{}}});
startup();
`;
fs.writeFileSync(file,code);
