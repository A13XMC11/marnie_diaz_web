import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import LogoMarnieDiaz from './assets/LogoMarnieDiaz.png';
import DraHero from "./assets/dra/dra-hero.jpg";
import DraSobreMi from "./assets/dra/dra-sobre-mi.png";
import Caso1 from "./assets/galeria/caso1.png";
import Caso2 from "./assets/galeria/caso2.png";
import Caso3 from "./assets/galeria/caso3.png";
import Caso4 from "./assets/galeria/caso4.png";
import Caso5 from "./assets/galeria/caso5.jpg";

const WA_1 = "https://wa.me/593998862001";
const WA_2 = "https://wa.me/593998826201";
const WA_MSG = `${WA_1}?text=Hola%2C%20quiero%20agendar%20una%20cita%20en%20Marnie%20D%C3%ADaz%20Odontolog%C3%ADa`;

const ALL_TESTIMONIOS = [
  ["A","Andrea R.","Rehabilitación oral · Quito","Fui por una rehabilitación oral completa y quedé sin palabras. La Dra. Marnie es muy profesional, explica cada paso con claridad y el resultado superó todas mis expectativas. ¡Mi sonrisa cambió por completo!"],
  ["C","Carlos M.","Odontogeriatría · Prótesis","Llevé a mi mamá de 82 años y la atención fue increíble. La doctora tiene una paciencia enorme con los adultos mayores. La prótesis quedó perfecta y mi mamá come feliz nuevamente."],
  ["L","Lucía P.","Endodoncia · Quito","Siempre tuve miedo al dentista pero en la clínica de La Gasca me sentí muy tranquila. Me hicieron la endodoncia sin ningún dolor y el consultorio es muy accesible. 100% recomendada."],
  ["M","María F.","Diseño de Sonrisa","Siempre soñé con una sonrisa perfecta y la Dra. Marnie lo hizo posible. El diseño quedó completamente natural, exactamente lo que quería. ¡Me cambió la vida!"],
  ["R","Roberto G.","Armonía Facial","Vine por un tratamiento de armonía facial y el resultado fue increíble. La doctora tiene un ojo clínico excepcional y se nota que ama lo que hace."],
  ["P","Patricia V.","Odontogeriatría","Mi madre de 78 años necesitaba atención especializada y aquí la encontramos. La paciencia y el cuidado que le brindaron fueron extraordinarios. Totalmente recomendada."],
];

export default function MarnieDiaz() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const [formNombre, setFormNombre] = useState('');
  const [formTelefono, setFormTelefono] = useState('');
  const [formServicio, setFormServicio] = useState('');
  const [formMensaje, setFormMensaje] = useState('');

  const closeMenu = () => setMenuOpen(false);

  const total = ALL_TESTIMONIOS.length;

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % total);
    }, 4000);
    return () => clearInterval(timer);
  }, [paused, total]);

  const visibles = windowWidth >= 768 ? 3 : 1;
  const nextSlide = () => setCurrent(prev => (prev + 1) % total);
  const prevSlide = () => setCurrent(prev => (prev - 1 + total) % total);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');
        :root {
          --azure:#1a6fa8; --sky:#4ea8de; --ice:#e8f4fd; --deep:#0d3d5c;
          --white:#ffffff; --off-white:#f7fbfe; --text:#1c2b36;
          --muted:#6b8fa3; --accent:#a8d8f0;
        }
        *{margin:0;padding:0;box-sizing:border-box;}
        html{scroll-behavior:smooth;}
        body{font-family:'DM Sans',sans-serif;color:var(--text);background:var(--white);overflow-x:hidden;}

        /* NAV */
        .md-nav{position:fixed;top:0;left:0;right:0;z-index:100;display:flex;align-items:center;justify-content:space-between;padding:1.2rem 5vw;background:rgba(255,255,255,0.94);backdrop-filter:blur(14px);border-bottom:1px solid rgba(74,168,222,0.15);}
        .md-nav-logo{font-family:'Cormorant Garamond',serif;font-size:1.35rem;font-weight:600;color:var(--deep);text-decoration:none;}
        .md-nav-logo span{color:var(--azure);font-style:italic;}
        .md-nav-links{display:flex;gap:2rem;list-style:none;}
        .md-nav-links a{font-size:.8rem;font-weight:500;letter-spacing:.06em;text-transform:uppercase;color:var(--muted);text-decoration:none;transition:color .2s;}
        .md-nav-links a:hover{color:var(--azure);}
        .md-nav-cta{background:var(--azure);color:var(--white);padding:.6rem 1.5rem;border-radius:50px;font-size:.8rem;font-weight:500;text-decoration:none;transition:background .2s;}
        .md-nav-cta:hover{background:var(--deep);}
        .md-hamburger{display:none;flex-direction:column;gap:5px;cursor:pointer;background:none;border:none;padding:4px;}
        .md-hamburger span{width:24px;height:2px;background:var(--deep);border-radius:2px;display:block;}
        .md-mobile-menu{position:fixed;top:70px;left:0;right:0;background:var(--white);border-bottom:1px solid var(--ice);padding:1.5rem 5vw;z-index:99;flex-direction:column;gap:1rem;box-shadow:0 8px 24px rgba(0,0,0,.08);}
        .md-mobile-menu a{font-size:.9rem;font-weight:500;color:var(--text);text-decoration:none;padding:.5rem 0;border-bottom:1px solid var(--ice);display:block;}
        .md-mob-cta{background:var(--azure)!important;color:var(--white)!important;padding:.8rem 1.5rem!important;border-radius:50px!important;text-align:center;border:none!important;margin-top:.4rem!important;}

        /* HERO */
        .md-hero{min-height:100vh;display:grid;grid-template-columns:1fr 1fr;position:relative;overflow:hidden;padding-top:80px;}
        .md-hero-bg{position:absolute;inset:0;background:linear-gradient(135deg,var(--off-white) 55%,var(--ice) 100%);}
        .md-hero-circle{position:absolute;right:-10vw;top:50%;transform:translateY(-50%);width:55vw;height:55vw;max-width:680px;max-height:680px;border-radius:50%;background:radial-gradient(circle at 40% 40%,var(--sky),var(--deep));opacity:.1;}
        .md-hero-content{position:relative;z-index:2;display:flex;flex-direction:column;justify-content:center;padding:6vw 5vw 6vw 8vw;animation:fadeUp .8s ease both;}
        .md-hero-tag{display:inline-flex;align-items:center;gap:.5rem;background:var(--ice);border:1px solid var(--accent);border-radius:50px;padding:.4rem 1rem;font-size:.72rem;font-weight:500;color:var(--azure);letter-spacing:.08em;text-transform:uppercase;margin-bottom:1.8rem;width:fit-content;}
        .md-hero-tag::before{content:'✦';font-size:.6rem;}
        .md-hero-h1{font-family:'Cormorant Garamond',serif;font-size:clamp(2.8rem,4.5vw,5.2rem);font-weight:300;line-height:1.07;color:var(--deep);margin-bottom:1.4rem;}
        .md-hero-h1 em{font-style:italic;color:var(--azure);}
        .md-hero-sub{font-size:1rem;font-weight:300;color:var(--muted);max-width:420px;line-height:1.7;margin-bottom:2.5rem;}
        .md-hero-actions{display:flex;gap:1rem;flex-wrap:wrap;}
        .md-btn-primary{background:var(--azure);color:var(--white);padding:.9rem 2.2rem;border-radius:50px;font-size:.88rem;font-weight:500;text-decoration:none;transition:all .25s;display:inline-flex;align-items:center;gap:.5rem;}
        .md-btn-primary:hover{background:var(--deep);transform:translateY(-2px);box-shadow:0 8px 24px rgba(26,111,168,.3);}
        .md-btn-outline{border:1.5px solid var(--azure);color:var(--azure);padding:.9rem 2.2rem;border-radius:50px;font-size:.88rem;font-weight:500;text-decoration:none;transition:all .25s;}
        .md-btn-outline:hover{background:var(--ice);}
        .md-hero-stats{display:flex;gap:2.5rem;margin-top:3.5rem;}
        .md-stat-num{font-family:'Cormorant Garamond',serif;font-size:2.4rem;font-weight:600;color:var(--azure);line-height:1;}
        .md-stat-label{font-size:.78rem;color:var(--muted);margin-top:.2rem;}
        .md-hero-img-col{position:relative;z-index:2;display:flex;align-items:center;justify-content:center;padding:4vw;animation:fadeIn 1s .3s ease both;}
        .md-hero-card{background:var(--white);border-radius:24px;box-shadow:0 30px 80px rgba(13,61,92,.12);overflow:hidden;max-width:380px;width:100%;border:1px solid rgba(74,168,222,.15);}
        .md-hero-card-img{width:100%;aspect-ratio:4/5;overflow:hidden;}
        .md-hero-card-img img{width:100%;height:100%;object-fit:cover;display:block;}
        .md-hero-card-info{padding:1.5rem;}
        .md-hero-card-info h3{font-family:'Cormorant Garamond',serif;font-size:1.4rem;font-weight:600;color:var(--deep);}
        .md-hero-card-info p{font-size:.82rem;color:var(--muted);margin-top:.3rem;}
        .md-badge{display:inline-flex;align-items:center;gap:.4rem;background:var(--ice);border:1px solid var(--accent);border-radius:50px;padding:.3rem .8rem;font-size:.72rem;color:var(--azure);margin-top:.8rem;}

        /* SECTIONS */
        .md-section{padding:6rem 5vw;}
        .md-section-tag{display:inline-flex;align-items:center;gap:.5rem;font-size:.72rem;font-weight:500;letter-spacing:.1em;text-transform:uppercase;color:var(--azure);margin-bottom:1rem;}
        .md-section-tag::before{content:'';display:block;width:24px;height:1.5px;background:var(--azure);}
        .md-section-title{font-family:'Cormorant Garamond',serif;font-size:clamp(2rem,3.5vw,3.2rem);font-weight:300;color:var(--deep);line-height:1.15;}
        .md-section-title em{font-style:italic;color:var(--azure);}
        .md-section-sub{font-size:.95rem;font-weight:300;color:var(--muted);max-width:520px;line-height:1.7;margin-top:.8rem;}

        /* SERVICIOS */
        .md-servicios{background:var(--off-white);}
        .md-servicios-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1.5rem;margin-top:3rem;}
        .md-servicio-card{background:var(--white);border-radius:20px;padding:2.2rem;border:1px solid rgba(74,168,222,.12);transition:all .3s;position:relative;overflow:hidden;}
        .md-servicio-card::after{content:'';position:absolute;bottom:0;left:0;right:0;height:3px;background:linear-gradient(90deg,var(--sky),var(--azure));transform:scaleX(0);transform-origin:left;transition:transform .3s;}
        .md-servicio-card:hover{box-shadow:0 16px 48px rgba(13,61,92,.1);transform:translateY(-4px);}
        .md-servicio-card:hover::after{transform:scaleX(1);}
        .md-servicio-icon{width:52px;height:52px;border-radius:14px;background:var(--ice);display:flex;align-items:center;justify-content:center;font-size:1.5rem;margin-bottom:1.2rem;}
        .md-servicio-card h3{font-family:'Cormorant Garamond',serif;font-size:1.3rem;font-weight:600;color:var(--deep);margin-bottom:.6rem;}
        .md-servicio-card p{font-size:.85rem;color:var(--muted);line-height:1.65;}
        .md-servicio-link{display:inline-flex;align-items:center;gap:.4rem;font-size:.8rem;font-weight:500;color:var(--azure);text-decoration:none;margin-top:1rem;transition:gap .2s;}
        .md-servicio-link:hover{gap:.7rem;}

        /* SOBRE MI */
        .md-sobre{display:grid;grid-template-columns:1fr 1fr;gap:5vw;align-items:center;padding:6rem 5vw;}
        .md-sobre-img-wrap{position:relative;}
        .md-sobre-img-box{width:100%;aspect-ratio:3/4;border-radius:28px;overflow:hidden;}
        .md-sobre-img-box img{width:100%;height:100%;object-fit:cover;display:block;}
        .md-sobre-deco{position:absolute;top:-20px;right:-20px;width:120px;height:120px;border-radius:50%;border:2px dashed var(--accent);opacity:.5;}
        .md-sobre-badge{position:absolute;bottom:3rem;left:-20px;background:var(--azure);color:var(--white);border-radius:16px;padding:1rem 1.3rem;box-shadow:0 8px 24px rgba(26,111,168,.35);}
        .md-sobre-badge .num{font-family:'Cormorant Garamond',serif;font-size:2rem;font-weight:600;line-height:1;}
        .md-sobre-badge .lbl{font-size:.72rem;opacity:.85;margin-top:.2rem;}
        .md-sobre-content{padding:2rem 0;}
        .md-univ-tag{display:inline-flex;align-items:center;gap:.5rem;background:var(--ice);border:1px solid var(--accent);border-radius:8px;padding:.5rem 1rem;font-size:.78rem;color:var(--azure);margin-top:1.2rem;font-weight:500;}
        .md-sobre-list{list-style:none;margin-top:1.5rem;display:flex;flex-direction:column;gap:.9rem;}
        .md-sobre-list li{display:flex;align-items:flex-start;gap:.8rem;font-size:.88rem;color:var(--text);line-height:1.6;}
        .md-sobre-list li::before{content:'✓';min-width:22px;height:22px;background:var(--ice);border:1px solid var(--accent);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:.7rem;color:var(--azure);font-weight:700;flex-shrink:0;margin-top:1px;}
        .md-horario-box{background:var(--ice);border:1px solid var(--accent);border-radius:14px;padding:1.2rem 1.5rem;margin-top:1.8rem;display:flex;gap:2.5rem;flex-wrap:wrap;}
        .md-horario-item h4{font-size:.72rem;font-weight:500;color:var(--muted);text-transform:uppercase;letter-spacing:.06em;}
        .md-horario-item p{font-size:.88rem;color:var(--deep);font-weight:500;margin-top:.2rem;}

        /* GALERIA */
        .md-galeria{background:var(--deep);padding:6rem 5vw;}
        .md-galeria .md-section-tag{color:var(--sky);}
        .md-galeria .md-section-tag::before{background:var(--sky);}
        .md-galeria .md-section-title{color:var(--white);}
        .md-galeria .md-section-sub{color:rgba(255,255,255,.5);}
        .md-galeria-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:1rem;margin-top:3rem;}
        .md-galeria-item{border-radius:16px;overflow:hidden;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);aspect-ratio:3/4;position:relative;cursor:pointer;transition:transform .3s;}
        .md-galeria-item:first-child{grid-column:span 2;aspect-ratio:16/10;}
        .md-galeria-item:hover{transform:scale(1.02);}
        .md-galeria-inner{position:absolute;inset:0;background:linear-gradient(160deg,rgba(78,168,222,.15),rgba(13,61,92,.5));display:flex;align-items:center;justify-content:center;flex-direction:column;gap:.5rem;}
        .md-galeria-inner svg{width:34px;opacity:.35;}
        .md-galeria-label{font-size:.73rem;color:rgba(255,255,255,.55);text-align:center;padding:0 .8rem;}
        .md-galeria-overlay{position:absolute;inset:0;background:linear-gradient(to top,rgba(13,61,92,.85) 0%,transparent 55%);display:flex;align-items:flex-end;padding:1rem;opacity:0;transition:opacity .3s;}
        .md-galeria-item:hover .md-galeria-overlay{opacity:1;}
        .md-galeria-overlay span{font-size:.78rem;color:var(--white);font-weight:500;}
        .md-galeria-note{text-align:center;margin-top:1.5rem;font-size:.78rem;color:rgba(255,255,255,.3);}
        .md-galeria-social{display:flex;justify-content:center;gap:1rem;margin-top:1.8rem;flex-wrap:wrap;}
        .md-galeria-social a{display:inline-flex;align-items:center;gap:.5rem;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.15);border-radius:50px;padding:.6rem 1.4rem;font-size:.8rem;color:rgba(255,255,255,.8);text-decoration:none;transition:background .2s;}
        .md-galeria-social a:hover{background:rgba(255,255,255,.18);}

        /* TESTIMONIOS */
        .md-testimonios{background:var(--ice);}
        .md-testimonios-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1.5rem;margin-top:3rem;}
        .md-testimonio-card{background:var(--white);border-radius:20px;padding:2rem;border:1px solid rgba(74,168,222,.12);transition:box-shadow .3s;}
        .md-testimonio-card:hover{box-shadow:0 12px 36px rgba(13,61,92,.08);}
        .md-stars{display:flex;gap:3px;margin-bottom:1rem;}
        .md-stars span{color:#f0b429;font-size:.9rem;}
        .md-testimonio-text{font-size:.88rem;color:var(--text);line-height:1.75;font-style:italic;margin-bottom:1.5rem;}
        .md-testimonio-author{display:flex;align-items:center;gap:.8rem;}
        .md-author-avatar{width:42px;height:42px;border-radius:50%;background:linear-gradient(135deg,var(--sky),var(--azure));display:flex;align-items:center;justify-content:center;font-size:1rem;color:var(--white);font-weight:600;font-family:'Cormorant Garamond',serif;flex-shrink:0;}
        .md-author-name{font-size:.88rem;font-weight:500;color:var(--deep);}
        .md-author-label{font-size:.75rem;color:var(--muted);}

        /* CONTACTO */
        .md-contacto{background:var(--white);display:grid;grid-template-columns:1fr 1fr;gap:5vw;align-items:start;padding:6rem 5vw;}
        .md-contacto-info{padding:2rem 0;}
        .md-contacto-items{margin-top:2.5rem;display:flex;flex-direction:column;gap:1.4rem;}
        .md-contacto-item{display:flex;align-items:flex-start;gap:1rem;}
        .md-contacto-icon{width:44px;height:44px;border-radius:12px;background:var(--ice);border:1px solid var(--accent);display:flex;align-items:center;justify-content:center;font-size:1.1rem;flex-shrink:0;}
        .md-contacto-item h4{font-size:.75rem;font-weight:500;color:var(--muted);letter-spacing:.05em;text-transform:uppercase;}
        .md-contacto-item p,.md-contacto-item a{font-size:.92rem;color:var(--text);margin-top:.2rem;text-decoration:none;transition:color .2s;display:block;}
        .md-contacto-item a:hover{color:var(--azure);}
        .md-social-row{display:flex;gap:.8rem;margin-top:2.5rem;flex-wrap:wrap;}
        .md-social-btn{height:44px;border-radius:12px;background:var(--ice);border:1px solid var(--accent);display:inline-flex;align-items:center;justify-content:center;gap:.5rem;text-decoration:none;font-size:.8rem;color:var(--text);padding:0 1rem;transition:all .2s;white-space:nowrap;}
        .md-social-btn:hover{background:var(--azure);color:var(--white);border-color:var(--azure);transform:translateY(-2px);}
        .md-mapa-wrap{border-radius:16px;overflow:hidden;border:1px solid rgba(74,168,222,.2);margin-top:2.5rem;}
        .md-contacto-form{padding:2.5rem;background:var(--off-white);border-radius:24px;border:1px solid rgba(74,168,222,.15);}
        .md-contacto-form h3{font-family:'Cormorant Garamond',serif;font-size:1.6rem;font-weight:600;color:var(--deep);margin-bottom:1.8rem;}
        .md-form-row{display:grid;grid-template-columns:1fr 1fr;gap:1rem;}
        .md-form-group{display:flex;flex-direction:column;gap:.4rem;margin-bottom:1rem;}
        .md-form-group label{font-size:.75rem;font-weight:500;color:var(--muted);letter-spacing:.04em;text-transform:uppercase;}
        .md-form-group input,.md-form-group select,.md-form-group textarea{padding:.8rem 1rem;border:1.5px solid rgba(74,168,222,.2);border-radius:10px;background:var(--white);font-family:'DM Sans',sans-serif;font-size:.88rem;color:var(--text);outline:none;transition:border-color .2s;}
        .md-form-group input:focus,.md-form-group select:focus,.md-form-group textarea:focus{border-color:var(--azure);}
        .md-form-group textarea{resize:vertical;min-height:95px;}
        .md-form-submit{width:100%;background:var(--azure);color:var(--white);padding:1rem;border:none;border-radius:50px;font-family:'DM Sans',sans-serif;font-size:.9rem;font-weight:500;cursor:pointer;transition:all .25s;margin-top:.4rem;}
        .md-form-submit:hover{background:var(--deep);transform:translateY(-1px);box-shadow:0 8px 24px rgba(26,111,168,.3);}

        /* FOOTER */
        footer.md-footer{background:var(--deep);padding:3.5rem 5vw 0;}
        .md-footer-grid{display:grid;grid-template-columns:1.5fr 1fr 1fr;gap:3rem;padding-bottom:2.5rem;border-bottom:1px solid rgba(255,255,255,.1);}
        .md-footer-logo{font-family:'Cormorant Garamond',serif;font-size:1.3rem;font-weight:600;color:var(--white);}
        .md-footer-logo span{color:var(--sky);font-style:italic;}
        .md-footer-desc{font-size:.82rem;color:rgba(255,255,255,.4);margin-top:.6rem;line-height:1.65;}
        .md-footer-col h4{font-size:.72rem;font-weight:500;color:rgba(255,255,255,.45);text-transform:uppercase;letter-spacing:.08em;margin-bottom:1rem;}
        .md-footer-links{display:flex;flex-direction:column;gap:.5rem;}
        .md-footer-links a{font-size:.83rem;color:rgba(255,255,255,.5);text-decoration:none;transition:color .2s;display:flex;align-items:center;gap:8px;}
        .md-footer-links a svg{flex-shrink:0;}
        .md-social-btn svg{flex-shrink:0;}
        .md-footer-links a:hover{color:var(--sky);}
        .md-footer-bottom{display:flex;justify-content:space-between;align-items:center;padding:1.5rem 0;flex-wrap:wrap;gap:.8rem;}
        .md-footer-bottom p{font-size:.75rem;color:rgba(255,255,255,.25);}

        /* WA FLOAT */
        .md-wa-float{position:fixed;bottom:2rem;right:2rem;z-index:200;width:58px;height:58px;border-radius:50%;background:#25d366;box-shadow:0 4px 20px rgba(37,211,102,.5);display:flex;align-items:center;justify-content:center;text-decoration:none;animation:waPulse 2.5s infinite;}
        @keyframes waPulse{0%,100%{box-shadow:0 4px 20px rgba(37,211,102,.45);}50%{box-shadow:0 4px 36px rgba(37,211,102,.8);}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:translateY(0);}}
        @keyframes fadeIn{from{opacity:0;}to{opacity:1;}}

        @media(max-width:960px){
          .md-hero{grid-template-columns:1fr;}
          .md-hero-img-col{display:none;}
          .md-hero-content{padding:8vw 6vw 6vw;}
          .md-servicios-grid{grid-template-columns:1fr 1fr;}
          .md-sobre{grid-template-columns:1fr;}
          .md-sobre-img-wrap{display:none;}
          .md-galeria-grid{grid-template-columns:1fr 1fr;}
          .md-testimonios-grid{grid-template-columns:1fr 1fr;}
          .md-contacto{grid-template-columns:1fr;}
          .md-footer-grid{grid-template-columns:1fr 1fr;}
          .md-nav-links,.md-nav-cta{display:none;}
          .md-hamburger{display:flex;}
        }
        @media(max-width:600px){
          .md-servicios-grid{grid-template-columns:1fr;}
          .md-testimonios-grid{grid-template-columns:1fr;}
          .md-form-row{grid-template-columns:1fr;}
          .md-hero-stats{gap:1.5rem;}
          .md-footer-grid{grid-template-columns:1fr;gap:2rem;}
        }

        /* GALERIA ANTES/DESPUÉS CARDS */
        .md-ab-card{position:relative;border-radius:16px;overflow:hidden;aspect-ratio:4/3;cursor:pointer;transition:transform .3s;border:1px solid rgba(255,255,255,.12);}
        .md-ab-card:first-child{grid-column:span 2;aspect-ratio:2/1;}
        .md-ab-card:hover{transform:scale(1.02);}
        .md-ab-inner{display:flex;position:absolute;inset:0;}
        .md-ab-before{flex:1;background:radial-gradient(circle at 40% 40%,#d4b896,#b8956a);display:flex;flex-direction:column;align-items:flex-start;padding:.55rem .6rem .4rem;}
        .md-ab-after{flex:1;background:radial-gradient(circle at 60% 40%,#e8f4fd,#ffffff);display:flex;flex-direction:column;align-items:flex-end;padding:.55rem .6rem .4rem;}
        .md-ab-before-svg,.md-ab-after-svg{flex:1;width:100%;display:flex;align-items:center;justify-content:center;}
        .md-ab-divider{position:absolute;left:50%;top:0;bottom:0;width:2px;background:white;transform:translateX(-50%);display:flex;align-items:center;justify-content:center;}
        .md-ab-divider-icon{background:white;border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;font-size:.8rem;color:#333;box-shadow:0 2px 8px rgba(0,0,0,.25);flex-shrink:0;font-weight:700;}
        .md-ab-label-antes{font-size:11px;font-weight:700;letter-spacing:.05em;color:white;background:#dc2626;padding:.2rem .5rem;border-radius:4px;text-transform:uppercase;line-height:1.4;}
        .md-ab-label-despues{font-size:11px;font-weight:700;letter-spacing:.05em;color:white;background:#16a34a;padding:.2rem .5rem;border-radius:4px;text-transform:uppercase;line-height:1.4;}
        .md-ab-treatment{position:absolute;bottom:0;left:0;right:0;background:linear-gradient(to top,rgba(13,61,92,.92) 0%,transparent 100%);padding:.9rem .8rem .65rem;text-align:center;}
        .md-ab-treatment span{font-size:.78rem;color:var(--white);font-weight:500;}
        .md-ab-card img{width:100%;height:100%;object-fit:cover;display:block;}
        .md-ab-card:hover .md-galeria-overlay{opacity:1;}

        /* TESTIMONIOS CARRUSEL */
        .md-carousel-wrap{position:relative;overflow:hidden;margin-top:3rem;}
        .md-carousel-track{display:flex;transition:transform .5s ease-in-out;will-change:transform;}
        .md-carousel-slide{flex-shrink:0;padding:0 .75rem;box-sizing:border-box;}
        .md-carousel-dots{display:flex;justify-content:center;gap:8px;margin-top:1.8rem;padding:16px 0;overflow:visible;width:100%;}
        .md-carousel-dot{width:8px;height:8px;border-radius:50%;background:var(--accent);border:none;cursor:pointer;transition:background .2s,transform .2s;}
        .md-carousel-dot.active{background:var(--azure);transform:scale(1.3);}
        .md-carousel-btn{position:absolute;top:calc(50% - 20px);transform:translateY(-50%);background:var(--white);border:1.5px solid var(--accent);border-radius:50%;width:38px;height:38px;display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:10;font-size:1.1rem;color:var(--azure);transition:all .2s;box-shadow:0 4px 12px rgba(0,0,0,.1);}
        .md-carousel-btn:hover{background:var(--azure);color:var(--white);}
        .md-carousel-btn.prev{left:-8px;}
        .md-carousel-btn.next{right:-8px;}
      `}</style>

      {/* NAV */}
      <nav className="md-nav">
        <a href="#inicio" style={{display:"flex",alignItems:"center",textDecoration:"none"}}>
          <img src={LogoMarnieDiaz} alt="Marnie Díaz Odontología" style={{height:"52px",width:"auto",objectFit:"contain",background:"transparent",mixBlendMode:"multiply"}} />
        </a>
        <ul className="md-nav-links">
          {["servicios","sobre-mi","galeria","testimonios","contacto"].map(s => (
            <li key={s}><a href={`#${s}`}>{s.replace("-"," ")}</a></li>
          ))}
        </ul>
        <div style={{display:"flex",alignItems:"center",gap:"0.75rem"}}>
          <Link to="/login" className="md-nav-cta">
            Iniciar sesión
          </Link>
        </div>
        <button className="md-hamburger" onClick={() => setMenuOpen(o => !o)}>
          <span/><span/><span/>
        </button>
      </nav>

      {menuOpen && (
        <div className="md-mobile-menu">
          {["servicios","sobre-mi","galeria","testimonios","contacto"].map(s => (
            <a key={s} href={`#${s}`} onClick={closeMenu}>{s.replace("-"," ")}</a>
          ))}
          <Link to="/login" style={{fontSize:".88rem",fontWeight:500,color:"var(--azure)",padding:".6rem 0",borderBottom:"1px solid var(--ice)",display:"block",textDecoration:"none"}} onClick={closeMenu}>
            Iniciar sesión
          </Link>
          <a className="md-mob-cta" href={WA_MSG} target="_blank" rel="noreferrer" onClick={closeMenu}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white" style={{flexShrink:0}}><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            Reservar por WhatsApp
          </a>
        </div>
      )}

      {/* HERO */}
      <section id="inicio" className="md-hero">
        <div className="md-hero-bg"/>
        <div className="md-hero-circle"/>
        <div className="md-hero-content">
          <div className="md-hero-tag">Odontología Estética · Quito, Ecuador</div>
          <h1 className="md-hero-h1">Tu sonrisa,<br/>nuestra <em>obra maestra</em></h1>
          <p className="md-hero-sub">Transformamos sonrisas con tratamientos estéticos y rehabilitación oral de última generación, con la calidez y atención personalizada que mereces.</p>
          <div className="md-hero-actions">
            <a className="md-btn-primary" href={WA_MSG} target="_blank" rel="noreferrer"><svg width="16" height="16" viewBox="0 0 24 24" fill="white" style={{flexShrink:0}}><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg> Reservar cita</a>
            <a className="md-btn-outline" href="#servicios">Ver servicios</a>
          </div>
          <div className="md-hero-stats">
            {[["+ 500","Pacientes felices"],["10+","Años de experiencia"],["100%","Atención personalizada"]].map(([n,l]) => (
              <div key={l}><div className="md-stat-num">{n}</div><div className="md-stat-label">{l}</div></div>
            ))}
          </div>
        </div>
        <div className="md-hero-img-col">
          <div className="md-hero-card">
            <div className="md-hero-card-img">
              <img src={DraHero} alt="Dra. Marnie Díaz" />
            </div>
            <div className="md-hero-card-info">
              <h3>Dra. Marnie Díaz</h3>
              <p>Especialista en Odontología Estética & Integral</p>
              <div className="md-badge">📍 La Gasca, Quito · ⭐ 5.0</div>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICIOS */}
      <section id="servicios" className="md-section md-servicios">
        <div className="md-section-tag">Lo que ofrecemos</div>
        <h2 className="md-section-title">Nuestros <em>servicios</em></h2>
        <p className="md-section-sub">Tratamientos integrales para cuidar tu salud bucal y transformar tu sonrisa con tecnología avanzada y trato humano.</p>
        <div className="md-servicios-grid">
          {[
            ["✨","Odontología Estética","Diseño de sonrisa, carillas, blanqueamiento y rehabilitación oral para transformar tu imagen con resultados naturales y duraderos."],
            ["🦷","Endodoncia","Tratamiento de conductos para salvar dientes comprometidos, eliminar el dolor y preservar tu dentición natural a largo plazo."],
            ["🏥","Rehabilitación Oral","Restauración integral de la función y estética bucal mediante tratamientos avanzados y planes personalizados para cada paciente."],
            ["😊","Prótesis Dentales","Prótesis totales y parciales de alta calidad para recuperar la masticación, la fonética y la confianza en tu sonrisa."],
            ["🌿","Odontogeriatría","Atención odontológica especializada para adultos mayores, con el cuidado, paciencia y protocolo que cada etapa merece."],
            ["💆","Armonía Facial","Tratamientos complementarios para el bienestar facial y general, logrando equilibrio entre salud bucal y armonía estética."],
          ].map(([icon,title,desc]) => (
            <div className="md-servicio-card" key={title}>
              <div className="md-servicio-icon">{icon}</div>
              <h3>{title}</h3>
              <p>{desc}</p>
              <a className="md-servicio-link" href={WA_1} target="_blank" rel="noreferrer">Consultar →</a>
            </div>
          ))}
        </div>
      </section>

      {/* SOBRE MI */}
      <section id="sobre-mi" className="md-sobre">
        <div className="md-sobre-img-wrap" style={{maxWidth:'600px',margin:'0 auto'}}>
          <div className="md-sobre-img-box">
            <img src={DraSobreMi} alt="Dra. Marnie Díaz" style={{width:'100%',height:'780px',objectFit:'cover',objectPosition:'top',borderRadius:'28px'}} />
          </div>
          <div className="md-sobre-deco"/>
          <div className="md-sobre-badge"><div className="num">10+</div><div className="lbl">Años de experiencia</div></div>
        </div>
        <div className="md-sobre-content">
          <div className="md-section-tag">Conóceme</div>
          <h2 className="md-section-title">Dra. <em>Marnie Díaz</em></h2>
          <p className="md-section-sub" style={{marginTop:"1rem"}}>
            Soy odontóloga con formación en la <strong>Universidad Regional Autónoma de los Andes</strong> y especialización en Rehabilitación Oral (FACOP). Mi misión es que cada paciente viva su visita como una experiencia cómoda, segura y transformadora.
          </p>
          <div className="md-univ-tag">🎓 Esp. Rehabilitación Oral — FACOP · UNIANDES</div>
          <ul className="md-sobre-list">
            {[
              "Especialista en Odontología Estética y Rehabilitación Oral",
              "Formación en FACOP — Fundación de Actualización en Cirugía y Odontología",
              "Experta en tratamientos para todas las etapas de la vida, incluyendo adultos mayores",
              "Tratamientos de armonía facial y bienestar integral",
              "Atención cálida, personalizada y sin prisas en cada consulta",
            ].map(item => <li key={item}>{item}</li>)}
          </ul>
          <div className="md-horario-box">
            <div className="md-horario-item"><h4>Lunes a Viernes</h4><p>8:30 am — 5:00 pm</p></div>
            <div className="md-horario-item"><h4>Sábados</h4><p>9:00 am — 3:00 pm</p></div>
          </div>
          <div style={{marginTop:"2rem",display:"flex",gap:"1rem",flexWrap:"wrap"}}>
            <a className="md-btn-primary" href={WA_MSG} target="_blank" rel="noreferrer"><svg width="16" height="16" viewBox="0 0 24 24" fill="white" style={{flexShrink:0}}><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg> Reservar cita</a>
            <a className="md-btn-outline" href="tel:+593998862001" style={{display:'flex',flexDirection:'row',alignItems:'center',gap:'8px'}}><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{flexShrink:0}}><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg> Llamar</a>
          </div>
        </div>
      </section>

      {/* GALERÍA */}
      <section id="galeria" className="md-galeria">
        <div className="md-section-tag">Resultados reales</div>
        <h2 className="md-section-title">Casos & <em>Transformaciones</em></h2>
        <p className="md-section-sub">Cada sonrisa es una historia única. Síguenos en redes para ver los resultados más recientes.</p>
        <div className="md-galeria-grid">
          {([
            [Caso1,"Diseño de Sonrisa"],
            [Caso2,"Rehabilitación Oral"],
            [Caso3,"Prótesis Dental"],
            [Caso4,"Endodoncia"],
            [Caso5,"Armonía Facial"],
          ] as [string,string][]).map(([src,label]) => (
            <div className="md-ab-card" key={label}>
              <img src={src} alt={label} />
              <div className="md-galeria-overlay">
                <span>{label} — Antes &amp; Después</span>
              </div>
            </div>
          ))}
        </div>
        <div className="md-galeria-social">
          {[
            ["https://www.instagram.com/marniediazec","@marniediazec"],
            ["https://www.facebook.com/DentistaMarnieDiaz","@DentistaMarnieDiaz"],
          ].map(([href,label]) => (
            <a key={label} href={href} target="_blank" rel="noreferrer">{label}</a>
          ))}
        </div>
      </section>

      {/* TESTIMONIOS */}
      <section id="testimonios" className="md-section md-testimonios">
        <div className="md-section-tag">Lo que dicen</div>
        <h2 className="md-section-title">Pacientes que <em>sonríen</em></h2>
        <p className="md-section-sub">La satisfacción de nuestros pacientes en Quito es nuestra mayor recompensa.</p>
        <div
          className="md-carousel-wrap"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <button className="md-carousel-btn prev" onClick={prevSlide} aria-label="Anterior">‹</button>
          <button className="md-carousel-btn next" onClick={nextSlide} aria-label="Siguiente">›</button>
          <div
            className="md-carousel-track"
            style={{ transform: `translateX(-${current * (100 / visibles)}%)` }}
          >
            {ALL_TESTIMONIOS.map(([initial,name,label,text], i) => (
              <div
                className="md-carousel-slide"
                key={i}
                style={{ width: `${100 / visibles}%` }}
              >
                <div className="md-testimonio-card">
                  <div className="md-stars">{[1,2,3,4,5].map(j=><span key={j}>★</span>)}</div>
                  <p className="md-testimonio-text">"{text}"</p>
                  <div className="md-testimonio-author">
                    <div className="md-author-avatar">{initial}</div>
                    <div><div className="md-author-name">{name}</div><div className="md-author-label">{label}</div></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="md-carousel-dots">
            {ALL_TESTIMONIOS.map((_,i) => (
              <button key={i} className={`md-carousel-dot${current === i ? ' active' : ''}`} onClick={() => setCurrent(i)} aria-label={`Ir a testimonio ${i+1}`} />
            ))}
          </div>
        </div>
      </section>

      {/* CONTACTO */}
      <section id="contacto" className="md-contacto">
        <div className="md-contacto-info">
          <div className="md-section-tag">Estamos aquí</div>
          <h2 className="md-section-title">Agenda tu <em>cita</em></h2>
          <p className="md-section-sub">Visítanos en La Gasca, Quito o escríbenos directamente. ¡Con gusto te atendemos!</p>
          <div className="md-contacto-items">
            <div className="md-contacto-item">
              <div className="md-contacto-icon">📍</div>
              <div>
                <h4>Dirección</h4>
                <p>Jerónimo Leiton N24-27 y Av. La Gasca</p>
                <p style={{fontSize:".82rem",color:"var(--muted)",marginTop:"2px"}}>Parroquia La Gasca, Quito 170129, Ecuador</p>
              </div>
            </div>
            <div className="md-contacto-item">
              <div className="md-contacto-icon">📱</div>
              <div>
                <h4>WhatsApp / Teléfono</h4>
                <a href={WA_1} target="_blank" rel="noreferrer">099 886 2001</a>
                <a href={WA_2} target="_blank" rel="noreferrer">099 882 6201</a>
              </div>
            </div>
            <div className="md-contacto-item">
              <div className="md-contacto-icon">🕐</div>
              <div>
                <h4>Horarios</h4>
                <p>Lunes – Viernes: 8:30 am – 5:00 pm</p>
                <p>Sábados: 9:00 am – 3:00 pm</p>
              </div>
            </div>
          </div>
          <div className="md-social-row">
            <a className="md-social-btn" href={WA_1} target="_blank" rel="noreferrer">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#25d366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              WhatsApp
            </a>
            <a className="md-social-btn" href="https://www.instagram.com/marniediazec" target="_blank" rel="noreferrer">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="url(#ig-grad)"><defs><linearGradient id="ig-grad" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stopColor="#f09433"/><stop offset="50%" stopColor="#e6683c"/><stop offset="75%" stopColor="#dc2743"/><stop offset="100%" stopColor="#cc2366"/></linearGradient></defs><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              Instagram
            </a>
            <a className="md-social-btn" href="https://www.facebook.com/DentistaMarnieDiaz" target="_blank" rel="noreferrer">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877f2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              Facebook
            </a>
          </div>
          <div className="md-mapa-wrap">
            <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3989.7972!2d-78.5085!3d-0.2105!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sJer%C3%B3nimo+Leiton!5e0!3m2!1ses!2sec!4v1"
              width="100%" height="200" style={{border:0}} allowFullScreen loading="lazy" title="Ubicación Marnie Díaz Odontología"/>
          </div>
        </div>
        <div className="md-contacto-form">
          <h3>Solicitar una cita</h3>
          <div className="md-form-row">
            <div className="md-form-group"><label>Nombre</label><input type="text" placeholder="Tu nombre completo" value={formNombre} onChange={e=>setFormNombre(e.target.value)}/></div>
            <div className="md-form-group"><label>Teléfono</label><input type="tel" placeholder="099 000 0000" value={formTelefono} onChange={e=>setFormTelefono(e.target.value)}/></div>
          </div>
          <div className="md-form-group"><label>Correo electrónico</label><input type="email" placeholder="tucorreo@email.com"/></div>
          <div className="md-form-group">
            <label>Servicio de interés</label>
            <select value={formServicio} onChange={e=>setFormServicio(e.target.value)}>
              <option value="">Selecciona un servicio</option>
              {["Odontología Estética","Endodoncia","Rehabilitación Oral","Prótesis Dentales","Odontogeriatría","Armonía Facial","Consulta / Revisión General"].map(s=><option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="md-form-group"><label>Mensaje</label><textarea placeholder="Cuéntanos en qué podemos ayudarte..." value={formMensaje} onChange={e=>setFormMensaje(e.target.value)}/></div>
          <button className="md-form-submit" onClick={()=>{
            const partes = ['Hola, me gustaría agendar una cita en Marnie Díaz Odontología.'];
            if (formNombre) partes.push(`Nombre: ${formNombre}`);
            if (formTelefono) partes.push(`Teléfono: ${formTelefono}`);
            if (formServicio) partes.push(`Servicio: ${formServicio}`);
            if (formMensaje) partes.push(`Mensaje: ${formMensaje}`);
            window.open(`${WA_1}?text=${encodeURIComponent(partes.join('\n'))}`, '_blank');
          }}>
            Enviar por WhatsApp →
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="md-footer">
        <div className="md-footer-grid">
          <div>
            <div style={{marginBottom:".5rem"}}>
              <img src={LogoMarnieDiaz} alt="Marnie Díaz Odontología" style={{height:"40px",width:"auto",objectFit:"contain",filter:"brightness(0) invert(1)"}} />
            </div>
            <p className="md-footer-desc">Clínica dental especializada en odontología estética e integral. Jerónimo Leiton N24-27 y Av. La Gasca, Quito, Ecuador.</p>
          </div>
          <div className="md-footer-col">
            <h4>Servicios</h4>
            <div className="md-footer-links">
              {["Odontología Estética","Endodoncia","Rehabilitación Oral","Prótesis Dentales","Odontogeriatría","Armonía Facial"].map(s=>(
                <a key={s} href="#servicios">{s}</a>
              ))}
            </div>
          </div>
          <div className="md-footer-col">
            <h4>Contacto</h4>
            <div className="md-footer-links">
              <a href={WA_1} target="_blank" rel="noreferrer"><svg width="16" height="16" viewBox="0 0 24 24" fill="#4ea8de"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg> 099 886 2001</a>
              <a href={WA_2} target="_blank" rel="noreferrer"><svg width="16" height="16" viewBox="0 0 24 24" fill="#4ea8de"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg> 099 882 6201</a>
              <a href="https://www.instagram.com/marniediazec" target="_blank" rel="noreferrer"><svg width="16" height="16" viewBox="0 0 24 24" fill="url(#ig-footer)"><defs><linearGradient id="ig-footer" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stopColor="#f09433"/><stop offset="100%" stopColor="#cc2366"/></linearGradient></defs><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg> @marniediazec</a>
              <a href="https://www.facebook.com/DentistaMarnieDiaz" target="_blank" rel="noreferrer"><svg width="16" height="16" viewBox="0 0 24 24" fill="#1877f2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg> @DentistaMarnieDiaz</a>
            </div>
          </div>
        </div>
        <div className="md-footer-bottom">
          <p>© 2025 Marnie Díaz Odontología & Estética — Quito, Ecuador</p>
          <p>Lun–Vie 8:30–17:00 · Sáb 9:00–15:00</p>
        </div>
      </footer>

      {/* WA Float */}
      <a className="md-wa-float" href={WA_MSG} target="_blank" rel="noreferrer" title="Escríbenos por WhatsApp">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.116.554 4.101 1.523 5.823L0 24l6.362-1.498A11.96 11.96 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 01-5.018-1.38l-.36-.214-3.727.977.994-3.634-.235-.374A9.8 9.8 0 012.182 12C2.182 6.575 6.575 2.182 12 2.182S21.818 6.575 21.818 12 17.425 21.818 12 21.818z"/>
        </svg>
      </a>
    </>
  );
}
