'use strict';
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {promisify} = require('node:util');
const scrypt = promisify(crypto.scrypt);
const root = __dirname;
const storage = process.env.THINKMATE_DATA_DIR || path.join(root, '.private');
const port = Number(process.env.PORT || 4173);
const secure = process.env.THINKMATE_SECURE_COOKIE === 'true';
const sessionTTL = 8 * 60 * 60 * 1000;
const sessions = new Map(), attempts = new Map();
const levels = ['Beginner', 'Intermediate', 'Advanced', 'All levels'];
let db, dummyHash, mutationQueue = Promise.resolve();
const emptyProgress = () => ({completed: [], enrolled: [], solved: false});
const fail = (status, message) => {const e = new Error(message); e.status = status; throw e;};
function text(value, max = 100) {if (typeof value !== 'string' || !value.trim() || value.trim().length > max) fail(400, 'Please provide valid, complete details.'); return value.trim();}
function email(value) {const v = text(value, 254).toLowerCase(); if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) fail(400, 'Enter a valid email address.'); return v;}
function password(value) {if (typeof value !== 'string' || value.length < 12 || value.length > 128) fail(400, 'Use a password of 12–128 characters.'); return value;}
async function hashPassword(value) {const salt = crypto.randomBytes(16).toString('hex'); const key = await scrypt(value, salt, 64); return `${salt}:${key.toString('hex')}`;}
async function verify(value, hash) {if (typeof value !== 'string' || value.length > 128) return false; const [salt, expected] = hash.split(':'); const key = await scrypt(value, salt, 64); return crypto.timingSafeEqual(key, Buffer.from(expected, 'hex'));}
function persist() {const file = path.join(storage, 'database.json'); fs.writeFileSync(file + '.tmp', JSON.stringify(db, null, 2), {mode: 0o600}); fs.renameSync(file + '.tmp', file);}
function publicUser(user) {const student = db.students.find(s => s.id === user.studentId); return {id: user.id, name: student?.name || user.name, email: user.email, role: user.role, level: student?.level || null};}
function view(user) {
  const classes = user.role === 'admin' ? db.classes : db.classes.filter(c => c.studentIds.includes(user.studentId)).map(({studentIds,...c})=>c);
  const visibleIds = new Set(classes.map(c=>c.id));
  return {students: user.role === 'admin' ? db.students : db.students.filter(s => s.id === user.studentId), classes, announcements: db.announcements, ...user.progress, enrolled:user.progress.enrolled.filter(id=>visibleIds.has(id))};
}
function session(req) {const token = /(?:^|;\s*)thinkmate_session=([a-f0-9]{64})(?:;|$)/.exec(req.headers.cookie || '')?.[1]; const s = sessions.get(token); if (!s || s.expires <= Date.now()) {if (s) sessions.delete(token); return null;} const user = db.users.find(u => u.id === s.userId); return user ? {token, ...s, user} : null;}
function invalidate(userId) {for (const [token, s] of sessions) if (s.userId === userId) sessions.delete(token);}
function cookie(token, maxAge = sessionTTL / 1000) {return `thinkmate_session=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${maxAge}${secure ? '; Secure' : ''}`;}
function json(res, status, body, headers = {}) {res.writeHead(status, {'Content-Type': 'application/json; charset=utf-8', ...headers}); res.end(JSON.stringify(body));}
async function body(req) {if (!/^application\/json(?:;|$)/i.test(req.headers['content-type'] || '')) fail(415, 'Use JSON requests.'); let raw = ''; for await (const chunk of req) {raw += chunk; if (Buffer.byteLength(raw) > 256000) fail(413, 'Request too large.');} try {const value = JSON.parse(raw); if (!value || typeof value !== 'object' || Array.isArray(value)) fail(400, 'Invalid request.'); return value;} catch {fail(400, 'Invalid request.');}}
function sameOrigin(req) {const expected = process.env.THINKMATE_ORIGIN || `http://${req.headers.host}`; if (req.headers.origin !== expected) fail(403, 'Request origin is not allowed.');}
function authorize(req, role) {const s = session(req); if (!s) fail(401, 'Please sign in again.'); if (role && s.user.role !== role) fail(403, 'This action is only available to administrators.'); if (!['GET', 'HEAD'].includes(req.method)) {sameOrigin(req); if (req.headers['x-csrf-token'] !== s.csrf) fail(403, 'Invalid session request.');} return s;}
function progress(input,user) {if (!Array.isArray(input.completed) || !input.completed.every(x => ['opening', 'tactics', 'endgames'].includes(x)) || !Array.isArray(input.enrolled) || !input.enrolled.every(x => db.classes.some(c => c.id === x && c.studentIds.includes(user.studentId))) || typeof input.solved !== 'boolean') fail(400, 'Invalid learning progress or class assignment.'); return {completed: [...new Set(input.completed)], enrolled: [...new Set(input.enrolled)], solved: input.solved};}
function validateStudent(input, id) {const level = text(input.level); if (!levels.slice(0, 3).includes(level) || typeof input.paid !== 'boolean') fail(400, 'Invalid student details.'); return {id, name: text(input.name, 80), email: email(input.email), level, paid: input.paid};}
function adminState(input) {
  if (![input.students, input.classes, input.announcements].every(Array.isArray) || [input.students, input.classes, input.announcements].some(a => a.length > 2000)) fail(400, 'Invalid academy records.');
  const students = input.students.map(s => {if (!db.students.some(x => x.id === s.id)) fail(400, 'Use Add student to create an account.'); return validateStudent(s, s.id);});
  if (new Set(students.map(s => s.id)).size !== students.length || new Set(students.map(s => s.email)).size !== students.length || students.some(s => db.users.some(u => u.email === s.email && u.studentId !== s.id))) fail(400, 'An email can belong to only one account.');
  const classes = input.classes.map(c => {
    if (!Number.isSafeInteger(c.id) || !levels.includes(c.level) || !/^\d{2}$/.test(c.day) || Number(c.day) < 1 || Number(c.day) > 31 || !/^(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)$/.test(c.month)) fail(400, 'Invalid class details.');
    if (!Array.isArray(c.studentIds) || c.studentIds.some(id=>!Number.isSafeInteger(id)||!db.students.some(s=>s.id===id))) fail(400,'Choose valid students for this class.');
    const studentIds = [...new Set(c.studentIds)].filter(id=>students.some(s=>s.id===id));
    const existing=db.classes.find(x=>x.id===c.id);
    if (!c.studentIds.length && (!existing || existing.studentIds.length)) fail(400,'Assign at least one student to the class.');
    if (c.studentIds.length && !studentIds.length) return null;
    const date=text(c.date,10), time=text(c.time,5);
    const parsed=new Date(date+'T12:00:00Z');
    if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||Number.isNaN(parsed.getTime())||parsed.toISOString().slice(0,10)!==date||!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)||String(parsed.getUTCDate()).padStart(2,'0')!==c.day||parsed.toLocaleString('en',{month:'short',timeZone:'UTC'}).toUpperCase()!==c.month)fail(400,'Choose a valid class date and time.');
    return {id:c.id,title:text(c.title),level:c.level,day:c.day,month:c.month,time,coach:text(c.coach,80),date,studentIds};
  }).filter(Boolean);
  const announcements = input.announcements.map(a => {if (!Number.isSafeInteger(a.id)) fail(400, 'Invalid announcement.'); return {id:a.id,title:text(a.title),body:text(a.body,1500),date:text(a.date,50)};});
  if (new Set(classes.map(c=>c.id)).size !== classes.length || new Set(announcements.map(a=>a.id)).size !== announcements.length) fail(400, 'Duplicate records.');
  for (const u of db.users) if (u.role === 'student' && !students.some(s => s.id === u.studentId)) invalidate(u.id);
  db.users = db.users.filter(u => u.role === 'admin' || students.some(s => s.id === u.studentId));
  for (const u of db.users) {const s = students.find(s => s.id === u.studentId); if (s) u.email = s.email; u.progress.enrolled = u.progress.enrolled.filter(id => classes.some(c=>c.id===id&&(u.role==='admin'||c.studentIds.includes(u.studentId))));}
  Object.assign(db, {students, classes, announcements});
}
async function api(req, res, pathname) {
  if (pathname === '/api/login' && req.method === 'POST') {
    sameOrigin(req); const input = await body(req); const ip = req.socket.remoteAddress; const now = Date.now();
    let limit = attempts.get(ip); if (!limit || limit.until < now) limit = {count:0,until:now+15*60*1000};
    if (limit.count >= 10) fail(429, 'Too many login attempts. Try again in 15 minutes.'); limit.count++; attempts.set(ip, limit);
    if (!['student', 'admin'].includes(input.role)) fail(400, 'Choose a valid login page.');
    const user = db.users.find(u => u.email === String(input.email).trim().toLowerCase()); const valid = await verify(input.password, user?.passwordHash || dummyHash);
    if (!valid || !user || user.role !== input.role) fail(401, 'Email or password is incorrect for this login page.');
    attempts.delete(ip); const existing = session(req); if (existing) sessions.delete(existing.token);
    const token = crypto.randomBytes(32).toString('hex'), csrf = crypto.randomBytes(24).toString('hex'); sessions.set(token, {userId:user.id,csrf,expires:Date.now()+sessionTTL});
    return json(res,200,{user:publicUser(user),csrf},{'Set-Cookie':cookie(token)});
  }
  if (pathname === '/api/me' && req.method === 'GET') {const s = authorize(req); return json(res,200,{user:publicUser(s.user),csrf:s.csrf});}
  if (pathname === '/api/logout' && req.method === 'POST') {const s = authorize(req); sessions.delete(s.token); return json(res,200,{ok:true},{'Set-Cookie':cookie('',0)});}
  if (pathname === '/api/state' && req.method === 'GET') return json(res,200,view(authorize(req).user));
  if (pathname === '/api/state' && req.method === 'PUT') {
    const s = authorize(req), input = await body(req);
    if (s.user.role === 'admin') adminState(input);
    else {if (Object.keys(input).some(k => !['completed','enrolled','solved'].includes(k))) fail(403, 'Students can only update their own learning progress.'); s.user.progress = progress(input,s.user);}
    persist(); return json(res,200,view(s.user));
  }
  if (pathname === '/api/students' && req.method === 'POST') {
    authorize(req,'admin'); const input = await body(req); const id = Date.now(); const student = validateStudent(input,id);
    if (db.users.some(u=>u.email===student.email)) fail(409,'An account with this email already exists.');
    const passwordHash = await hashPassword(password(input.password));
    db.students.push(student); db.users.push({id:crypto.randomUUID(),studentId:id,name:student.name,email:student.email,role:'student',passwordHash,progress:emptyProgress()}); persist(); return json(res,201,{student});
  }
  if (pathname === '/api/admin/student-password' && req.method === 'POST') {
    authorize(req,'admin'); const input = await body(req); const user = db.users.find(u=>u.studentId===input.studentId && u.role==='student'); if (!user) fail(404,'Student not found.'); user.passwordHash = await hashPassword(password(input.password)); invalidate(user.id); persist(); return json(res,200,{ok:true});
  }
  if (pathname === '/api/password' && req.method === 'POST') {
    const s = authorize(req), input = await body(req); if (!await verify(input.currentPassword,s.user.passwordHash)) fail(400,'Current password is incorrect.'); const next = password(input.password); if (next === input.currentPassword) fail(400,'Choose a different password.'); s.user.passwordHash = await hashPassword(next); invalidate(s.user.id); persist(); return json(res,200,{ok:true},{'Set-Cookie':cookie('',0)});
  }
  fail(404,'Endpoint not found.');
}
const publicFiles = new Map([['/login.css','login.css'],['/login.html','login.html'],['/login.js','login.js'],['/styles.css','styles.css'],['/theme.css','theme.css'],['/assets/academy-theme.png','assets/academy-theme.png']]);
async function handle(req,res) {
  res.setHeader('Cache-Control','no-store'); res.setHeader('X-Content-Type-Options','nosniff'); res.setHeader('X-Frame-Options','DENY'); res.setHeader('Referrer-Policy','same-origin');
  res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'");
  if (secure) res.setHeader('Strict-Transport-Security','max-age=31536000');
  try {
    const pathname = new URL(req.url,'http://localhost').pathname;
    if (pathname === '/healthz' && req.method === 'GET') return json(res,200,{ok:true});
    if (pathname.startsWith('/api/')) return await api(req,res,pathname);
    if (!['GET','HEAD'].includes(req.method)) fail(405,'Method not allowed.');
    let file = publicFiles.get(pathname);
    if (['/','/app','/index.html','/app.js'].includes(pathname)) {
      if (!session(req)) {if(pathname==='/app.js') fail(401,'Please sign in.'); res.writeHead(302,{Location:'/login'}); return res.end();}
      file = pathname === '/app.js' ? 'app.js' : 'index.html';
    }
    if (['/login','/admin/login'].includes(pathname)) file = 'login.html';
    if (!file) fail(404,'Page not found.');
    const bytes = fs.readFileSync(path.join(root,file)); const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png'};
    res.writeHead(200,{'Content-Type':mime[path.extname(file)]}); res.end(req.method==='HEAD' ? undefined : bytes);
  } catch(e) {if (!res.headersSent) json(res,e.status || 500,{error:e.status?e.message:'Something went wrong. Please try again.'}); else res.end();}
}
async function main() {
  if(process.env.NODE_ENV==='production' && (!secure || !/^https:\/\/[^/]+$/.test(process.env.THINKMATE_ORIGIN||'')))throw new Error('Production requires secure cookies and an exact HTTPS origin.');
  fs.mkdirSync(storage,{recursive:true,mode:0o700}); const file=path.join(storage,'database.json');
  if (fs.existsSync(file)) db=JSON.parse(fs.readFileSync(file,'utf8'));
  else {
    const adminEmail=email(process.env.THINKMATE_ADMIN_EMAIL || 'admin@thinkmate.academy'); const adminPassword=password(process.env.THINKMATE_ADMIN_PASSWORD || crypto.randomBytes(18).toString('base64url'));
    db={users:[{id:crypto.randomUUID(),name:'Academy admin',email:adminEmail,role:'admin',passwordHash:await hashPassword(adminPassword),progress:emptyProgress()}],students:[],classes:[],announcements:[{id:1,title:'Welcome to ThinkMate',body:'Think smart. Play smart. Your next great move starts here.',date:'Academy update'}]}; persist();
    if (!process.env.THINKMATE_ADMIN_PASSWORD) fs.writeFileSync(path.join(storage,'initial-admin.txt'),`ThinkMate initial administrator account\nLogin: http://127.0.0.1:${port}/admin/login\nEmail: ${adminEmail}\nPassword: ${adminPassword}\n\nKeep this file private. Change the password after signing in.\n`,{mode:0o600});
    console.log('Administrator account created. Initial credentials are in the private data directory (unless supplied through environment variables).');
  }
  // Old shared classes stay visible to admins until explicitly assigned.
  let migrated=false;
  for(const c of db.classes)if(!Array.isArray(c.studentIds)){c.studentIds=[];migrated=true;}
  if(migrated)persist();
  dummyHash=await hashPassword(crypto.randomBytes(24).toString('hex'));
  setInterval(()=>{const now=Date.now(); for(const [t,s]of sessions)if(s.expires<=now)sessions.delete(t);for(const [ip,a]of attempts)if(a.until<now)attempts.delete(ip);},60000).unref();
  http.createServer((req,res)=>{if(!['GET','HEAD'].includes(req.method)){mutationQueue=mutationQueue.then(()=>handle(req,res)).catch(()=>{if(!res.headersSent)json(res,500,{error:'Request failed.'});});}else handle(req,res);}).listen(port,process.env.HOST || '127.0.0.1',()=>console.log(`ThinkMate: http://127.0.0.1:${port}/login · Admin: /admin/login`));
}
main().catch(()=>{console.error('Unable to start ThinkMate. Check the data directory and configuration.');process.exit(1);});
