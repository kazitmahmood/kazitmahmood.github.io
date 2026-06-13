/* ============================================================
   ===== VISUAL FLOW UPGRADE =====
   Injects the scroll progress bar, color-matched section
   dividers, per-section entrance transitions, aurora background
   layers, and the cursor-follow card glow.
   Styles live in assets/css/enhancements.css.
   ============================================================ */

;(function () {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    /*===== SCROLL PROGRESS BAR =====*/
    const progressBar = document.createElement('div')
    progressBar.id = 'scroll-progress'
    progressBar.setAttribute('aria-hidden', 'true')
    document.body.appendChild(progressBar)

    let progressQueued = false
    function paintProgress() {
        progressQueued = false
        const doc = document.documentElement
        const max = doc.scrollHeight - window.innerHeight
        const ratio = max > 0 ? Math.min(window.scrollY / max, 1) : 0
        progressBar.style.transform = `scaleX(${ratio})`
    }
    window.addEventListener('scroll', () => {
        if (!progressQueued) {
            progressQueued = true
            window.requestAnimationFrame(paintProgress)
        }
    }, { passive: true })
    window.addEventListener('resize', paintProgress)
    window.addEventListener('load', paintProgress)
    paintProgress()

    /*===== SECTION DIVIDERS =====*/
    const sections = Array.from(document.querySelectorAll('main > section'))

    // Sections whose background is a gradient (computed backgroundColor is
    // transparent) need an explicit top color. Contact gets a horizontal
    // gradient fill approximating its 135deg navy gradient.
    const bgOverrides = {
        'measurement-showcase': '#f8fbff',
        'contact': ['#112347', '#16315f']
    }

    function sectionColor(sec) {
        if (bgOverrides[sec.id]) return bgOverrides[sec.id]
        const c = getComputedStyle(sec).backgroundColor
        return (!c || c === 'transparent' || c === 'rgba(0, 0, 0, 0)') ? 'rgb(255, 255, 255)' : c
    }

    // Each shape is drawn as a faded "echo" layer plus a solid layer,
    // anchored to the divider bottom so it merges into the next section.
    const shapeDefs = {
        wave: {
            viewBox: '0 0 2880 96',
            paths: [
                { d: 'M0,64 C240,30 480,30 720,64 C960,98 1200,98 1440,64 C1680,30 1920,30 2160,64 C2400,98 2640,98 2880,64 L2880,96 L0,96 Z', opacity: 0.45 },
                { d: 'M0,52 C240,90 480,90 720,52 C960,14 1200,14 1440,52 C1680,90 1920,90 2160,52 C2400,14 2640,14 2880,52 L2880,96 L0,96 Z', opacity: 1 }
            ]
        },
        curve: {
            viewBox: '0 0 1440 96',
            paths: [
                { d: 'M0,96 C360,0 1080,0 1440,96 Z', opacity: 0.4 },
                { d: 'M0,96 C360,42 1080,42 1440,96 Z', opacity: 1 }
            ]
        },
        slant: {
            viewBox: '0 0 1440 96',
            paths: [
                { d: 'M0,96 L1440,0 L1440,96 Z', opacity: 0.4 },
                { d: 'M0,96 L1440,32 L1440,96 Z', opacity: 1 }
            ]
        },
        peaks: {
            viewBox: '0 0 1440 96',
            paths: [
                { d: 'M0,96 L240,34 L480,70 L760,18 L1040,64 L1240,30 L1440,96 Z', opacity: 0.4 },
                { d: 'M0,96 L240,58 L480,84 L760,44 L1040,80 L1240,56 L1440,96 Z', opacity: 1 }
            ]
        }
    }
    const shapeOrder = ['wave', 'curve', 'slant', 'peaks']
    const shapeOverrides = {
        'education>research': { type: 'wave', flip: false, className: 'sdiv--echo-wave' },
        'research>research-experience': { type: 'wave', flip: false, className: 'sdiv--echo-wave' },
        'publications>conferences': { type: 'wave', flip: false },
        'conferences>posters': { type: 'wave', flip: false },
        'posters>teaching': { type: 'wave', flip: false, className: 'sdiv--echo-wave' },
        'skills>projects': { type: 'wave', flip: false, className: 'sdiv--echo-wave' },
        'measurement-showcase>blogs': { type: 'wave', flip: false },
        'journeys>contact': { type: 'wave', flip: false, className: 'sdiv--contact-wave' }
    }
    let shapeCount = 0
    let gradientCount = 0
    const dividers = []

    sections.forEach((sec, i) => {
        if (i === 0) return
        const prev = sections[i - 1]
        if (prev.classList.contains('hero')) return

        const prevColor = sectionColor(prev)
        const nextColor = sectionColor(sec)
        const divider = document.createElement('div')
        divider.setAttribute('aria-hidden', 'true')
        const shapeOverride = shapeOverrides[`${prev.id}>${sec.id}`]

        const sameColor = !shapeOverride && !Array.isArray(prevColor) && !Array.isArray(nextColor) && prevColor === nextColor
        if (sameColor) {
            divider.className = 'sdiv sdiv--orn'
            divider.innerHTML =
                '<span class="sdiv__orn">' +
                    '<span class="sdiv__orn-line"></span>' +
                    '<span class="sdiv__orn-gem"></span>' +
                    '<span class="sdiv__orn-line sdiv__orn-line--r"></span>' +
                '</span>'
        } else {
            const type = shapeOverride?.type || shapeOrder[shapeCount % shapeOrder.length]
            const flip = shapeOverride?.flip ?? (shapeCount % 2 === 1)
            if (!shapeOverride) shapeCount += 1
            const shape = shapeDefs[type]

            let fill = nextColor
            let defs = ''
            if (Array.isArray(nextColor)) {
                const gradId = `sdiv-grad-${gradientCount++}`
                defs =
                    `<defs><linearGradient id="${gradId}" x1="0" y1="0" x2="1" y2="0">` +
                        `<stop offset="0" stop-color="${nextColor[0]}"></stop>` +
                        `<stop offset="1" stop-color="${nextColor[1]}"></stop>` +
                    '</linearGradient></defs>'
                fill = `url(#${gradId})`
            }

            divider.className = `sdiv sdiv--shape sdiv--${type}${flip ? ' sdiv--flip' : ''}${shapeOverride?.className ? ` ${shapeOverride.className}` : ''}`
            divider.innerHTML =
                `<div class="sdiv__svg"><svg viewBox="${shape.viewBox}" preserveAspectRatio="none" focusable="false">${defs}` +
                shape.paths.map(p => `<path d="${p.d}" fill="${fill}" fill-opacity="${p.opacity}"></path>`).join('') +
                '</svg></div>'
        }

        sec.parentElement.insertBefore(divider, sec)
        dividers.push(divider)
    })

    // Scroll-position-dependent widgets (timeline runner, dot nav, ...)
    // measure the page while a section is mid-transition. Re-fire their
    // scroll handlers once geometry has settled so they self-correct.
    let scrollRefreshQueued = false
    function refreshScrollUI() {
        if (scrollRefreshQueued) return
        scrollRefreshQueued = true
        window.requestAnimationFrame(() => {
            scrollRefreshQueued = false
            window.dispatchEvent(new Event('scroll'))
        })
    }

    let dividerObs = null
    function revealDivider(divider) {
        // also reveal every divider above this one, so jumped-past
        // dividers never linger in their hidden state
        const idx = dividers.indexOf(divider)
        for (let j = 0; j <= idx; j++) {
            if (dividers[j].classList.contains('sdiv-in')) continue
            dividers[j].classList.add('sdiv-in')
            if (dividerObs) dividerObs.unobserve(dividers[j])
        }
    }

    if (dividers.length) {
        dividerObs = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return
                revealDivider(entry.target)
            })
        }, { threshold: 0.2 })
        dividers.forEach(d => dividerObs.observe(d))
    }

    /*===== PER-SECTION ENTRANCE TRANSITIONS =====*/
    if (!reduceMotion) {
        const stxTypes = ['wipe', 'rise', 'slide-l', 'zoom', 'slide-r', 'tilt']
        const stxSections = sections.filter(sec => !sec.classList.contains('hero'))
        stxSections.forEach((sec, i) => { sec.dataset.stx = stxTypes[i % stxTypes.length] })
        document.documentElement.classList.add('stx-enabled')

        let stxObs = null

        function settleInstant(sec) {
            if (sec.classList.contains('stx-in')) return
            sec.classList.add('stx-in', 'stx-settled')
            if (stxObs) stxObs.unobserve(sec)
            refreshScrollUI()
        }

        function revealSection(sec) {
            if (sec.classList.contains('stx-in')) return
            // sections above this one were jumped past: show them instantly
            const idx = stxSections.indexOf(sec)
            for (let j = 0; j < idx; j++) settleInstant(stxSections[j])
            sec.classList.add('stx-in')
            if (stxObs) stxObs.unobserve(sec)
            window.setTimeout(() => {
                sec.classList.add('stx-settled')
                refreshScrollUI()
            }, 1300)
        }

        stxObs = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return
                revealSection(entry.target)
            })
        }, { threshold: 0, rootMargin: '0px 0px -10% 0px' })

        stxSections.forEach(sec => {
            if (sec.getBoundingClientRect().top < window.innerHeight * 0.9) revealSection(sec)
            else stxObs.observe(sec)
        })

        // Anchor navigation (nav menu, dot nav, in-page links): settle every
        // section and divider up to the target instantly so nothing animates
        // chaotically mid-flight or gets left half-transformed.
        function settleThroughHash(hash) {
            if (!hash || hash.length < 2) return
            let target = null
            try { target = document.querySelector(hash) } catch (err) { return }
            if (!target) return
            const targetSec = target.closest('section') || target
            const idx = stxSections.indexOf(targetSec)
            if (idx === -1) return
            for (let j = 0; j <= idx; j++) settleInstant(stxSections[j])
            dividers.forEach(d => {
                if (d.compareDocumentPosition(targetSec) & Node.DOCUMENT_POSITION_FOLLOWING) {
                    revealDivider(d)
                }
            })
        }

        document.addEventListener('click', e => {
            const link = e.target.closest && e.target.closest('a[href^="#"]')
            if (link) settleThroughHash(link.getAttribute('href'))
        }, true)
        window.addEventListener('hashchange', () => settleThroughHash(window.location.hash))
    }

    /*===== AURORA BACKGROUND LAYERS =====*/
    if (!reduceMotion) {
        const auroraIds = ['about', 'research', 'skills', 'projects', 'publications', 'teaching', 'blogs', 'awards', 'contact']
        auroraIds.forEach(id => {
            const sec = document.getElementById(id)
            if (!sec || sec.querySelector('.section-aurora')) return
            const layer = document.createElement('div')
            layer.className = 'section-aurora' + (id === 'contact' ? ' section-aurora--dark' : '')
            layer.setAttribute('aria-hidden', 'true')
            for (let n = 0; n < 3; n++) layer.appendChild(document.createElement('span'))
            sec.insertBefore(layer, sec.firstChild)
        })
    }

    /*===== CURSOR-FOLLOW CARD GLOW =====*/
    if (!reduceMotion && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        const glowSelector = '.research__card, .project__card, .skills__group, .timeline__card, .contact__card'
        document.querySelectorAll(glowSelector).forEach(host => {
            host.classList.add('glow-host')
            const glow = document.createElement('span')
            glow.className = 'card-glow'
            glow.setAttribute('aria-hidden', 'true')
            host.appendChild(glow)
        })
        document.addEventListener('pointermove', e => {
            const host = e.target.closest && e.target.closest('.glow-host')
            if (!host) return
            const rect = host.getBoundingClientRect()
            host.style.setProperty('--gx', `${((e.clientX - rect.left) / rect.width) * 100}%`)
            host.style.setProperty('--gy', `${((e.clientY - rect.top) / rect.height) * 100}%`)
        }, { passive: true })
    }
})()
