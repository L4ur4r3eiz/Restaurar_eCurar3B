/* ============================================================
   filters.js — Abas de filtro (cursos / onde buscar ajuda)
   Também sincroniza os marcadores do mapa quando disponível.
============================================================ */
(function(){
  'use strict';

  function setupFilter(tabsId, gridId, itemSelector, onFilter){
    var tabsEl = document.getElementById(tabsId);
    var gridEl = document.getElementById(gridId);
    if(!tabsEl || !gridEl) return;
    var items = gridEl.querySelectorAll(itemSelector);

    tabsEl.querySelectorAll('.filter-tab').forEach(function(tab){
      tab.addEventListener('click', function(){
        tabsEl.querySelectorAll('.filter-tab').forEach(function(t){ t.classList.remove('active'); });
        tab.classList.add('active');
        var f = tab.getAttribute('data-filter');
        items.forEach(function(item){
          var cat = item.getAttribute('data-category');
          item.hidden = (f !== 'todos' && cat !== f);
        });
        if(typeof onFilter === 'function'){ onFilter(f); }
      });
    });
  }

  setupFilter('courseFilters', 'courseGrid', '.course-card');

  // O filtro de ajuda também repassa a categoria para o mapa (map.js)
  setupFilter('helpFilters', 'helpGrid', '.help-card', function(f){
    if(typeof window.RC_filterMap === 'function'){ window.RC_filterMap(f); }
  });
})();
