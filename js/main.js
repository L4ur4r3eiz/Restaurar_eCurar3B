/* ============================================================
   main.js — Comportamento central da interface
   Header flutuante, navegação, quiz, currículo, mural e cursor.
============================================================ */
(function(){
  'use strict';

  /* ---------- Ano no rodapé ---------- */
  var yearEl = document.getElementById('year');
  if(yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Header: vira cartão flutuante ao rolar ---------- */
  var header = document.getElementById('siteHeader');
  var onScroll = function(){
    if(window.scrollY > 24){ header.classList.add('scrolled'); }
    else{ header.classList.remove('scrolled'); }
  };
  document.addEventListener('scroll', onScroll, { passive:true });
  onScroll();

  /* ---------- Navegação móvel ---------- */
  var navToggle = document.getElementById('navToggle');
  var mobileNav = document.getElementById('mobileNav');
  if(navToggle && mobileNav){
    navToggle.addEventListener('click', function(){
      var isOpen = mobileNav.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
    mobileNav.querySelectorAll('a').forEach(function(a){
      a.addEventListener('click', function(){
        mobileNav.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- Quiz ---------- */
  var quizData = {
    vendas:   {
      title: 'Seu perfil combina com Empreendedorismo &amp; Vendas',
      text: 'Você tem facilidade para se comunicar, negociar e planejar. Considere explorar cursos de empreendedorismo e vendas como ponto de partida.',
      org: 'Sebrae', course: 'Aprender a Empreender',
      desc: 'Desenvolva habilidades essenciais de planejamento, marketing e organização financeira.'
    },
    tech: {
      title: 'Seu perfil combina com Tecnologia &amp; Escritório',
      text: 'Você tem raciocínio lógico e gosta de organização. Cursos introdutórios de tecnologia e rotinas de escritório podem abrir boas portas.',
      org: 'Fundação Bradesco', course: 'Fundamentos de TI',
      desc: 'Introdução completa à tecnologia da informação e à assistência técnica básica.'
    },
    industria: {
      title: 'Seu perfil combina com Indústria &amp; Serviços',
      text: 'Você aprende fazendo e gosta de resultados concretos. Uma formação técnica industrial pode ser o seu próximo passo.',
      org: 'Senai', course: 'Metrologia Básica',
      desc: 'Passo inicial para quem deseja ingressar no mercado industrial e técnico.'
    }
  };

  var quizSteps = ['1','2','3','4','result'];
  var quizAnswers = [];
  var quizIndex = 0;

  var quizBarFill = document.getElementById('quizBarFill');
  var quizProgressLabel = document.getElementById('quizProgressLabel');
  var quizBack = document.getElementById('quizBack');
  var quizNav = document.getElementById('quizNav');

  if(quizBarFill && quizNav){
    var showStep = function(i){
      document.querySelectorAll('[data-quiz-step]').forEach(function(s){ s.classList.remove('active'); });
      var stepEl = document.querySelector('[data-quiz-step="' + quizSteps[i] + '"]');
      stepEl.classList.add('active');
      if(quizSteps[i] === 'result'){
        quizNav.style.display = 'none';
      } else {
        quizNav.style.display = 'flex';
        quizProgressLabel.textContent = 'Pergunta ' + (i+1) + ' de 4';
        quizBarFill.style.width = (((i+1)/4) * 100) + '%';
        quizBack.disabled = (i === 0);
      }
    };

    document.querySelectorAll('.quiz-option').forEach(function(opt){
      opt.addEventListener('click', function(){
        quizAnswers[quizIndex] = opt.getAttribute('data-area');
        if(quizIndex < 3){
          quizIndex++;
          showStep(quizIndex);
        } else {
          var counts = { vendas:0, tech:0, industria:0 };
          quizAnswers.forEach(function(a){ counts[a] = (counts[a]||0) + 1; });
          var winner = 'vendas';
          var best = -1;
          Object.keys(counts).forEach(function(k){
            if(counts[k] > best){ best = counts[k]; winner = k; }
          });
          var r = quizData[winner];
          document.getElementById('quizResultTitle').innerHTML = r.title;
          document.getElementById('quizResultText').textContent = r.text;
          document.getElementById('quizResultCard').innerHTML =
            '<span class="org">' + r.org + '</span><h4>' + r.course + '</h4><p>' + r.desc + '</p>';
          quizIndex = 4;
          showStep(quizIndex);
        }
      });
    });

    quizBack.addEventListener('click', function(){
      if(quizIndex > 0){ quizIndex--; showStep(quizIndex); }
    });

    document.getElementById('quizRestart').addEventListener('click', function(){
      quizAnswers = [];
      quizIndex = 0;
      showStep(0);
    });

    showStep(0);
  }

  /* ---------- Monte seu currículo ---------- */
  /* ============================================================
   Atualização do JS do Gerador de Currículo
============================================================ */
(function () {
    "use strict";

    const fieldMap = [
        {
            input: "rName",
            preview: "pName",
            defaultText: "Nome do Candidato"
        },
        {
            input: "rPhone",
            preview: "pPhone",
            defaultText: "(00) 00000-0000"
        },
        {
            input: "rEmail",
            preview: "pEmail",
            defaultText: "candidato@email.com"
        },
        {
            input: "rCity",
            preview: "pCity",
            defaultText: "Cidade - UF"
        },
        {
            input: "rObjective",
            preview: "pObjective",
            defaultText: "Objetivo profissional ou de carreira."
        },
        {
            input: "rEducation",
            preview: "pEducation",
            defaultText: "Formação acadêmica inserida no formulário ao lado."
        },
        {
            input: "rExperience",
            preview: "pExperience",
            defaultText: "Experiência profissional demonstrada aqui no espaço reservado."
        },
        {
            input: "rCourses",
            preview: "pCourses",
            defaultText: "Idiomas, informática ou cursos profissionalizantes."
        }
    ];

    fieldMap.forEach(field => {

        const input = document.getElementById(field.input);
        const preview = document.getElementById(field.preview);

        if (!input || !preview) return;

        function updatePreview() {

            const value = input.value.trim();

            if (value) {

                preview.innerHTML = value.replace(/\n/g, "<br>");

            } else {

                preview.textContent = field.defaultText;

            }
        }

        input.addEventListener("input", updatePreview);

        updatePreview();

    });

    const form = document.getElementById("resumeForm");

    if (form) {

        form.addEventListener("submit", function (e) {
            e.preventDefault();
        });

    }

    const printBtn = document.getElementById("printResume");
    const resumeSheet = document.getElementById("resumeSheet");

    // Remove qualquer clone de impressão que tenha sobrado.
    function clearPrintRoot() {
        const existing = document.getElementById("print-root");
        if (existing) existing.remove();
    }

    // Cria um clone isolado do currículo direto no <body>. Na impressão,
    // o CSS oculta todo o resto do site com display:none (e não
    // visibility:hidden), então apenas este clone é impresso — garantindo
    // UMA única página A4, sem páginas em branco e começando no topo.
    function buildPrintRoot() {
        if (!resumeSheet) return;
        clearPrintRoot();
        const root = document.createElement("div");
        root.id = "print-root";
        root.appendChild(resumeSheet.cloneNode(true));
        document.body.appendChild(root);
    }

    if (printBtn && resumeSheet) {

        printBtn.setAttribute("type", "button");

        printBtn.addEventListener("click", function () {

            buildPrintRoot();

            setTimeout(function () {

                window.print();

            }, 100);

        });

        // Limpa o clone após imprimir/cancelar. A visualização na tela
        // permanece exatamente igual ao modelo do primeiro site.
        window.addEventListener("afterprint", clearPrintRoot);

    }

})();

  /* ---------- Mural da esperança ---------- */
  var muralForm = document.getElementById('muralForm');
  var muralGrid = document.getElementById('muralGrid');
  if(muralForm && muralGrid){
    muralForm.addEventListener('submit', function(e){
      e.preventDefault();
      var msg = document.getElementById('muralMsg').value.trim();
      var name = document.getElementById('muralName').value.trim();
      if(!msg) return;
      var card = document.createElement('div');
      card.className = 'mural-card is-new';
      var p = document.createElement('p');
      p.textContent = msg;
      var cite = document.createElement('cite');
      cite.textContent = '— ' + (name || 'Anônimo');
      card.appendChild(p);
      card.appendChild(cite);
      muralGrid.insertBefore(card, muralGrid.firstChild);
      muralForm.reset();
    });
  }

  /* ---------- Detecção de ponteiro fino ---------- */
  var finePointer = window.matchMedia &&
    window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var reducedMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(finePointer){ document.documentElement.classList.add('has-fine-pointer'); }

  /* ---------- Cursor personalizado ---------- */
  if(finePointer){
    var dot = document.getElementById('cursorDot');
    var ring = document.getElementById('cursorRing');
    var mouseX = -100, mouseY = -100, ringX = -100, ringY = -100;
    var cursorSeen = false;

    document.addEventListener('mousemove', function(e){
      mouseX = e.clientX; mouseY = e.clientY;
      if(!cursorSeen){ cursorSeen = true; ringX = mouseX; ringY = mouseY; }
      dot.style.left = mouseX + 'px';
      dot.style.top = mouseY + 'px';
    });
    document.addEventListener('mouseleave', function(){
      dot.classList.add('is-hidden'); ring.classList.add('is-hidden');
    });
    document.addEventListener('mouseenter', function(){
      dot.classList.remove('is-hidden'); ring.classList.remove('is-hidden');
    });

    (function tick(){
      ringX += (mouseX - ringX) * 0.16;
      ringY += (mouseY - ringY) * 0.16;
      ring.style.left = ringX + 'px';
      ring.style.top = ringY + 'px';
      requestAnimationFrame(tick);
    })();

    var hoverTargets = 'a, button, input, textarea, select, .quiz-option, [role="button"]';
    document.addEventListener('mouseover', function(e){
      if(e.target.closest && e.target.closest(hoverTargets)){ ring.classList.add('is-active'); }
    });
    document.addEventListener('mouseout', function(e){
      if(e.target.closest && e.target.closest(hoverTargets)){ ring.classList.remove('is-active'); }
    });
  }

  /* ---------- Botões magnéticos ---------- */
  if(finePointer && !reducedMotion){
    document.querySelectorAll('.magnetic').forEach(function(btn){
      btn.addEventListener('mousemove', function(e){
        var r = btn.getBoundingClientRect();
        var relX = e.clientX - r.left - r.width/2;
        var relY = e.clientY - r.top - r.height/2;
        btn.style.transform = 'translate(' + (relX*0.24) + 'px,' + (relY*0.32) + 'px)';
      });
      btn.addEventListener('mouseleave', function(){
        btn.style.transform = 'translate(0,0)';
      });
    });
  }

  /* ---------- Barra de progresso de scroll ---------- */
  var progressBar = document.getElementById('scrollProgress');
  if(progressBar){
    var updateProgress = function(){
      var h = document.documentElement;
      var scrolled = h.scrollTop || document.body.scrollTop;
      var height = h.scrollHeight - h.clientHeight;
      var pct = height > 0 ? (scrolled / height) * 100 : 0;
      progressBar.style.width = pct + '%';
    };
    document.addEventListener('scroll', updateProgress, { passive:true });
    updateProgress();
  }

})();
