import './style.css'
import './jury.css'

const fallbackRankings = [
  { position: 1, name: 'Havanna', type: 'Chocolate', score: '9,4', detail: 'Cobertura intensa, dulce de leche equilibrado y una masa que se desarma justo a tiempo.', image: 'https://images.unsplash.com/photo-1575377427642-087cf684f04d?auto=format&fit=crop&w=700&q=85', badge: 'El favorito' },
  { position: 2, name: 'Jorgito', type: 'Chocolate', score: '9,1', detail: 'El clásico de kiosco que nunca falla: relleno generoso, baño parejo y mucha memoria.', image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=700&q=85', badge: 'Clásico' },
  { position: 3, name: 'Cachafaz', type: 'Chocolate', score: '8,9', detail: 'Masa tierna y un baño de chocolate con carácter que sostiene muy bien el conjunto.', image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=700&q=85', badge: 'Recomendado' },
  { position: 4, name: 'Terrabusi', type: 'Glaseado', score: '8,3', detail: 'Textura aireada y glaseado generoso para quienes prefieren un perfil más goloso.', image: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=700&q=85', badge: '' },
  { position: 5, name: 'La Recoleta', type: 'Chocolate', score: '7,8', detail: 'Una propuesta honesta, con buena proporción de relleno y final de chocolate suave.', image: 'https://images.unsplash.com/photo-1519869325930-281384150729?auto=format&fit=crop&w=700&q=85', badge: '' },
]

let rankings = fallbackRankings

const sheetId = '1ogpiw2qvxwtBVXr5hZGaQYMk3QYYPia7sFPHOEbwzew'
const sheetUrl = (name) => `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(name)}&cacheBust=${Date.now()}`

const stars = (score) => '★★★★★'.slice(0, Math.round(Number(score.replace(',', '.')) / 2))

const parseCsv = (csv) => {
  const rows = []
  let row = []
  let cell = ''
  let quoted = false

  for (let index = 0; index < csv.length; index += 1) {
    const character = csv[index]
    const nextCharacter = csv[index + 1]
    if (character === '"' && quoted && nextCharacter === '"') {
      cell += '"'
      index += 1
    } else if (character === '"') {
      quoted = !quoted
    } else if (character === ',' && !quoted) {
      row.push(cell.trim())
      cell = ''
    } else if ((character === '\n' || character === '\r') && !quoted) {
      if (character === '\r' && nextCharacter === '\n') index += 1
      row.push(cell.trim())
      if (row.some(Boolean)) rows.push(row)
      row = []
      cell = ''
    } else {
      cell += character
    }
  }
  row.push(cell.trim())
  if (row.some(Boolean)) rows.push(row)
  return rows
}

const numericScore = (score) => Number(score.replace(',', '.'))

const capitalizeName = (name) => name ? `${name.charAt(0).toUpperCase()}${name.slice(1)}` : name

const animateEvaluatedCount = (total) => {
  const counter = document.querySelector('#evaluated-count')
  if (!counter) return
  const duration = 1400
  const startedAt = performance.now()
  const update = (now) => {
    const progress = Math.min((now - startedAt) / duration, 1)
    const easedProgress = 1 - Math.pow(1 - progress, 3)
    counter.textContent = Math.round(total * easedProgress)
    if (progress < 1) requestAnimationFrame(update)
  }
  requestAnimationFrame(update)
}

const readEvaluatedTotal = (csv) => {
  const rows = parseCsv(csv)
  for (const row of rows) {
    const labelIndex = row.findIndex((value) => value.toLowerCase().includes('alfajores evaluados'))
    if (labelIndex >= 0) {
      const total = Number(row[labelIndex + 1])
      if (Number.isFinite(total)) return total
    }
  }
  return 90
}

const readRankingImages = (csv) => {
  const images = new Map()
  parseCsv(csv).slice(1).forEach((row) => {
    const name = row[0]
    const image = row[4]
    if (name && image && /^https?:\/\//.test(image)) images.set(name.trim().toLowerCase(), image.trim())
  })
  return images
}

const readPodios = (csv) => {
  const rows = parseCsv(csv)
  const categories = { A: [], B: [], C: [] }
  const categoryColumns = rows[0]?.reduce((columns, value, index) => {
    const category = value.trim().toUpperCase()
    if (['A', 'B', 'C'].includes(category)) columns[category] = index
    return columns
  }, {}) || {}

  Object.entries(categoryColumns).forEach(([category, column]) => {
    rows.slice(1).forEach((row, index) => {
      const name = row[column]?.trim()
      const score = row[column + 1]?.trim()
      if (!name || !/^\d{1,2}(?:,\d{1,3})?$/.test(score)) return
      const position = categories[category].length + 1
      categories[category].push({ name: capitalizeName(name), score, category, position, type: `Categoría ${category}`, detail: `Puesto ${position} de la categoría ${category}.` })
    })
  })
  return categories
}

const addImages = (items, images) => items.map((item, index) => ({
  ...item,
  image: images.get(item.name.toLowerCase()) || fallbackRankings[index % fallbackRankings.length].image
}))

const rankingRow = (item) => `
  <article class="ranking-row">
    <span class="row-position">${String(item.position).padStart(2, '0')}</span>
    <div class="row-thumb" style="background-image:url('${item.image}')"></div>
    <div class="row-name"><p>${item.type}</p><h3>${item.name}</h3></div>
    <p class="row-detail">${item.detail}</p>
    <div class="row-score"><strong>${item.score}</strong><span>/ 10</span></div>
  </article>
`

const rankingList = (items, className = '') => `
  <div class="ranking-list ${className}">${items.map(rankingRow).join('')}</div>
  ${items.length > 5 ? '<button class="expand-ranking" type="button" aria-expanded="false">Ver todos <span>↓</span></button>' : ''}
`

const applySheetRankings = (updatedRankings, categories) => {
  rankings = updatedRankings
  document.querySelectorAll('.podium-card').forEach((card, index) => {
    const item = rankings[index]
    if (!item) return
    card.querySelector('.category').textContent = item.type
    card.querySelector('h3').textContent = item.name
    card.querySelector('.stars').innerHTML = `${stars(item.score)} <small>${item.score}</small>`
    card.querySelector('.podium-info > p:last-child').textContent = item.detail
    card.querySelector('.card-image').style.backgroundImage = `url('${item.image}')`
  })
  document.querySelector('#general-ranking-list').innerHTML = rankingList(rankings)
  document.querySelector('#category-sections').innerHTML = Object.entries(categories).map(([category, items]) => `
    <div class="category-block">
      <div class="category-heading"><p class="eyebrow"><span></span> Categoría ${category}</p><h3>Ranking ${category}</h3><p>${items.length} alfajores evaluados</p></div>
      <div class="category-list">${items.map((item) => `<div class="category-row"><strong>${String(item.position).padStart(2, '0')}</strong><div class="category-thumb" style="background-image:url('${item.image}')"></div><h4>${item.name}</h4><span>${item.score} / 10</span></div>`).join('')}</div>
      ${items.length > 5 ? '<button class="expand-ranking" type="button" aria-expanded="false">Ver todos <span>↓</span></button>' : ''}
    </div>
  `).join('')
  const status = document.querySelector('#sheet-status')
  status.textContent = 'Datos en vivo · hoja actualizada'
  status.classList.add('is-live')
}

const loadSheetRankings = async () => {
  try {
    const responses = await Promise.all([fetch(sheetUrl('podios')), fetch(sheetUrl('ranking'))])
    if (responses.some((response) => !response.ok)) throw new Error('No se pudo leer la hoja')
    const [podiosCsv, rankingCsv] = await Promise.all(responses.map((response) => response.text()))
    const categories = readPodios(podiosCsv)
    animateEvaluatedCount(readEvaluatedTotal(podiosCsv))
    const images = readRankingImages(rankingCsv)
    const general = addImages(Object.values(categories).flat().sort((first, second) => numericScore(second.score) - numericScore(first.score)).map((item, index) => ({ ...item, position: index + 1, type: 'Ranking general', detail: 'Resultado actualizado desde la pestaña podios.' })), images)
    if (general.length < 5 || Object.values(categories).some((items) => !items.length)) throw new Error('La hoja no tiene suficientes resultados')
    Object.keys(categories).forEach((category) => { categories[category] = addImages(categories[category], images) })
    applySheetRankings(general, categories)
  } catch (error) {
    animateEvaluatedCount(90)
    document.querySelector('#sheet-status').textContent = 'Mostrando última edición disponible'
  }
}

document.querySelector('#app').innerHTML = `
  <header class="site-header">
    <a class="wordmark" href="#top" aria-label="Emma, inicio"><span>E</span>mma<span class="dot">.</span></a>
    <nav aria-label="Navegación principal">
      <a class="active" href="#ranking">Ranking</a>
      <a href="#categorias">Categorías</a>
      <a href="#jurados">Jurados</a>
      <a href="#criterios">Criterios</a>
    </nav>
    <div class="edition">Edición <strong>01</strong> <span></span> 2026</div>
  </header>

  <main id="top">
    <section class="hero">
      <div class="hero-copy reveal">
        <p class="eyebrow"><span></span> Observatorio del alfajor argentino</p>
        <h1>El ranking<br><em>más dulce</em><br>del país.</h1>
        <p class="intro">Probamos, comparamos y ordenamos los alfajores que forman parte de nuestra historia cotidiana.</p>
        <div class="evaluated-total"><strong id="evaluated-count">0</strong><span>alfajores<br>evaluados</span></div>
        <a class="text-link" href="#ranking">Ver el ranking <span>↓</span></a>
      </div>
      <div class="hero-art" aria-label="Alfajor de chocolate sobre una mesa de madera">
        <div class="stamp">100%<br><small>alfajor</small></div>
        <div class="sun"></div>
        <div class="alfajor alfajor-back"></div>
        <div class="alfajor alfajor-front"><span></span></div>
        <p class="art-caption">Una pausa que<br>se toma en serio.</p>
      </div>
    </section>

    <section class="podium-band" id="ranking">
      <div class="section-heading">
        <div><p class="eyebrow"><span></span> Resultados</p><h2>El podio</h2></div>
        <p class="section-note"><span id="sheet-status">Cargando resultados...</span><br>Una sola pregunta: ¿cuál es el mejor?</p>
      </div>
      <div class="podium">
        ${rankings.slice(0, 3).map((item, index) => `
          <article class="podium-card place-${item.position} reveal-delay-${index + 1}">
            <div class="card-image" style="background-image:url('${item.image}')"><span class="place">0${item.position}</span></div>
            <div class="podium-info"><p class="category">${item.type}</p><h3>${item.name}</h3><p class="stars">${stars(item.score)} <small>${item.score}</small></p><p>${item.detail}</p></div>
          </article>
        `).join('')}
      </div>
    </section>

    <section class="full-ranking">
      <div class="ranking-title"><p class="eyebrow"><span></span> Ranking general</p><h2>Del primero<br>al último bocado.</h2></div>
      <div id="general-ranking-list">${rankingList(rankings)}</div>
    </section>

    <section class="category-rankings" id="categorias">
      <div id="category-sections"></div>
    </section>

    <section class="criteria" id="criterios">
      <div><p class="eyebrow"><span></span> Cómo leemos un alfajor</p><h2>Siete formas<br>de medir<br>la felicidad.</h2></div>
      <div class="criteria-grid">
        <article><span>01</span><h3>Aroma</h3><p>La intensidad y calidad de los aromas que aparecen antes del primer bocado.</p></article>
        <article><span>02</span><h3>Textura</h3><p>La sensación de la masa, el relleno y la cobertura al morder.</p></article>
        <article><span>03</span><h3>Sabor</h3><p>El equilibrio, la intensidad y la persistencia de cada ingrediente.</p></article>
        <article><span>04</span><h3>Precio/calidad</h3><p>Qué tan bien se encuentra la experiencia en relación con su precio.</p></article>
        <article><span>05</span><h3>Aestetikness</h3><p>La presentación visual del alfajor y el atractivo de su propuesta.</p></article>
        <article><span>06</span><h3>Packaging</h3><p>El diseño, la información y la experiencia de abrir el envoltorio.</p></article>
        <article><span>07</span><h3>Tamaño</h3><p>La proporción y presencia del alfajor en relación con cada bocado.</p></article>
      </div>
    </section>

    <section class="jury-section" id="jurados">
      <div class="jury-heading"><p class="eyebrow"><span></span> El comité de cata</p><h2>Cinco paladares,<br>una decisión.</h2><p>Conocé a las personas detrás de cada nota. Estos perfiles quedan listos para completar y editar.</p></div>
      <div class="jury-grid">
        <article class="jury-card"><div class="jury-photo"><img src="/jurados/tomas.jpg" alt="Foto de Tomas" onerror="this.style.display='none'"><span>T</span></div><div class="jury-info"><p class="jury-number">01 / JURADO</p><h3>Tomas</h3><p class="birth">Fecha de nacimiento: <strong>00 / 00 / 0000</strong></p><p>Amante de los clásicos y defensor de la proporción perfecta entre masa y relleno. Su criterio busca sabores reconocibles y finales memorables.</p></div></article>
        <article class="jury-card"><div class="jury-photo"><img src="/jurados/isabella.jpg" alt="Foto de Isabella" onerror="this.style.display='none'"><span>I</span></div><div class="jury-info"><p class="jury-number">02 / JURADO</p><h3>Isabella</h3><p class="birth">Fecha de nacimiento: <strong>00 / 00 / 0000</strong></p><p>Explora cada textura con curiosidad. Para ella, un gran alfajor necesita equilibrio, aroma y una sorpresa en el último bocado.</p></div></article>
        <article class="jury-card"><div class="jury-photo"><img src="/jurados/jazmin.jpg" alt="Foto de Jazmin" onerror="this.style.display='none'"><span>J</span></div><div class="jury-info"><p class="jury-number">03 / JURADO</p><h3>Jazmin</h3><p class="birth">Fecha de nacimiento: <strong>00 / 00 / 0000</strong></p><p>Su radar está puesto en el chocolate y el balance del dulzor. Evalúa con precisión, pero nunca pierde la alegría de compartir.</p></div></article>
        <article class="jury-card"><div class="jury-photo"><img src="/jurados/gaston.jpg" alt="Foto de Gaston" onerror="this.style.display='none'"><span>G</span></div><div class="jury-info"><p class="jury-number">04 / JURADO</p><h3>Gaston</h3><p class="birth">Fecha de nacimiento: <strong>00 / 00 / 0000</strong></p><p>Busca el detalle que separa a un buen alfajor de uno inolvidable. Su nota final combina memoria, técnica y ganas de repetir.</p></div></article>
        <article class="jury-card"><div class="jury-photo"><img src="/jurados/emma.jpg" alt="Foto de Emma" onerror="this.style.display='none'"><span>E</span></div><div class="jury-info"><p class="jury-number">05 / JURADO</p><h3>Emma</h3><p class="birth">Fecha de nacimiento: <strong>00 / 00 / 0000</strong></p><p>Observa el equilibrio entre todos los elementos y valora esos pequeños detalles que convierten una degustación en una experiencia.</p></div></article>
      </div>
    </section>

  </main>
  <footer><a class="wordmark" href="#top"><span>E</span>mma<span class="dot">.</span></a><p>Hecho con dulce de leche y criterio.</p><p>Córdoba Capital, Argentina · 2026</p></footer>
`

loadSheetRankings()
setInterval(loadSheetRankings, 60000)

document.addEventListener('click', (event) => {
  const button = event.target.closest('.expand-ranking')
  if (!button) return
  const list = button.previousElementSibling
  const expanded = button.getAttribute('aria-expanded') === 'true'
  list.classList.toggle('is-expanded', !expanded)
  button.setAttribute('aria-expanded', String(!expanded))
  button.firstChild.textContent = expanded ? 'Ver todos ' : 'Ver menos '
  button.querySelector('span').textContent = expanded ? '↓' : '↑'
})
