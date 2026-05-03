const express = require('express');
const app = express();
const path = require('path');
const multer  = require('multer');
const upload = multer({ dest: 'public/uploads/' });

app.use(express.json());
app.use(express.static(path.join(__dirname, 'resources/app/wwwroot')));
app.use('/public', express.static(path.join(__dirname, 'public')));

// Exemples de routes API (à compléter)
app.get('/api/servers', (req,res)=>{ res.json([
  {id:"1", name:"JasonGaming", icon:"🎮", roles:[{name:"Admin", color:"#ee5151"},{name:"Membre", color:"#6cf"}]},
  {id:"2", name:"Copains", icon:"👋", roles:[]}
]); });
app.post('/api/servers', (req,res)=>{ res.json({ok:true}); });
app.get('/api/servers/:id/channels', (req,res)=>{ res.json([
  {id:"11", name:"général", type:"text"},
  {id:"12", name:"vocal", type:"voice"}
]); });
app.get('/api/channels/:id/messages', (req,res)=>{ res.json([
  {id:"m1", user:"Jason", color:"#7289da", date:Date.now(), text:"Bienvenue sur DiscordLike ! @Copain", attachments:[], reactions:{"👍":1,"❤️":1}},
  {id:"m2", user:"Copain", color:"#99c", date:Date.now(), text:"Salut !", attachments:[], reactions:{"😂":1}}
]); });
app.post('/api/channels/:id/messages', upload.array('files'), (req,res)=>{ res.json({ok:true}); });
app.post('/api/messages/:id/react', (req,res)=>{ res.json({ok:true}); });
// etc.

app.listen(3000,()=>console.log('Serveur local sur http://localhost:3000'));
