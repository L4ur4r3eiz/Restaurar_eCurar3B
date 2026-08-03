/* ============================================================
   map.js — Mapa interativo da rede de apoio (Ribeirão Pires - Compacto)
============================================================ */
(function () {
  'use strict';

  var mapEl = document.getElementById('helpMap');
  if (!mapEl || typeof L === 'undefined') return;

  var locateBtn = document.getElementById('geoLocateBtn');
  var geoStatus = document.getElementById('geoStatus');
  var geoResults = document.getElementById('geoResults');

  /* Categorias de locais com coordenadas em Ribeirão Pires - SP */
  var pontos = [
    {
      cat: 'caps', tipo: 'CAPS II', nome: 'CAPS II — Adulto',
      end: 'R. Renato Andréoli, 138 — Jd. Itacolomy, Ribeirão Pires - SP', tel: '(11) 4824-3631',
      lat: -23.7088, lng: -46.4087
    },
    {
      cat: 'caps', tipo: 'CAPS AD', nome: 'CAPS AD — Álcool e Drogas',
      end: 'Rua Virgílio Gola, 24 — Centro, Ribeirão Pires - SP', tel: '(11) 95310-9614',
      lat: -23.7121, lng: -46.4132
    },
    {
      cat: 'caps', tipo: 'CAPS Infantil', nome: 'CAPS Infantil',
      end: 'R. Primeiro de Maio, 108 — Centro, Ribeirão Pires - SP', tel: '(11) 4828-1511',
      lat: -23.7115, lng: -46.4120
    },
    {
      cat: 'cras', tipo: 'CRAS', nome: 'CRAS Ouro Fino',
      end: 'Rod. Índio Tibiriçá, 2492 — Vila Siqueira, Ribeirão Pires - SP', tel: '(11) 4823-9283',
      lat: -23.6841, lng: -46.3820
    },
    {
      cat: 'cras', tipo: 'CRAS', nome: 'CRAS Jardim Caçula',
      end: 'R. Fagundes Varela, 7 — Jardim Caçula, Ribeirão Pires - SP', tel: '(11) 4828-1327',
      lat: -23.7380, lng: -46.3980
    },
    {
      cat: 'cras', tipo: 'Assistência Social', nome: 'SAPIS — Assistência Social',
      end: 'R. Conde de Sarzedas, 333 — Pastoril, Ribeirão Pires - SP', tel: '(11) 4828-1900',
      lat: -23.7095, lng: -46.4138
    }
  ];

  // Inicia o mapa centralizado em Ribeirão Pires - SP
  var map = L.map(mapEl, { scrollWheelZoom: false }).setView([-23.7121, -46.4132], 14);

  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap &copy; CARTO',
    maxZoom: 19
  }).addTo(map);

  function makeIcon(cat) {
    return L.divIcon({
      className: '',
      html: '<div class="marker-pin ' + cat + '"></div>',
      iconSize: [22, 22],
      iconAnchor: [11, 22],
      popupAnchor: [0, -22]
    });
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function popupHtml(p, dist) {
    var maps = 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(p.end);
    var phone = p.tel
      ? '<p class="pop-phone">' + escapeHtml(p.tel) + '</p>'
      : '<p style="color:var(--ink-faint)">Telefone não divulgado</p>';

    var distTag = dist !== undefined
      ? '<p style="font-weight:700; color:var(--sky-deep); margin-bottom:.3rem;">📍 ' + dist.toFixed(2) + ' km de você</p>'
      : '';

    return '<div class="map-popup">' +
      '<span class="pop-cat">' + escapeHtml(p.tipo) + '</span>' +
      '<h4>' + escapeHtml(p.nome) + '</h4>' +
      distTag +
      '<p>' + escapeHtml(p.end) + '</p>' +
      phone +
      '<a class="btn btn-primary" href="' + maps + '" target="_blank" rel="noopener">Como chegar</a>' +
      '</div>';
  }

  var markers = [];
  pontos.forEach(function (p) {
    var m = L.marker([p.lat, p.lng], { icon: makeIcon(p.cat), title: p.nome })
      .addTo(map)
      .bindPopup(popupHtml(p));
    m._rcCat = p.cat;
    m._pontoData = p;
    markers.push(m);
  });

  /* Filtro de categorias */
  window.RC_filterMap = function (filter) {
    markers.forEach(function (m) {
      var show = (filter === 'todos' || m._rcCat === filter);
      if (show) { if (!map.hasLayer(m)) m.addTo(map); }
      else { if (map.hasLayer(m)) map.removeLayer(m); }
    });
    map.closePopup();
  };

  map.on('focus', function () { map.scrollWheelZoom.enable(); });
  map.on('blur', function () { map.scrollWheelZoom.disable(); });

  /* Fórmula de Haversine para cálculo de distância */
  function calcularDistancia(lat1, lon1, lat2, lon2) {
    var R = 6371;
    var dLat = (lat2 - lat1) * Math.PI / 180;
    var dLon = (lon2 - lon1) * Math.PI / 180;
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  var userMarker = null;
  var routeLine = null;

  /* GEOLOCALIZAÇÃO COM CARDS COMPACTOS */
  if (locateBtn) {
    locateBtn.addEventListener('click', function () {
      if (!navigator.geolocation) {
        if (geoStatus) geoStatus.textContent = 'Seu navegador não suporta geolocalização.';
        return;
      }

      if (geoStatus) geoStatus.textContent = 'Obtendo sua localização…';

      navigator.geolocation.getCurrentPosition(function (position) {
        var userLat = position.coords.latitude;
        var userLng = position.coords.longitude;

        if (geoStatus) {
          geoStatus.innerHTML = 'Sua posição: <strong>' + userLat.toFixed(4) + ', ' + userLng.toFixed(4) + '</strong>';
        }

        // Marcador do usuário
        var userIcon = L.divIcon({
          className: 'user-location-marker',
          html: '<div style="background:#0284c7; width:16px; height:16px; border-radius:50%; border:3px solid white; box-shadow:0 0 8px rgba(0,0,0,0.4);"></div>',
          iconSize: [16, 16],
          iconAnchor: [8, 8]
        });

        if (userMarker) {
          userMarker.setLatLng([userLat, userLng]);
        } else {
          userMarker = L.marker([userLat, userLng], { icon: userIcon }).addTo(map);
          userMarker.bindPopup('<b>Você está aqui</b>');
        }

        // Calcula distâncias e ordena
        var pontosComDistancia = pontos.map(function (p) {
          var dist = calcularDistancia(userLat, userLng, p.lat, p.lng);
          return Object.assign({}, p, { distancia: dist });
        });

        pontosComDistancia.sort(function (a, b) {
          return a.distancia - b.distancia;
        });

        var maisProximo = pontosComDistancia[0];

        // Atualiza popups no mapa
        markers.forEach(function (m) {
          var pEncontrado = pontosComDistancia.find(function (p) {
            return p.nome === m._pontoData.nome;
          });
          if (pEncontrado) {
            m.setPopupContent(popupHtml(pEncontrado, pEncontrado.distancia));
          }
        });

        var markerMaisProximo = markers.find(function (m) {
          return m._pontoData.nome === maisProximo.nome;
        });

        // Traça linha até o mais próximo
        if (routeLine) {
          map.removeLayer(routeLine);
        }
        routeLine = L.polyline([
          [userLat, userLng],
          [maisProximo.lat, maisProximo.lng]
        ], {
          color: '#0284c7',
          dashArray: '5, 6',
          weight: 2.5,
          opacity: 0.8
        }).addTo(map);

        if (markerMaisProximo) {
          markerMaisProximo.openPopup();
        }

        var bounds = L.latLngBounds([
          [userLat, userLng],
          [maisProximo.lat, maisProximo.lng]
        ]);

        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });

        // RENDERING DOS CARDS COMPACTOS
        if (geoResults) {
          var htmlOutput = '<div style="margin-top:1.5rem;">' +
            '<h4 style="font-size:1.05rem; margin-bottom:1rem;">Unidades mais próximas em Ribeirão Pires:</h4>' +
            '<div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: .8rem;">';

          pontosComDistancia.forEach(function (p, index) {
            var mapsUrl = 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(p.end);
            var isFirst = index === 0;
            var borderStyle = isFirst ? 'border: 1.5px solid var(--sky-deep);' : 'border: 1px solid var(--line);';
            var tagProximo = isFirst ? '<span style="background:var(--sky-deep); color:#fff; font-size:.68rem; padding:1px 6px; border-radius:10px; font-weight:700;">Mais próximo</span>' : '';

            htmlOutput += '' +
              '<div class="card" style="padding:.9rem; border-radius:var(--radius-md); background:var(--white); display:flex; flex-direction:column; justify-content:space-between; ' + borderStyle + '">' +
              '<div>' +
              '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:.4rem;">' +
              '<span style="font-size:.72rem; font-weight:700; color:var(--sky); text-transform:uppercase;">' + escapeHtml(p.tipo) + '</span>' +
              '<span style="font-size:.78rem; font-weight:700; color:var(--sky-deep);">' + p.distancia.toFixed(2) + ' km</span>' +
              '</div>' +
              '<h5 style="font-size:.95rem; line-height:1.25; margin-bottom:.4rem;">' + escapeHtml(p.nome) + ' ' + tagProximo + '</h5>' +
              '<p style="font-size:.8rem; color:var(--ink-soft); margin-bottom:.3rem; line-height:1.3;">' + escapeHtml(p.end) + '</p>' +
              (p.tel ? '<p style="font-size:.78rem; font-weight:600; color:var(--ink); margin-bottom:.8rem;"> ' + escapeHtml(p.tel) + '</p>' : '') +
              '</div>' +
              '<a href="' + mapsUrl + '" target="_blank" rel="noopener" class="btn btn-primary btn-sm" style="padding:.35rem .7rem; font-size:.78rem; text-align:center; width:100%;">Como chegar</a>' +
              '</div>';
          });

          htmlOutput += '</div></div>';
          geoResults.innerHTML = htmlOutput;
        }

      }, function (error) {
        var msg = 'Não foi possível obter sua localização.';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'Permissão de localização negada pelo navegador.';
        }
        if (geoStatus) geoStatus.textContent = msg;
      }, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      });
    });
  }

})();