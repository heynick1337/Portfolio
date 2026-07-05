/* ── HERO CANVAS: Minimal floating dots + faint grid ── */
(function(){
  const canvas = document.getElementById('hero-canvas');
  const ctx = canvas.getContext('2d');
  const hero = document.getElementById('hero');
  let W, H, frame = 0;
  let mouse = {x:-9999, y:-9999};

  function resize(){
    const r = hero.getBoundingClientRect();
    W = canvas.width = r.width;
    H = canvas.height = r.height;
  }
  resize();
  window.addEventListener('resize', ()=>{ resize(); pts.forEach(p=>{p.x=Math.random()*W;p.y=Math.random()*H;}); }, {passive:true});

  hero.addEventListener('mousemove', e=>{
    const r = hero.getBoundingClientRect();
    mouse.x = e.clientX - r.left;
    mouse.y = e.clientY - r.top;
  }, {passive:true});
  hero.addEventListener('mouseleave', ()=>{ mouse.x=-9999; mouse.y=-9999; });

  /* Floating particles — very sparse, very subtle */
  const N = 38;
  const pts = Array.from({length:N}, ()=>({
    x: Math.random()*1440, y: Math.random()*900,
    vx: (Math.random()-.5)*.18, vy: (Math.random()-.5)*.18,
    r: Math.random()*.7+.3,
    t: Math.random()*Math.PI*2,
    kind: Math.random() < .15 ? 'bright' : 'dim'
  }));

  /* Static grid — drawn once as reference lines */
  function drawGrid(){
    const step = 80;
    ctx.strokeStyle = 'rgba(91,156,246,0.025)';
    ctx.lineWidth = .5;
    for(let x=0;x<W;x+=step){
      ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke();
    }
    for(let y=0;y<H;y+=step){
      ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke();
    }
  }

  function draw(){
    frame++;
    ctx.clearRect(0,0,W,H);

    /* grid */
    drawGrid();

    /* subtle right-side gradient vignette */
    const rg = ctx.createRadialGradient(W*.8,H*.35,0,W*.8,H*.35,W*.5);
    rg.addColorStop(0,'rgba(91,156,246,0.04)');
    rg.addColorStop(1,'transparent');
    ctx.fillStyle = rg;
    ctx.fillRect(0,0,W,H);

    /* particles + connections */
    pts.forEach(p=>{
      /* gentle mouse pull */
      const dx = mouse.x-p.x, dy = mouse.y-p.y;
      const md = Math.sqrt(dx*dx+dy*dy);
      if(md < 160 && md > 0){ p.vx += dx/md*.008; p.vy += dy/md*.008; }
      const spd = Math.sqrt(p.vx*p.vx+p.vy*p.vy);
      if(spd > .4){ p.vx *= .94; p.vy *= .94; }
      p.x += p.vx; p.y += p.vy; p.t += .025;
      if(p.x<0||p.x>W) p.vx*=-1;
      if(p.y<0||p.y>H) p.vy*=-1;

      const pr = p.r + Math.sin(p.t)*.3;
      const alpha = p.kind==='bright' ? .55 : .22;
      ctx.beginPath(); ctx.arc(p.x,p.y,pr,0,Math.PI*2);
      ctx.fillStyle = `rgba(91,156,246,${alpha})`; ctx.fill();
    });

    /* connections */
    const D = 110;
    for(let i=0;i<N;i++){
      for(let j=i+1;j<N;j++){
        const a=pts[i],b=pts[j];
        const dx=a.x-b.x,dy=a.y-b.y;
        const d=Math.sqrt(dx*dx+dy*dy);
        if(d<D){
          ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y);
          ctx.strokeStyle=`rgba(91,156,246,${.09*(1-d/D)})`;
          ctx.lineWidth=.5; ctx.stroke();
        }
      }
    }

    requestAnimationFrame(draw);
  }
  draw();
})();

/* ── NAV scroll ── */
const nav = document.getElementById('nav');
window.addEventListener('scroll',()=>nav.classList.toggle('scrolled',scrollY>20),{passive:true});

/* ── Hamburger ── */
const ham = document.getElementById('ham');
const mob = document.getElementById('mob');
ham.addEventListener('click',()=>mob.classList.toggle('open'));
function closeMenu(){ mob.classList.remove('open'); }

/* ── Scroll reveal ── */
const io = new IntersectionObserver(entries=>{
  entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
},{threshold:.1});
document.querySelectorAll('.r').forEach(el=>io.observe(el));

/* ── Skill bar animation ── */
const barObs = new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      e.target.querySelectorAll('.sk-bar-fill').forEach((b,i)=>{
        setTimeout(()=>b.classList.add('on'), i*160+300);
      });
      barObs.unobserve(e.target);
    }
  });
},{threshold:.3});
document.querySelectorAll('.skill-card').forEach(el=>barObs.observe(el));


/* ── Certificate gallery filter ── */
(function(){
  const filters = document.querySelectorAll('.cgal-filter');
  const cards   = document.querySelectorAll('.cert-card');

  filters.forEach(btn => {
    btn.addEventListener('click', () => {
      // update active state
      filters.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const cat = btn.dataset.filter;
      cards.forEach(card => {
        const match = cat === 'all' || card.dataset.cat === cat;
        // animate out/in
        if(match){
          card.style.display = '';
          requestAnimationFrame(()=>{
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          });
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(12px)';
          setTimeout(()=>{ if(card.dataset.cat !== btn.dataset.filter && btn.dataset.filter !== 'all') card.style.display='none'; }, 250);
        }
      });
    });
  });

  // smooth transition on cards
  cards.forEach(c=>{
    c.style.transition = 'opacity .25s ease, transform .25s ease, border-color .25s, box-shadow .25s, transform .25s';
  });
})();

const form = document.getElementById("cform");
const status = document.getElementById("form-status");
const btnText = form.querySelector("button span");

form.onsubmit = async (e) => {
    e.preventDefault();
    btnText.textContent = "Sending...";

    try {
    const res = await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" }
    });

    if (res.ok) {
        status.className = "success";
        status.textContent = "✓ Your message has been sent successfully!";
        form.reset();
    } else {
        status.className = "error";
        status.textContent = "⚠ Something went wrong. Please try again.";
      }
    } catch {
        status.className = "error";
        status.textContent = "⚠ Network error. Please check your connection.";
    }
      
    btnText.textContent = "Send message";
};
