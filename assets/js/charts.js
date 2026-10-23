(function () {
  'use strict';

  const palette = ['#2877b5', '#54a0cf', '#87b836', '#e1a333', '#cc5b57', '#725ca8', '#4b8791', '#92a1b1', '#16467a', '#b57a48'];

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>'"]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]);
  }

  function counts(items, key) {
    return items.reduce((result, item) => {
      const label = typeof key === 'function' ? key(item) : item[key];
      result[label || 'Não informado'] = (result[label || 'Não informado'] || 0) + 1;
      return result;
    }, Object.create(null));
  }

  function donut(data, centerLabel, routeFilter, options = {}) {
    const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);
    const total = entries.reduce((sum, [, value]) => sum + value, 0);
    if(!total)return '<div class="chart-empty">Nenhum dado disponível.</div>';
    const color=(label,index)=>/^#[0-9a-f]{6}$/i.test(options.colors?.[label]||'')?options.colors[label]:palette[index%palette.length];
    let cursor = 0;
    const segments = entries.map(([label, value], index) => {
      const start = cursor;
      cursor += value / total * 100;
      return `${color(label,index)} ${start}% ${cursor}%`;
    }).join(',');
    return `<div class="donut-wrap"><div class="donut" style="--segments:${segments}" role="img" aria-label="${escapeHtml(centerLabel)}: ${total}"><div class="donut__label">${total}<small>${escapeHtml(centerLabel)}</small></div></div><div class="chart-legend">${entries.map(([label, value], index) => `<${routeFilter ? 'button' : 'div'} ${routeFilter ? `class="legend-item panel-action chart-filter" data-filter-key="${escapeHtml(routeFilter)}" data-filter-value="${escapeHtml(label)}"` : 'class="legend-item"'} title="${escapeHtml(label)}: ${value}"><i class="legend-dot" style="background:${color(label,index)}"></i><span>${escapeHtml(label)}</span><b>${value}</b></${routeFilter ? 'button' : 'div'}>`).join('')}</div></div>`;
  }

  function bars(data, options = {}) {
    let entries = Object.entries(data).sort((a, b) => b[1] - a[1]);
    if (options.limit) entries = entries.slice(0, options.limit);
    if(!entries.length)return '<div class="chart-empty">Nenhum dado disponível.</div>';
    const max = Math.max(...entries.map(([, value]) => value), 1);
    return `<div class="bar-chart" role="img" aria-label="${escapeHtml(options.label || 'Gráfico de barras')}">${entries.map(([label, value], index) => `<div class="bar-row"><span title="${escapeHtml(label)}">${escapeHtml(options.short ? options.short(label) : label)}</span><div class="bar-track"><div class="bar-fill" style="width:${Math.max(2, value / max * 100)}%;--bar-color:${options.colors ? options.colors[index % options.colors.length] : palette[index % palette.length]}" title="${escapeHtml(label)}: ${value}"></div></div><b>${value}</b></div>`).join('')}</div>`;
  }

  function columns(data, title='Distribuição') {
    const entries=Object.entries(data),max=Math.max(1,...entries.map(([,n])=>n));
    if(!entries.some(([,n])=>n>0))return '<div class="chart-empty">Nenhum dado disponível.</div>';
    return `<div class="column-chart" role="img" aria-label="${escapeHtml(title)}">${entries.map(([label,n],index)=>`<div class="column-chart__item" title="${escapeHtml(label)}: ${n}"><strong>${n}</strong><div class="column-chart__track"><div style="height:${n/max*100}%;background:${palette[index%palette.length]}"></div></div><span>${escapeHtml(label)}</span></div>`).join('')}</div>`;
  }

  function line(values, labels, options = {}) {
    const width = 720, height = 245, padX = 38, padY = 25;
    const max = Math.max(...values, 1), min = Math.min(...values, 0);
    const range = max - min || 1;
    const points = values.map((value, index) => {
      const x = padX + index * ((width - padX * 2) / Math.max(values.length - 1, 1));
      const y = height - padY - ((value - min) / range) * (height - padY * 2);
      return { x, y, value, label: labels[index] };
    });
    const polyline = points.map(point => `${point.x},${point.y}`).join(' ');
    const area = `M ${padX} ${height - padY} L ${polyline.replaceAll(',', ' ')} L ${width - padX} ${height - padY} Z`;
    const grid = Array.from({ length: 5 }, (_, index) => {
      const y = padY + index * ((height - padY * 2) / 4);
      const value = Math.round(max - index * range / 4);
      return `<line x1="${padX}" y1="${y}" x2="${width-padX}" y2="${y}" stroke="#e7ecf1"/><text x="${padX-8}" y="${y+3}" text-anchor="end" font-size="9" fill="#8090a1">${value}</text>`;
    }).join('');
    return `<div class="chart"><svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeHtml(options.label || 'Gráfico de evolução')}">${grid}<defs><linearGradient id="chart-area" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2877b5" stop-opacity=".22"/><stop offset="1" stop-color="#2877b5" stop-opacity=".02"/></linearGradient></defs><path d="${area}" fill="url(#chart-area)"/><polyline points="${polyline}" fill="none" stroke="#2877b5" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>${points.map(point => `<g class="chart-point"><circle cx="${point.x}" cy="${point.y}" r="4" fill="#fff" stroke="#2877b5" stroke-width="3"><title>${escapeHtml(point.label)}: ${point.value}</title></circle><text x="${point.x}" y="${height-7}" text-anchor="middle" font-size="9" fill="#69798b">${escapeHtml(point.label)}</text></g>`).join('')}</svg></div>`;
  }

  function progressBuckets(items) {
    const result = { '0–20%': 0, '21–40%': 0, '41–60%': 0, '61–80%': 0, '81–100%': 0 };
    items.forEach(item => {
      if (item.progress <= 20) result['0–20%']++;
      else if (item.progress <= 40) result['21–40%']++;
      else if (item.progress <= 60) result['41–60%']++;
      else if (item.progress <= 80) result['61–80%']++;
      else result['81–100%']++;
    });
    return result;
  }

  window.AppCharts = { palette, counts, donut, bars, columns, line, progressBuckets, escapeHtml };
})();
