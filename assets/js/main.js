history.scrollRestoration = 'manual'
window.scrollTo(0, 0)

/*===== NAV MENU TOGGLE =====*/
const introLoader = document.getElementById('intro-loader')

if (introLoader) {
    let introFinished = false
    const progressWrapper = introLoader.querySelector('.intro-loader__bar-wrap')
    document.documentElement.classList.add('intro-is-running')

    const finishIntro = () => {
        if (introFinished) return
        introFinished = true

        const ktmGroup = introLoader.querySelector('.intro-loader__ktm-group')
        const mark     = introLoader.querySelector('.intro-loader__mark')

        // Fade bar, rings, grid immediately
        introLoader.querySelectorAll(
            '.intro-loader__bar-wrap, .intro-loader__field, .intro-loader__grid, .intro-loader__scan'
        ).forEach(el => { el.style.cssText = 'transition:opacity 0.2s ease;opacity:0' })

        if (mark) mark.style.animation = 'none'

        // Freeze each letter in its current visible state
        introLoader.querySelectorAll('.intro-loader__mark span').forEach(s => {
            s.style.cssText = 'animation:none;opacity:1;transform:translateY(0)'
        })

        if (ktmGroup) {
            // Set overflow visible so zoomed KTM isn't clipped
            introLoader.style.overflow = 'visible'
            ktmGroup.style.transformOrigin = 'center center'

            // Force reflow so transition picks up the initial state
            void ktmGroup.offsetWidth

            ktmGroup.style.transition = 'transform 3.5s cubic-bezier(0.2,0,0.8,1), opacity 1.2s ease 2.5s'
            ktmGroup.style.transform  = 'scale(22)'
            ktmGroup.style.opacity    = '0'
        }

        // Fade the dark background out after KTM has grown large
        introLoader.style.transition = 'background-color 1.4s ease 2.2s'
        introLoader.style.backgroundColor = 'transparent'

        document.documentElement.classList.remove('intro-is-running')
        document.documentElement.classList.add('intro-complete')
        window.setTimeout(() => introLoader.remove(), 4200)
    }

    const pctEl = document.getElementById('intro-loader-pct')

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        if (pctEl) pctEl.textContent = '100%'
        progressWrapper?.classList.add('progress-hidden')
        window.setTimeout(finishIntro, 200)
    } else {
        if (pctEl) {
            const barDelay = 600
            const barDuration = 2200
            let startTs = null
            function tickPct(ts) {
                if (!startTs) startTs = ts
                const elapsed = ts - startTs
                if (elapsed < barDelay) { requestAnimationFrame(tickPct); return }
                const pct = Math.min(Math.round((elapsed - barDelay) / barDuration * 100), 100)
                pctEl.textContent = pct + '%'
                if (pct < 100) requestAnimationFrame(tickPct)
                else progressWrapper?.classList.add('progress-hidden')
            }
            requestAnimationFrame(tickPct)
        }
        window.addEventListener('load', () => {
            // Bar finishes at 2800ms from nav start (delay 600 + duration 2200).
            // Wait until at least 3200ms so 100% is visible for ~400ms before exit.
            const minWait = Math.max(600, 3200 - Math.round(performance.now()))
            window.setTimeout(finishIntro, minWait)
        }, { once: true })
        window.setTimeout(finishIntro, 4800)
    }
}

const navMenu   = document.getElementById('nav-menu'),
      navToggle = document.getElementById('nav-toggle'),
      navClose  = document.getElementById('nav-close'),
      navMoreItem = document.querySelector('.nav__item--more'),
      navMoreToggle = document.querySelector('.nav__more-toggle')

function setNavMoreOpen(isOpen) {
    if (!navMoreItem || !navMoreToggle) return
    navMoreItem.classList.toggle('nav__item--open', isOpen)
    navMoreToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false')
}

function closeNavMore() {
    const hadFocus = navMoreItem?.contains(document.activeElement)
    setNavMoreOpen(false)
    if (hadFocus) document.activeElement.blur()
}

if (navToggle) {
    navToggle.addEventListener('click', () => navMenu.classList.add('show-menu'))
}
if (navClose) {
    navClose.addEventListener('click', () => {
        navMenu.classList.remove('show-menu')
        closeNavMore()
    })
}
if (navMoreToggle) {
    navMoreToggle.addEventListener('click', event => {
        event.stopPropagation()
        setNavMoreOpen(!navMoreItem?.classList.contains('nav__item--open'))
    })
}

document.querySelectorAll('.nav__link').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('show-menu')
        closeNavMore()
    })
})

const navLogo = document.querySelector('.nav__logo')
if (navLogo) {
    navLogo.addEventListener('click', event => {
        event.preventDefault()
        window.scrollTo({ top: 0, behavior: 'smooth' })
    })
}

document.addEventListener('click', event => {
    if (navMoreItem && !navMoreItem.contains(event.target)) closeNavMore()
})

window.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeNavMore()
})

/*===== SECTION ORDER =====*/
const mainContent = document.querySelector('main')

if (mainContent) {
    const orderedSectionIds = [
        'home',
        'about',
        'education',
        'research',
        'research-experience',
        'publications',
        'conferences',
        'posters',
        'teaching',
        'experience',
        'skills',
        'projects',
        'measurement-showcase',
        'blogs',
        'awards',
        'journeys',
        'contact'
    ]

    orderedSectionIds.forEach(id => {
        const section = document.getElementById(id)
        if (section) mainContent.appendChild(section)
    })
}

/*===== ACTIVE NAV LINK ON SCROLL =====*/
const sections = document.querySelectorAll('section[id]')

function updateActiveLink() {
    const scrollY = window.pageYOffset
    let hasActiveDropdownLink = false

    sections.forEach(section => {
        const top    = section.offsetTop - 90
        const height = section.offsetHeight
        const id     = section.getAttribute('id')
        const link   = document.querySelector(`.nav__link[href="#${id}"]`)
        if (!link) return
        const isActive = scrollY >= top && scrollY < top + height
        link.classList.toggle('active-link', isActive)
        if (isActive && link.closest('.nav__dropdown')) hasActiveDropdownLink = true
    })

    if (navMoreToggle) {
        navMoreToggle.classList.toggle('active-link', hasActiveDropdownLink)
    }
}
window.addEventListener('scroll', updateActiveLink)
window.addEventListener('load', updateActiveLink)

/*===== HEADER SHADOW ON SCROLL =====*/
function toggleHeaderBg() {
    const header = document.getElementById('header')
    if (window.scrollY >= 80) header.classList.add('scroll-header')
    else                       header.classList.remove('scroll-header')
}
window.addEventListener('scroll', toggleHeaderBg)
window.addEventListener('load', toggleHeaderBg)


/*===== PROJECT CARD EXPANSION =====*/
const projectCards = document.querySelectorAll('[data-project-card]')

function closeAllProjectCards() {
    projectCards.forEach(card => {
        const toggle = card.querySelector('.project__card-toggle')
        card.classList.remove('project__card--open')
        if (toggle) toggle.setAttribute('aria-expanded', 'false')
        setProjectCardHeight(card, false)
    })
}

function setProjectCardHeight(card, isOpen) {
    const detail = card.querySelector('.project__card-detail')
    if (!detail) return
    detail.style.maxHeight = isOpen ? `${detail.scrollHeight + 32}px` : '0'
}

projectCards.forEach(card => {
    const toggle = card.querySelector('.project__card-toggle')
    const isOpen = card.classList.contains('project__card--open')
    setProjectCardHeight(card, isOpen)

    if (!toggle) return

    toggle.addEventListener('click', event => {
        event.stopPropagation()
        const willOpen = !card.classList.contains('project__card--open')

        closeAllProjectCards()

        if (willOpen) {
            card.classList.add('project__card--open')
            toggle.setAttribute('aria-expanded', 'true')
            setProjectCardHeight(card, true)
        }
    })
})

document.addEventListener('click', event => {
    if (!event.target.closest('[data-project-card]')) {
        closeAllProjectCards()
    }
})

window.addEventListener('resize', () => {
    projectCards.forEach(card => {
        setProjectCardHeight(card, card.classList.contains('project__card--open'))
    })
})

/*===== BLOG POPUP VIEWER =====*/
const blogCards = document.querySelectorAll('[data-blog-target]')
const blogPanels = document.querySelectorAll('[data-blog-panel]')
const blogsViewer = document.getElementById('blogs-viewer')
const blogCloseButtons = document.querySelectorAll('[data-blog-close]')

if (blogsViewer && blogsViewer.parentElement !== document.body) {
    document.body.appendChild(blogsViewer)
}

function openBlogPopup(targetId) {
    if (!blogsViewer) return

    blogCards.forEach(item => {
        const isMatch = item.dataset.blogTarget === targetId
        item.classList.toggle('blog__card--active', isMatch)
        item.setAttribute('aria-selected', isMatch ? 'true' : 'false')
    })

    blogPanels.forEach(panel => {
        const isMatch = panel.id === targetId
        panel.classList.remove('blog__feature--active')
        panel.hidden = !isMatch
    })

    blogsViewer.classList.add('blogs__viewer--open')
    blogsViewer.setAttribute('aria-hidden', 'false')
    document.body.classList.add('modal-open')

    const activePanel = document.getElementById(targetId)
    if (activePanel) {
        loadLazyMedia(activePanel)
        playAutoplayVideos(activePanel)
        activePanel.scrollTop = 0
        void activePanel.offsetWidth
        window.requestAnimationFrame(() => {
            activePanel.classList.add('blog__feature--active')
        })
    }
}

function closeBlogPopup() {
    if (!blogsViewer) return
    blogsViewer.classList.remove('blogs__viewer--open')
    blogsViewer.setAttribute('aria-hidden', 'true')
    document.body.classList.remove('modal-open')
    blogPanels.forEach(panel => {
        panel.classList.remove('blog__feature--active')
        pauseVideos(panel)
    })
}

blogCards.forEach(card => {
    card.addEventListener('click', () => {
        openBlogPopup(card.dataset.blogTarget)
    })
})

blogCloseButtons.forEach(button => {
    button.addEventListener('click', closeBlogPopup)
})

if (blogsViewer) {
    blogsViewer.addEventListener('click', event => {
        if (event.target === blogsViewer) closeBlogPopup()
    })
}

window.addEventListener('keydown', event => {
    if (event.key === 'Escape' && blogsViewer?.classList.contains('blogs__viewer--open')) {
        closeBlogPopup()
    }
})

/*===== LAZY MEDIA =====*/
function loadLazyVideo(video) {
    if (!video || video.dataset.videoLoaded === 'true') return

    video.querySelectorAll('source[data-src]').forEach(source => {
        source.src = source.dataset.src
        source.removeAttribute('data-src')
    })

    if (video.dataset.src && !video.getAttribute('src')) {
        video.src = video.dataset.src
        video.removeAttribute('data-src')
    }

    video.dataset.videoLoaded = 'true'
    video.load?.()
}

function loadLazyMedia(scope) {
    ;(scope || document).querySelectorAll('video[data-lazy-video]').forEach(loadLazyVideo)
}

function playAutoplayVideos(scope) {
    ;(scope || document).querySelectorAll('video[autoplay]').forEach(video => {
        loadLazyVideo(video)
        video.play?.().catch?.(() => {})
    })
}

function pauseVideos(scope) {
    ;(scope || document).querySelectorAll('video').forEach(video => video.pause?.())
}

/*===== CUSTOM VIDEO PLAYBACK RATES =====*/
document.querySelectorAll('video[data-playback-rate]').forEach(video => {
    const rate = Number(video.dataset.playbackRate)
    if (!Number.isFinite(rate) || rate <= 0) return

    const applyRate = () => {
        video.playbackRate = rate
        video.defaultPlaybackRate = rate
    }

    if (video.readyState >= 1) applyRate()
    video.addEventListener('loadedmetadata', applyRate)
    video.addEventListener('play', applyRate)
})

/*===== PUBLICATION ACCORDION =====*/
const pubAccordionItems = document.querySelectorAll('.pub__item:not(.pub__item--more)')

function closePubItem(item) {
    item.classList.remove('pub--open')
    item.setAttribute('aria-expanded', 'false')
    const abstract = item.querySelector('.pub__abstract')
    if (abstract) {
        pauseVideos(abstract)
        abstract.style.maxHeight = '0'
    }
}

function openPubItem(item) {
    item.classList.add('pub--open')
    item.setAttribute('aria-expanded', 'true')
    const abstract = item.querySelector('.pub__abstract')
    if (abstract) {
        loadLazyMedia(abstract)
        playAutoplayVideos(abstract)
        const setHeight = () => { abstract.style.maxHeight = abstract.scrollHeight + 'px' }
        setHeight()
        requestAnimationFrame(setHeight)
        abstract.querySelectorAll('img, video').forEach(media => {
            media.addEventListener('load', setHeight, { once: true })
            media.addEventListener('loadedmetadata', setHeight, { once: true })
        })
    }
}

pubAccordionItems.forEach(item => {
    function toggle() {
        const isOpen = item.classList.contains('pub--open')
        pubAccordionItems.forEach(other => { if (other !== item) closePubItem(other) })
        isOpen ? closePubItem(item) : openPubItem(item)
    }

    item.addEventListener('click', toggle)
    item.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle() }
    })
})

document.addEventListener('click', e => {
    if (!e.target.closest('.pub__item')) {
        pubAccordionItems.forEach(closePubItem)
    }
})

/*===== PUBLICATION SORTING =====*/
const pubList = document.querySelector('.pub__list')

if (pubList) {
    const regularPubItems = Array.from(pubList.querySelectorAll('.pub__item:not(.pub__item--more)'))
    const morePubItem = pubList.querySelector('.pub__item--more')

    regularPubItems
        .sort((a, b) => {
            const yearA = Number(a.querySelector('.pub__year')?.textContent.trim() || 0)
            const yearB = Number(b.querySelector('.pub__year')?.textContent.trim() || 0)
            return yearB - yearA
        })
        .forEach((item, index) => {
            const numberEl = item.querySelector('.pub__num')
            if (numberEl) numberEl.textContent = String(index + 1)
            pubList.appendChild(item)
        })

    if (morePubItem) pubList.appendChild(morePubItem)
}

/*===== PUBLICATION FILTERS =====*/
const pubFilters = document.querySelectorAll('.pub__filter')
const pubItems = document.querySelectorAll('.pub__item[data-topic]')

pubFilters.forEach(filter => {
    filter.addEventListener('click', () => {
        const topic = filter.dataset.filter
        let visibleIndex = 0

        pubFilters.forEach(btn => btn.classList.remove('pub__filter--active'))
        filter.classList.add('pub__filter--active')

        pubItems.forEach(item => {
            const shouldShow = topic === 'all' || item.dataset.topic === topic
            item.hidden = !shouldShow

            if (!shouldShow) {
                item.classList.remove('pub--open')
                item.setAttribute('aria-expanded', 'false')
                const abstract = item.querySelector('.pub__abstract')
                if (abstract) abstract.style.maxHeight = '0'
                item.classList.remove('pub--filter-flash')
                return
            }

            item.style.setProperty('--motion-delay', `${Math.min(visibleIndex * 55, 360)}ms`)
            visibleIndex += 1
            item.classList.remove('pub--filter-flash')
            void item.offsetWidth
            item.classList.add('pub--filter-flash')
            window.setTimeout(() => item.classList.remove('pub--filter-flash'), 620)
        })
    })
})

/*===== SCROLL-TO-TOP BUTTON =====*/
function toggleScrollUp() {
    const btn = document.getElementById('scroll-up')
    if (window.scrollY >= 560) btn.classList.add('show-scroll')
    else                        btn.classList.remove('show-scroll')
}
window.addEventListener('scroll', toggleScrollUp)
window.addEventListener('load', toggleScrollUp)


/*===== SECTION TITLE UNDERLINE GROW =====*/
const titleRevealObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
        e.target.classList.toggle('title-revealed', e.isIntersecting)
    })
}, { threshold: 0.6 })
document.querySelectorAll('.section__title').forEach(t => {
    t.setAttribute('data-title-anim', '')
    titleRevealObs.observe(t)
})

/*===== SCROLL REVEAL (generic blocks) =====*/
const blockRevealObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
        e.target.classList.toggle('anim-in', e.isIntersecting)
    })
}, { threshold: 0.08, rootMargin: '0px 0px -4% 0px' })
;[
    '.about__text', '.about__profile', '.about__stats',
    '.pub__hint', '.pub__list', '.pub__scholar-btn',
    '.skills__group',
    '.contact__info', '.contact__card',
    '.poster-gallery', '.conf__list', '.projects__cards',
    '.section__subtitle',
].forEach(sel => {
    document.querySelectorAll(sel).forEach(el => {
        el.classList.add('anim-ready')
        blockRevealObs.observe(el)
    })
})

/*===== LIVELY SCROLL REVEAL =====*/
const motionRevealMql = window.matchMedia('(prefers-reduced-motion: reduce)')
const motionRevealObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        const el = entry.target

        if (!entry.isIntersecting) {
            window.clearTimeout(el._motionSettleTimer)
            el.classList.remove('motion-in', 'motion-settled')
            return
        }

        el.classList.add('motion-in')
        const delay = parseFloat(getComputedStyle(el).getPropertyValue('--motion-delay')) || 0
        window.clearTimeout(el._motionSettleTimer)
        el._motionSettleTimer = window.setTimeout(() => el.classList.add('motion-settled'), delay + 720)
    })
}, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' })

function prepareMotionReveal(elements, options = {}) {
    const {
        motion = 'rise',
        step = 70,
        maxDelay = 420,
        offset = 0
    } = options

    Array.from(elements || []).forEach((el, index) => {
        if (!el || el.classList.contains('motion-ready')) return
        el.classList.add('motion-ready')
        el.dataset.motion = motion
        el.style.setProperty('--motion-delay', `${Math.min((index + offset) * step, maxDelay)}ms`)

        if (motionRevealMql.matches) {
            el.classList.add('motion-in')
            el.classList.add('motion-settled')
        } else {
            motionRevealObs.observe(el)
        }
    })
}

prepareMotionReveal(document.querySelectorAll('.research__intro, .research__pill'), { motion: 'from-left', step: 90 })
prepareMotionReveal(document.querySelectorAll('.research__card'), { motion: 'zoom', step: 120 })
prepareMotionReveal(document.querySelectorAll('.project__card'), { motion: 'rise', step: 95 })
prepareMotionReveal(document.querySelectorAll('.mws__copy, .mws__panel'), { motion: 'rise', step: 90 })
prepareMotionReveal(document.querySelectorAll('.pub__item[data-topic]'), { motion: 'from-right', step: 55, maxDelay: 300 })
prepareMotionReveal(document.querySelectorAll('.skills__group'), { motion: 'rise', step: 85 })
prepareMotionReveal(document.querySelectorAll('.journeys__intro, .journeys__map'), { motion: 'rise', step: 90 })

/*===== MEASUREMENT WORKFLOW MASS-SPRING ANIMATION =====*/
const measurementSpringSvg = document.querySelector('.mws__mass-svg')

if (measurementSpringSvg) {
    const springPaths = Array.from(measurementSpringSvg.querySelectorAll('.mws__spring-coil'))
    const massGroups = [
        measurementSpringSvg.querySelector('.mws__mass--one'),
        measurementSpringSvg.querySelector('.mws__mass--two'),
        measurementSpringSvg.querySelector('.mws__mass--three'),
        measurementSpringSvg.querySelector('.mws__mass--four')
    ].filter(Boolean)

    measurementSpringSvg.querySelectorAll('animate, animateTransform').forEach(anim => anim.remove())

    const springY = 138
    const springAmplitude = 18
    const massTravel = [-14, 12, -10, 13]

    function springPath(start, end) {
        const length = Math.max(end - start, 24)
        const lead = Math.min(6, Math.max(3, length * 0.1))
        const innerStart = start + lead
        const innerEnd = end - lead
        const segment = (innerEnd - innerStart) / 6
        const points = Array.from({ length: 7 }, (_, index) => innerStart + index * segment)
        const n = value => Number(value.toFixed(1))
        let d = `M ${n(start)} ${springY} L ${n(points[0])} ${springY} C ${n(points[0] + segment * 0.35)} ${springY - springAmplitude} ${n(points[1] - segment * 0.35)} ${springY - springAmplitude} ${n(points[1])} ${springY}`

        ;[1, -1, 1, -1, 1].forEach((sign, index) => {
            const pointIndex = index + 2
            d += ` S ${n(points[pointIndex] - segment * 0.35)} ${springY + springAmplitude * sign} ${n(points[pointIndex])} ${springY}`
        })

        return `${d} L ${n(end)} ${springY}`
    }

    function renderMassSpring(progress) {
        const dx = massTravel.map(travel => travel * progress)
        massGroups.forEach((mass, index) => {
            mass.setAttribute('transform', `translate(${dx[index].toFixed(2)} 0)`)
        })

        const spans = [
            [50, 115 + dx[0]],
            [177 + dx[0], 235 + dx[1]],
            [297 + dx[1], 355 + dx[2]],
            [417 + dx[2], 475 + dx[3]],
            [537 + dx[3], 585]
        ]

        springPaths.forEach((spring, index) => {
            const [start, end] = spans[index]
            spring.setAttribute('d', springPath(start, end))
        })
    }

    renderMassSpring(0)

    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const duration = 2800
        const startTime = performance.now()

        function animateMassSpring(now) {
            const progress = (1 - Math.cos(((now - startTime) / duration) * Math.PI * 2)) / 2
            renderMassSpring(progress)
            window.requestAnimationFrame(animateMassSpring)
        }

        window.requestAnimationFrame(animateMassSpring)
    }
}

/*===== MEASUREMENT WORKFLOW LIVE TELEMETRY =====*/
const measurementTelemetry = {
    progress: document.querySelector('.mws__run-progress'),
    percent: document.querySelector('.mws__run-percent'),
    sweep: document.querySelector('.mws__sweep-range'),
    peak: document.querySelector('.mws__peak-frequency'),
    points: document.querySelector('.mws__active-points')
}

function setMeasurementTelemetryText(el, value) {
    if (!el || el.textContent === value) return
    el.textContent = value
}

const measurementTelemetryFrames = [
    { percent: 58, sweep: '24-100 Hz', peak: '54 Hz', points: '3' },
    { percent: 66, sweep: '30-120 Hz', peak: '60 Hz', points: '3' },
    { percent: 74, sweep: '36-135 Hz', peak: '66 Hz', points: '4' },
    { percent: 82, sweep: '40-150 Hz', peak: '70 Hz', points: '4' },
    { percent: 68, sweep: '32-125 Hz', peak: '62 Hz', points: '4' }
]

function renderMeasurementTelemetry(frame) {
    if (measurementTelemetry.progress) {
        measurementTelemetry.progress.style.width = `${frame.percent}%`
    }

    setMeasurementTelemetryText(measurementTelemetry.percent, `${frame.percent}%`)
    setMeasurementTelemetryText(measurementTelemetry.sweep, frame.sweep)
    setMeasurementTelemetryText(measurementTelemetry.peak, frame.peak)
    setMeasurementTelemetryText(measurementTelemetry.points, frame.points)
}

if (Object.values(measurementTelemetry).some(Boolean)) {
    let telemetryFrameIndex = 1
    renderMeasurementTelemetry(measurementTelemetryFrames[telemetryFrameIndex])

    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        window.setInterval(() => {
            telemetryFrameIndex = (telemetryFrameIndex + 1) % measurementTelemetryFrames.length
            renderMeasurementTelemetry(measurementTelemetryFrames[telemetryFrameIndex])
        }, 1100)
    }
}

/*===== TIMELINE STAGGER =====*/
document.querySelectorAll('.timeline').forEach(tl => {
    tl.classList.add('timeline-anim')
    const items = tl.querySelectorAll('.timeline__item')
    const obs = new IntersectionObserver(([e]) => {
        tl._timelineAnimTimers?.forEach(clearTimeout)
        tl._timelineAnimTimers = []

        if (e.isIntersecting) {
            items.forEach((item, i) => {
                tl._timelineAnimTimers.push(setTimeout(() => item.classList.add('anim-in'), i * 120))
            })
        } else {
            items.forEach(item => item.classList.remove('anim-in'))
        }
    }, { threshold: 0.05 })
    obs.observe(tl)
})

/*===== TAG STAGGER =====*/
document.querySelectorAll('.tags').forEach(group => {
    group.classList.add('tags-anim')
    const tags = group.querySelectorAll('.tag')
    const obs = new IntersectionObserver(([e]) => {
        if (e.isIntersecting) {
            tags.forEach((t, i) => { t.style.transitionDelay = `${i * 0.05}s` })
            group.classList.add('tags-in')
        } else {
            group.classList.remove('tags-in')
        }
    }, { threshold: 0.15 })
    obs.observe(group)
})

/*===== CONFERENCE ITEMS STAGGER =====*/
document.querySelectorAll('.conf__list').forEach(list => {
    list.classList.add('conf-anim')
    const items = list.querySelectorAll('.conf__item')
    const obs = new IntersectionObserver(([e]) => {
        list._confAnimTimers?.forEach(clearTimeout)
        list._confAnimTimers = []

        if (e.isIntersecting) {
            items.forEach((item, i) => {
                list._confAnimTimers.push(setTimeout(() => item.classList.add('anim-in'), i * 65))
            })
        } else {
            items.forEach(item => item.classList.remove('anim-in'))
        }
    }, { threshold: 0.04 })
    obs.observe(list)
})

/*===== HERO PARALLAX =====*/
const heroPoster  = document.querySelector('.hero__poster')
const heroBgIcons = document.querySelector('.hero__science')
function heroParallax() {
    const y = window.scrollY
    if (y > window.innerHeight * 1.1) return
    if (heroPoster)  heroPoster.style.transform  = `translateY(${y * 0.18}px)`
    if (heroBgIcons) heroBgIcons.style.transform = `translateY(${y * 0.42}px)`
}
window.addEventListener('scroll', heroParallax, { passive: true })


/*===== DOT NAV =====*/
const dotNavEl   = document.getElementById('dot-nav')
const dotNavDots = document.querySelectorAll('.dot-nav__dot')
function updateDotNav() {
    const scrollY   = window.scrollY
    const aboutEl   = document.getElementById('about')
    const threshold = aboutEl ? aboutEl.offsetTop - 120 : window.innerHeight * 0.6
    dotNavEl && dotNavEl.classList.toggle('dot-nav--hidden', scrollY < threshold)
    let activeId = null
    document.querySelectorAll('section[id]').forEach(section => {
        if (scrollY >= section.offsetTop - 120) activeId = section.id
    })
    dotNavDots.forEach(dot => {
        dot.classList.toggle('dot-active', dot.getAttribute('href') === '#' + activeId)
    })
}
window.addEventListener('scroll', updateDotNav, { passive: true })
window.addEventListener('load', updateDotNav)

/*===== 3D CARD TILT =====*/
function attachTiltEffect(cards) {
    cards.forEach(card => {
        card.addEventListener('mousemove', e => {
            const r = card.getBoundingClientRect()
            const x = (e.clientY - r.top  - r.height / 2) / (r.height / 2)
            const y = (e.clientX - r.left - r.width  / 2) / (r.width  / 2)
            card.style.transition = 'transform 0.08s ease, box-shadow 0.08s ease'
            card.style.transform  = `perspective(900px) rotateX(${-x * 4}deg) rotateY(${y * 4}deg) translateY(-4px) scale(1.01)`
        })
        card.addEventListener('mouseleave', () => {
            card.style.transition = 'transform 0.55s cubic-bezier(0.23, 1, 0.32, 1), box-shadow 0.55s ease'
            card.style.transform  = ''
        })
    })
}

attachTiltEffect(document.querySelectorAll('.timeline__card'))
attachTiltEffect(document.querySelectorAll('.awards__col'))

/*===== TIMELINE FILL LINE =====*/
const timelineControls = []

document.querySelectorAll('.timeline').forEach(tl => {
    const fill = document.createElement('div')
    fill.className = 'timeline__fill'
    tl.appendChild(fill)

    const runner = document.createElement('div')
    runner.className = 'timeline__runner'
    runner.setAttribute('aria-hidden', 'true')
    runner.innerHTML = '<span class="timeline__runner-core"></span>'
    tl.appendChild(runner)

    timelineControls.push({
        tl,
        fill,
        runner,
        items: [],
        centers: [],
        targetY: 0,
        currentY: 0,
        targetFill: 0,
        currentFill: 0,
        active: false,
        initialized: false,
        needsMeasure: true
    })
})

const timelineRunnerColors = [
    { rgb: [196, 154, 10], glowAlpha: 0.34 },
    { rgb: [27, 58, 107], glowAlpha: 0.30 },
    { rgb: [47, 133, 90], glowAlpha: 0.30 },
    { rgb: [40, 85, 160], glowAlpha: 0.30 }
]

const reduceTimelineMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
let timelineFrame = null

function clampNumber(value, min, max) {
    return Math.max(min, Math.min(max, value))
}

function mixNumber(a, b, amount) {
    return a + (b - a) * amount
}

function runnerPhase(index) {
    return timelineRunnerColors[((index % timelineRunnerColors.length) + timelineRunnerColors.length) % timelineRunnerColors.length]
}

function colorString(phase) {
    return `rgb(${phase.rgb.map(Math.round).join(', ')})`
}

function glowString(phase) {
    return `rgba(${phase.rgb.map(Math.round).join(', ')}, ${phase.glowAlpha.toFixed(2)})`
}

function mixedPhase(fromPhase, toPhase, amount) {
    const t = clampNumber(amount, 0, 1)
    return {
        rgb: fromPhase.rgb.map((channel, i) => mixNumber(channel, toPhase.rgb[i], t)),
        glowAlpha: mixNumber(fromPhase.glowAlpha, toPhase.glowAlpha, t)
    }
}

function findTimelineSegment(centers, y) {
    if (!centers.length || y <= centers[0]) {
        return { from: 0, to: 0, amount: 0, current: 0 }
    }

    const lastIndex = centers.length - 1
    if (y >= centers[lastIndex]) {
        return { from: lastIndex, to: lastIndex, amount: 1, current: lastIndex }
    }

    for (let i = 0; i < lastIndex; i += 1) {
        if (y >= centers[i] && y <= centers[i + 1]) {
            const distance = Math.max(1, centers[i + 1] - centers[i])
            const amount = (y - centers[i]) / distance
            return { from: i, to: i + 1, amount, current: amount >= 1 ? i + 1 : i }
        }
    }

    return { from: 0, to: 0, amount: 0, current: 0 }
}

function timelineDotCenter(item) {
    const dot = item.querySelector('.timeline__dot')
    if (!dot) return item.offsetTop + Math.min(item.offsetHeight * 0.52, 180)
    return item.offsetTop + dot.offsetTop + dot.offsetHeight / 2
}

function prepareTimelineState(state) {
    if (!state.needsMeasure && state.centers.length) return

    state.items = Array.from(state.tl.querySelectorAll('.timeline__item'))
    state.centers = state.items.map(timelineDotCenter)

    state.items.forEach((item, index) => {
        const phase = runnerPhase(index)
        item.style.setProperty('--timeline-point-color', colorString(phase))
        item.style.setProperty('--timeline-point-glow', glowString(phase))
    })

    state.needsMeasure = false
}

function paintTimelineState(state) {
    const segment = findTimelineSegment(state.centers, state.currentY)
    const phase = mixedPhase(runnerPhase(segment.from), runnerPhase(segment.to), segment.amount)
    const color = colorString(phase)
    const glow = glowString(phase)

    state.fill.style.height = `${Math.max(0, state.currentFill)}px`
    state.runner.style.transform = `translate3d(0, ${state.currentY}px, 0) translate(-50%, -50%)`
    state.runner.classList.toggle('timeline__runner--active', state.active)
    state.tl.style.setProperty('--timeline-runner-color', color)
    state.tl.style.setProperty('--timeline-runner-glow', glow)
    state.tl.style.setProperty('--timeline-fill-end', color)

    state.items.forEach((item, index) => {
        const isLit = state.currentY + 1 >= state.centers[index]
        item.classList.toggle('timeline__item--lit', isLit)
        item.classList.toggle('timeline__item--current', state.active && isLit && index === segment.current)
    })
}

function animateTimelineFills() {
    let keepAnimating = false

    timelineControls.forEach(state => {
        const yDelta = state.targetY - state.currentY
        const fillDelta = state.targetFill - state.currentFill

        if (reduceTimelineMotion) {
            state.currentY = state.targetY
            state.currentFill = state.targetFill
        } else {
            state.currentY += yDelta * 0.18
            state.currentFill += fillDelta * 0.18
        }

        if (Math.abs(yDelta) < 0.25) state.currentY = state.targetY
        if (Math.abs(fillDelta) < 0.25) state.currentFill = state.targetFill

        paintTimelineState(state)

        if (Math.abs(state.targetY - state.currentY) > 0.25 || Math.abs(state.targetFill - state.currentFill) > 0.25) {
            keepAnimating = true
        }
    })

    timelineFrame = keepAnimating ? requestAnimationFrame(animateTimelineFills) : null
}

function requestTimelineFrame() {
    if (timelineFrame === null) {
        timelineFrame = requestAnimationFrame(animateTimelineFills)
    }
}

function updateTimelineFills() {
    timelineControls.forEach(state => {
        prepareTimelineState(state)

        const rect = state.tl.getBoundingClientRect()
        const scrollGuide = window.innerHeight * 0.62
        const progressEdge = scrollGuide - rect.top
        const firstCenter = state.centers[0] ?? 8
        const lastCenter = state.centers[state.centers.length - 1] ?? Math.max(8, rect.height - 8)
        const maxFill = Math.max(0, lastCenter)

        state.targetY = clampNumber(progressEdge, firstCenter, lastCenter)
        state.targetFill = clampNumber(progressEdge, 0, maxFill)
        state.active = rect.top < window.innerHeight * 0.82 && rect.bottom > window.innerHeight * 0.18

        if (!state.initialized || reduceTimelineMotion) {
            state.currentY = state.targetY
            state.currentFill = state.targetFill
            state.initialized = true
        }
    })

    requestTimelineFrame()
}

function refreshTimelineMeasurements() {
    timelineControls.forEach(state => {
        state.needsMeasure = true
    })
    updateTimelineFills()
}

window.addEventListener('scroll', updateTimelineFills, { passive: true })
window.addEventListener('load', refreshTimelineMeasurements)
window.addEventListener('resize', refreshTimelineMeasurements)
updateTimelineFills()

/*===== AWARDS DIRECTIONAL ENTRANCE =====*/
const awardsCols = document.querySelectorAll('.awards__col')
if (awardsCols.length) {
    awardsCols.forEach((col, i) => {
        col.classList.add('anim-ready')
        col.style.transitionDelay = `${i * 0.13}s`
    })
    const awardsObs = new IntersectionObserver(entries => {
        entries.forEach(e => {
            e.target.classList.toggle('anim-in', e.isIntersecting)
        })
    }, { threshold: 0.15 })
    awardsCols.forEach(col => awardsObs.observe(col))
}

/*===== MAGNETIC BUTTONS =====*/
document.querySelectorAll('.btn--primary, .btn--outline, .btn--outline-navy').forEach(btn => {
    btn.addEventListener('mousemove', e => {
        const r = btn.getBoundingClientRect()
        const x = (e.clientX - r.left - r.width  / 2) * 0.22
        const y = (e.clientY - r.top  - r.height / 2) * 0.22
        btn.style.transition = 'transform 0.12s ease'
        btn.style.transform  = `translate(${x}px, ${y}px) translateY(-2px)`
    })
    btn.addEventListener('mouseleave', () => {
        btn.style.transition = 'transform 0.45s cubic-bezier(0.23, 1, 0.32, 1)'
        btn.style.transform  = ''
    })
})

/*===== POSTER GALLERY SCROLL CONTROLS =====*/
;(function () {
    const gallery = document.querySelector('.poster-gallery')
    const wrap    = gallery && gallery.closest('.poster-gallery-wrap')
    const prevBtn = document.querySelector('[data-poster-scroll="prev"]')
    const nextBtn = document.querySelector('[data-poster-scroll="next"]')

    if (!gallery || !wrap || !prevBtn || !nextBtn) return

    const getScrollStep = () => {
        const item = gallery.querySelector('.poster-gallery__item')
        if (!item) return gallery.clientWidth * 0.85

        const galleryStyles = window.getComputedStyle(gallery)
        const gapValue = galleryStyles.columnGap === 'normal' ? galleryStyles.gap : galleryStyles.columnGap
        const gap = parseFloat(gapValue) || 0
        return item.getBoundingClientRect().width + gap
    }

    const updateButtons = () => {
        const maxScroll = gallery.scrollWidth - gallery.clientWidth
        const canScroll = maxScroll > 2

        wrap.classList.toggle('poster-gallery-wrap--static', !canScroll)
        prevBtn.disabled = !canScroll || gallery.scrollLeft <= 2
        nextBtn.disabled = !canScroll || gallery.scrollLeft >= maxScroll - 2
    }

    const moveGallery = direction => {
        gallery.scrollBy({
            left: direction * getScrollStep(),
            behavior: 'smooth'
        })
    }

    prevBtn.addEventListener('click', () => moveGallery(-1))
    nextBtn.addEventListener('click', () => moveGallery(1))

    gallery.addEventListener('keydown', event => {
        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
        event.preventDefault()
        moveGallery(event.key === 'ArrowLeft' ? -1 : 1)
    })

    gallery.addEventListener('scroll', () => window.requestAnimationFrame(updateButtons), { passive: true })
    window.addEventListener('resize', updateButtons)
    window.addEventListener('load', updateButtons)
    updateButtons()
})()

/*===== POSTER LIGHTBOX =====*/
let lastPosterTrigger = null

function openPosterModal(src) {
    const modal = document.getElementById('posterModal')
    const img   = document.getElementById('posterModalImg')
    if (!modal || !img) return
    lastPosterTrigger = document.activeElement
    img.src = src
    modal.setAttribute('aria-hidden', 'false')
    modal.classList.add('active')
    requestAnimationFrame(() => requestAnimationFrame(() => modal.classList.add('anim-in')))
    document.body.classList.add('modal-open')
    modal.querySelector('[data-poster-close]')?.focus()
}

function closePosterModal() {
    const modal = document.getElementById('posterModal')
    const img   = document.getElementById('posterModalImg')
    if (!modal || !modal.classList.contains('active')) return
    modal.classList.remove('anim-in')
    modal.setAttribute('aria-hidden', 'true')
    document.body.classList.remove('modal-open')
    const handleTransitionEnd = event => {
        if (event.target !== modal) return
        modal.removeEventListener('transitionend', handleTransitionEnd)
        modal.classList.remove('active')
        if (img) img.removeAttribute('src')
        lastPosterTrigger?.focus?.()
        lastPosterTrigger = null
    }
    modal.addEventListener('transitionend', handleTransitionEnd)
}

document.querySelectorAll('[data-poster-src]').forEach(button => {
    button.addEventListener('click', () => openPosterModal(button.dataset.posterSrc))
})

document.querySelector('[data-poster-close]')?.addEventListener('click', closePosterModal)

document.getElementById('posterModal')?.addEventListener('click', event => {
    if (event.target === event.currentTarget) closePosterModal()
})

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closePosterModal()
})

/*===== HERO PARTICLES =====*/
;(function () {
    const canvas = document.getElementById('hero-canvas')
    const hero   = canvas && canvas.closest('.hero')
    if (!canvas || !hero) return
    const ctx = canvas.getContext('2d')
    let W, H, particles = []
    let mx = -999, my = -999

    function resize() {
        W = canvas.width  = canvas.offsetWidth
        H = canvas.height = canvas.offsetHeight
    }
    resize()
    window.addEventListener('resize', resize)

    hero.addEventListener('mousemove', e => {
        const r = hero.getBoundingClientRect()
        mx = e.clientX - r.left
        my = e.clientY - r.top
    })
    hero.addEventListener('mouseleave', () => { mx = -999; my = -999 })

    function rand(a, b) { return a + Math.random() * (b - a) }
    for (let i = 0; i < 55; i++) {
        particles.push({
            x: rand(0, 1), y: rand(0, 1),
            vx: rand(-0.06, 0.06), vy: rand(-0.06, 0.06),
            r: rand(1, 2.5),
            baseA: rand(0.15, 0.45),
            phase: rand(0, Math.PI * 2),
            twinkleSpeed: rand(0.0008, 0.0018)
        })
    }

    function draw() {
        const now = Date.now()
        ctx.clearRect(0, 0, W, H)
        const pts = particles.map(p => {
            p.x += p.vx / W; p.y += p.vy / H
            if (p.x < 0) p.x = 1; if (p.x > 1) p.x = 0
            if (p.y < 0) p.y = 1; if (p.y > 1) p.y = 0
            const a = p.baseA * (0.5 + 0.5 * Math.sin(now * p.twinkleSpeed + p.phase))
            return { px: p.x * W, py: p.y * H, a, r: p.r }
        })

        // particle-to-particle connections
        for (let i = 0; i < pts.length; i++) {
            for (let j = i + 1; j < pts.length; j++) {
                const dx = pts[i].px - pts[j].px, dy = pts[i].py - pts[j].py
                const d = Math.sqrt(dx*dx + dy*dy)
                if (d < 110) {
                    ctx.beginPath()
                    ctx.moveTo(pts[i].px, pts[i].py)
                    ctx.lineTo(pts[j].px, pts[j].py)
                    ctx.strokeStyle = `rgba(240,192,64,${0.1 * (1 - d/110)})`
                    ctx.lineWidth = 0.6
                    ctx.stroke()
                }
            }
        }

        // cursor-to-particle connections
        pts.forEach(p => {
            const dx = p.px - mx, dy = p.py - my
            const d = Math.sqrt(dx*dx + dy*dy)
            if (d < 140) {
                ctx.beginPath()
                ctx.moveTo(p.px, p.py)
                ctx.lineTo(mx, my)
                ctx.strokeStyle = `rgba(240,192,64,${0.35 * (1 - d/140)})`
                ctx.lineWidth = 1
                ctx.stroke()
            }
        })

        // draw dots
        pts.forEach(p => {
            ctx.beginPath()
            ctx.arc(p.px, p.py, p.r, 0, Math.PI * 2)
            ctx.fillStyle = `rgba(240,192,64,${p.a})`
            ctx.fill()
        })
        requestAnimationFrame(draw)
    }
    draw()
})()

/*===== HERO MOUSE-FOLLOW GLOW =====*/
;(function () {
    const hero = document.querySelector('.hero')
    const glow = document.querySelector('.hero__mouse-glow')
    if (!hero || !glow) return
    hero.addEventListener('mousemove', e => {
        const rect = hero.getBoundingClientRect()
        glow.style.left = (e.clientX - rect.left) + 'px'
        glow.style.top  = (e.clientY - rect.top)  + 'px'
        hero.classList.add('hero--mouse-active')
    })
    hero.addEventListener('mouseleave', () => hero.classList.remove('hero--mouse-active'))
})()

/*===== TYPEWRITER =====*/
;(function () {
    const el = document.getElementById('typewriter-text')
    if (!el) return
    const roles = [
        'PhD in Mechanical Engineering',
        'Topological Metamaterials',
        'Nonlinear Dynamics',
        'Quantum Analogous Computing'
    ]
    let ri = 0, ci = 0, del = false
    function tick() {
        const word = roles[ri]
        el.textContent = del ? word.slice(0, --ci) : word.slice(0, ++ci)
        if (!del && ci === word.length) { del = true; setTimeout(tick, 1600); return }
        if ( del && ci === 0)           { del = false; ri = (ri + 1) % roles.length }
        setTimeout(tick, del ? 45 : 75)
    }
    tick()
})()

/*===== ANIMATED COUNTERS =====*/
function animateCounter(el, target) {
    let cur = 0
    const step = Math.max(1, Math.ceil(target / 50))
    clearInterval(el._countTimer)
    el._countTimer = setInterval(() => {
        cur = Math.min(cur + step, target)
        el.textContent = cur
        if (cur >= target) clearInterval(el._countTimer)
    }, 30)
}

;(function () {
    const pubEl  = document.getElementById('stat-publications')
    const confEl = document.getElementById('stat-conferences')
    if (pubEl)  pubEl.dataset.count  = document.querySelectorAll('.pub__item:not(.pub__item--more)').length
    if (confEl) confEl.dataset.count = document.querySelectorAll('.conf__item').length

    const statsBox = document.querySelector('.about__stats')
    if (!statsBox) return
    let fired = false
    const obs = new IntersectionObserver(entries => {
        if (!entries[0].isIntersecting || fired) return
        fired = true
        ;[pubEl, confEl].forEach(el => { if (el) animateCounter(el, +el.dataset.count) })
        const citEl = document.getElementById('stat-citations')
        if (citEl && citEl.dataset.count) animateCounter(citEl, +citEl.dataset.count)
        obs.disconnect()
    }, { threshold: 0.4 })
    obs.observe(statsBox)
})()

/*===== BUTTON RIPPLE =====*/
document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', function (e) {
        const r = document.createElement('span')
        r.className = 'btn__ripple'
        r.style.left = e.offsetX + 'px'
        r.style.top  = e.offsetY + 'px'
        this.appendChild(r)
        r.addEventListener('animationend', () => r.remove())
    })
})

/*===== TIMELINE DOT PULSE =====*/
document.querySelectorAll('.timeline').forEach(tl => {
    const firstDot = tl.querySelector('.timeline__dot')
    if (firstDot) firstDot.classList.add('timeline__dot--pulse')
})

/*===== CUSTOM CURSOR =====*/
;(function () {
    const dot  = document.getElementById('cursor-dot')
    const ring = document.getElementById('cursor-ring')
    if (!dot || !ring) return
    let mx = -100, my = -100, rx = -100, ry = -100
    let rafId = 0

    function render() {
        rafId = 0
        rx += (mx - rx) * 0.13
        ry += (my - ry) * 0.13
        dot.style.transform = `translate3d(${mx}px, ${my}px, 0) translate(-50%, -50%)`
        ring.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`

        if (Math.abs(mx - rx) > 0.2 || Math.abs(my - ry) > 0.2) {
            rafId = requestAnimationFrame(render)
        }
    }

    function requestRender() {
        if (!rafId) rafId = requestAnimationFrame(render)
    }

    document.addEventListener('mousemove', e => {
        mx = e.clientX
        my = e.clientY
        requestRender()
    }, { passive: true })

    document.addEventListener('mouseleave', () => {
        mx = -100
        my = -100
        requestRender()
    })

    const targets = 'a, button, [role="button"], input, textarea, select, label, .pub__item, .project__card-toggle, .research__card-toggle, .poster-gallery__item'
    document.querySelectorAll(targets).forEach(el => {
        el.addEventListener('mouseenter', () => { dot.classList.add('cursor--hover');  ring.classList.add('cursor--hover') })
        el.addEventListener('mouseleave', () => { dot.classList.remove('cursor--hover'); ring.classList.remove('cursor--hover') })
    })
})()

/*===== SECTION TITLE UNDERLINE GROW =====*/
;(function () {
    const titles = document.querySelectorAll('.section__title')
    if (!titles.length) return
    const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
            e.target.classList.toggle('title--in', e.isIntersecting)
        })
    }, { threshold: 0.6 })
    titles.forEach(t => obs.observe(t))
})()

/*===== RESEARCH CARD EXPAND/COLLAPSE =====*/
;(function () {
    const researchCards = document.querySelectorAll('[data-research-card]')
    if (!researchCards.length) return

    function setToggleState(card, isOpen) {
        const toggle = card.querySelector('.research__card-toggle')
        if (!toggle) return

        card.toggleAttribute('data-expanded', isOpen)
        toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false')
        toggle.querySelector('.research__card-toggle-text').textContent = isOpen ? 'See Less' : 'See More'
    }

    function openCard(card) {
        const body = card.querySelector('.research__card-body')
        const toggle = card.querySelector('.research__card-toggle')
        if (!body || !toggle) return

        window.clearTimeout(body._researchHideTimer)
        body.hidden = false
        loadLazyMedia(body)
        playAutoplayVideos(body)
        body.style.maxHeight = '0px'
        setToggleState(card, true)

        const setBodyHeight = () => {
            if (card.hasAttribute('data-expanded')) body.style.maxHeight = `${body.scrollHeight}px`
        }

        requestAnimationFrame(() => {
            setBodyHeight()
        })

        body.querySelectorAll('img, video').forEach(media => {
            media.addEventListener('load', setBodyHeight, { once: true })
            media.addEventListener('loadedmetadata', setBodyHeight, { once: true })
        })
    }

    function closeCard(card) {
        const body = card.querySelector('.research__card-body')
        const toggle = card.querySelector('.research__card-toggle')
        if (!toggle || !body) return
        if (!card.hasAttribute('data-expanded') && body.hidden) return

        setToggleState(card, false)
        pauseVideos(body)
        body.style.maxHeight = `${body.scrollHeight}px`
        window.clearTimeout(body._researchHideTimer)

        requestAnimationFrame(() => {
            body.style.maxHeight = '0px'
        })

        const hideBody = event => {
            if (event.target !== body || card.hasAttribute('data-expanded')) return
            body.hidden = true
            body.removeEventListener('transitionend', hideBody)
        }
        body.addEventListener('transitionend', hideBody)
        body._researchHideTimer = window.setTimeout(() => {
            if (!card.hasAttribute('data-expanded')) body.hidden = true
        }, 560)
    }

    researchCards.forEach((card, index) => {
        const toggle = card.querySelector('.research__card-toggle')
        const body = card.querySelector('.research__card-body')
        if (!toggle || !body) return

        if (!body.id) body.id = `research-card-body-${index + 1}`
        body.hidden = true
        body.style.maxHeight = '0px'
        toggle.setAttribute('aria-controls', body.id)

        toggle.addEventListener('click', event => {
            event.preventDefault()
            event.stopPropagation()

            if (card.hasAttribute('data-expanded')) {
                closeCard(card)
                return
            }

            researchCards.forEach(other => {
                if (other !== card) closeCard(other)
            })
            openCard(card)
        })
    })

    window.addEventListener('resize', () => {
        researchCards.forEach(card => {
            if (!card.hasAttribute('data-expanded')) return
            const body = card.querySelector('.research__card-body')
            if (body) body.style.maxHeight = `${body.scrollHeight}px`
        })
    })
})()

/*===== SECTION TRACKER =====*/
;(function () {
    const numEl  = document.getElementById('tracker-num')
    const nameEl = document.getElementById('tracker-name')
    const tracker = document.getElementById('section-tracker')
    if (!tracker || !numEl || !nameEl) return

    const sections = [
        { id: 'home',         label: 'Home',         num: '01' },
        { id: 'about',        label: 'About',        num: '02' },
        { id: 'education',    label: 'Education',    num: '03' },
        { id: 'research',     label: 'Research',     num: '04' },
        { id: 'research-experience', label: 'Research Experience', num: '05' },
        { id: 'publications', label: 'Publications', num: '06' },
        { id: 'conferences',  label: 'Conferences',  num: '07' },
        { id: 'posters',      label: 'Posters',      num: '08' },
        { id: 'teaching',     label: 'Teaching',     num: '09' },
        { id: 'experience',   label: 'Experience',   num: '10' },
        { id: 'skills',       label: 'Skills',       num: '11' },
        { id: 'projects',     label: 'Projects',     num: '12' },
        { id: 'measurement-showcase', label: 'Development Tools', num: '13' },
        { id: 'blogs',        label: 'Blogs',        num: '14' },
        { id: 'awards',       label: 'Awards',       num: '15' },
        { id: 'journeys',     label: 'Journeys',     num: '16' },
        { id: 'contact',      label: 'Contact',      num: '17' },
    ]

    function update(id) {
        if (id === 'home') { tracker.classList.remove('tracker--visible'); return }
        const s = sections.find(x => x.id === id)
        if (!s) return
        numEl.textContent  = s.num
        nameEl.textContent = s.label
        tracker.classList.add('tracker--visible')
    }

    const trackedSections = sections
        .map(section => ({ ...section, el: document.getElementById(section.id) }))
        .filter(section => section.el)

    let trackerRaf = 0
    function updateFromScroll() {
        trackerRaf = 0
        const offset = Math.min(window.innerHeight * 0.34, 260)
        let active = trackedSections[0]

        trackedSections.forEach(section => {
            if (window.scrollY >= section.el.offsetTop - offset) active = section
        })

        if (active) update(active.id)
    }

    function requestTrackerUpdate() {
        if (!trackerRaf) trackerRaf = window.requestAnimationFrame(updateFromScroll)
    }

    window.addEventListener('scroll', requestTrackerUpdate, { passive: true })
    window.addEventListener('resize', requestTrackerUpdate)
    window.addEventListener('load', updateFromScroll)
    updateFromScroll()
})()

/*===== SCHOLAR CITATION COUNT =====*/
;(async function () {
    try {
        const res = await fetch(
            'https://api.semanticscholar.org/graph/v1/author/2198945293?fields=citationCount,hIndex',
            { headers: { 'Accept': 'application/json' } }
        )
        if (!res.ok) return
        const author = await res.json()
        const citEl     = document.getElementById('scholar-citations')
        const hiEl      = document.getElementById('scholar-hindex')
        const statCitEl = document.getElementById('stat-citations')
        if (citEl && author.citationCount != null) citEl.textContent = author.citationCount
        if (hiEl  && author.hIndex        != null) hiEl.textContent  = author.hIndex
        if (statCitEl && author.citationCount != null) {
            statCitEl.dataset.count = author.citationCount
            animateCounter(statCitEl, author.citationCount)
        }
    } catch (_) {}
})()

/*===== JOURNEY ALBUM VIEWER =====*/
;(function () {
    const albums = Array.isArray(window.JOURNEY_ALBUMS)
        ? window.JOURNEY_ALBUMS.filter(album => Array.isArray(album.photos) && album.photos.length)
        : []
    const mapContainer = document.querySelector('.journeys__map')
    const placesContainer = document.querySelector('.journeys__places')
    const journeysViewer = document.getElementById('journeys-viewer')
    let journeyPlaces = []
    let journeyMapPins = []
    let journeyPanels = []
    let lastJourneyTrigger = null

    if (!placesContainer || !journeysViewer || !albums.length) return

    function createEl(tag, className, text) {
        const el = document.createElement(tag)
        if (className) el.className = className
        if (text != null) el.textContent = text
        return el
    }

    function photoCountLabel(count) {
        return `${count} ${count === 1 ? 'Photo' : 'Photos'}`
    }

    function photoSrc(photo) {
        return typeof photo === 'string' ? photo : photo?.src
    }

    function isVideoMedia(photo) {
        const src = photoSrc(photo) || ''
        return photo?.type === 'video' || /\.(mov|mp4|m4v|webm)$/i.test(src)
    }

    function mediaCountLabel(items) {
        if (!Array.isArray(items)) return photoCountLabel(items)
        const count = items.length
        const mediaItems = items.map(item => item.photo || item)
        const videoCount = mediaItems.filter(isVideoMedia).length
        if (videoCount === count) return `${count} ${count === 1 ? 'Video' : 'Videos'}`
        if (videoCount > 0) return `${count} Items`
        return photoCountLabel(count)
    }

    function hasPhotoPoint(photo) {
        return Number.isFinite(photo?.lat) && Number.isFinite(photo?.lng)
    }

    function isUsJourneyPoint(point) {
        return point.lat >= 24 && point.lat <= 50 && point.lng >= -125 && point.lng <= -66
    }

    function hasMapPoint(album) {
        return Number.isFinite(album?.map?.lat) && Number.isFinite(album?.map?.lng)
    }

    function hasStaticMapPoint(album) {
        return Number.isFinite(album?.map?.x) && Number.isFinite(album?.map?.y)
    }

    function mapPinMatchesTarget(pin, targetId) {
        if (pin.dataset.journeyTarget === targetId) return true
        return (pin.dataset.journeyTargets || '')
            .split(',')
            .filter(Boolean)
            .includes(targetId)
    }

    function currentJourneyMapPins() {
        return Array.from(mapContainer?.querySelectorAll('[data-journey-target]') || journeyMapPins)
    }

    function syncJourneyHover(targetId, isHovered) {
        journeyPlaces.forEach(place => {
            if (place.dataset.journeyTarget === targetId) {
                place.classList.toggle('journey__place--map-hover', isHovered)
            }
        })

        currentJourneyMapPins().forEach(pin => {
            if (mapPinMatchesTarget(pin, targetId)) {
                pin.classList.toggle('journey-map__pin--hover', isHovered)
            }
        })
    }

    function getJourneyMapPoints(album) {
        const points = []
        album.photos.forEach((photo, photoIndex) => {
            if (!hasPhotoPoint(photo)) return
            points.push({
                album,
                photo,
                photoIndex,
                lat: photo.lat,
                lng: photo.lng,
                label: photo.place || album.title
            })
        })

        if (!points.length && hasMapPoint(album)) {
            points.push({
                album,
                photoIndex: 0,
                lat: album.map.lat,
                lng: album.map.lng,
                label: album.map.label || album.title
            })
        }

        return points
    }

    function distanceKm(a, b) {
        const earthRadiusKm = 6371
        const toRad = degrees => degrees * Math.PI / 180
        const dLat = toRad(b.lat - a.lat)
        const dLng = toRad(b.lng - a.lng)
        const lat1 = toRad(a.lat)
        const lat2 = toRad(b.lat)
        const h = Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
        return 2 * earthRadiusKm * Math.asin(Math.sqrt(h))
    }

    function labelForGroup(points) {
        const labels = [...new Set(points.map(point => point.label).filter(Boolean))]
        if (labels.length === 1) return labels[0]
        if (labels.length === 2) return labels.join(' / ')
        return 'Nearby Photos'
    }

    function groupJourneyMapPoints(points) {
        const groups = []
        const sortedPoints = [...points].sort((a, b) => {
            if (a.label !== b.label) return a.label.localeCompare(b.label)
            if (a.lat !== b.lat) return a.lat - b.lat
            return a.lng - b.lng
        })
        const maxDistanceKm = 32.1869

        sortedPoints.forEach(point => {
            const group = groups.find(candidate => distanceKm(candidate, point) <= maxDistanceKm)
            if (group) {
                group.points.push(point)
                group.lat = group.points.reduce((sum, item) => sum + item.lat, 0) / group.points.length
                group.lng = group.points.reduce((sum, item) => sum + item.lng, 0) / group.points.length
                group.label = labelForGroup(group.points)
            } else {
                groups.push({
                    lat: point.lat,
                    lng: point.lng,
                    label: point.label,
                    points: [point]
                })
            }
        })

        return groups
    }

    function buildJourneyPopup(group) {
        const popup = createEl('div', 'journey-map-popup')
        popup.append(
            createEl('strong', 'journey-map-popup__title', group.label),
            createEl('span', 'journey-map-popup__meta', mediaCountLabel(group.points))
        )

        const grid = createEl('div', 'journey-map-popup__photos')
        group.points.forEach(point => {
            const button = createEl('button', 'journey-map-popup__photo')
            button.type = 'button'
            button.dataset.journeyOpen = `journey-${point.album.id}`
            button.dataset.journeySlide = String(point.photoIndex)
            button.setAttribute('aria-label', `Open ${point.label} ${isVideoMedia(point.photo) ? 'video' : 'photo'} ${point.photoIndex + 1}`)

            let media
            if (isVideoMedia(point.photo)) {
                button.classList.add('journey-map-popup__photo--video')
                media = createEl('span', 'journey-map-popup__video-thumb')
                media.setAttribute('aria-hidden', 'true')
                media.innerHTML = '<i class="uil uil-play"></i>'
            } else {
                media = document.createElement('img')
                media.src = photoSrc(point.photo)
                media.alt = `${point.label} photo ${point.photoIndex + 1}`
                media.loading = 'lazy'
                media.decoding = 'async'
            }

            const caption = createEl('span', 'journey-map-popup__caption', point.label)
            button.append(media, caption)
            grid.appendChild(button)
        })

        popup.appendChild(grid)
        return popup
    }

    function buildJourneyMap() {
        if (!mapContainer) return

        const mapPoints = albums.flatMap(getJourneyMapPoints)
        if (mapPoints.length && window.L) {
            buildLeafletJourneyMap(mapPoints)
            return
        }

        const staticAlbums = albums.filter(hasStaticMapPoint)
        if (!staticAlbums.length) {
            mapContainer.hidden = true
            return
        }

        buildStaticJourneyMap(staticAlbums)
    }

    function buildLeafletJourneyMap(mapPoints) {
        const map = createEl('div', 'journey-map journey-map--leaflet')
        map.setAttribute('role', 'group')
        map.setAttribute('aria-label', 'Interactive journey map')

        const leafletEl = createEl('div', 'journey-map__leaflet')
        map.appendChild(leafletEl)
        mapContainer.replaceChildren(map)

        const journeyMap = window.L.map(leafletEl, {
            attributionControl: true,
            scrollWheelZoom: false,
            zoomControl: true,
            zoomDelta: 0.5,
            zoomSnap: 0.25
        })

        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 18,
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(journeyMap)

        const markerLayer = window.L.markerClusterGroup
            ? window.L.markerClusterGroup({
                showCoverageOnHover: false,
                maxClusterRadius: 42,
                iconCreateFunction(cluster) {
                    return window.L.divIcon({
                        html: `<span>${cluster.getChildCount()}</span>`,
                        className: 'journey-map__cluster',
                        iconSize: [38, 38]
                    })
                }
            })
            : window.L.layerGroup()
        markerLayer.addTo(journeyMap)

        const focusPoints = mapPoints.filter(isUsJourneyPoint)
        const boundsPoints = focusPoints.length ? focusPoints : mapPoints
        const bounds = window.L.latLngBounds(boundsPoints.map(point => [point.lat, point.lng]))
        const journeyMapFinalBounds = bounds.pad(0.22)
        const journeyMapWorldZoom = window.innerWidth < 700 ? 1.25 : 2
        const prefersReducedJourneyMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        let journeyMapIntroPlayed = false
        let journeyMapIntroObserver = null

        journeyMap.setView([20, 0], journeyMapWorldZoom, { animate: false })

        function finishJourneyMapIntro(animate = true) {
            if (journeyMapIntroPlayed) return
            journeyMapIntroPlayed = true
            journeyMapIntroObserver?.disconnect()

            journeyMap.invalidateSize()
            map.classList.add('journey-map--zooming')

            if (!animate || prefersReducedJourneyMotion) {
                journeyMap.fitBounds(journeyMapFinalBounds, {
                    animate: false,
                    maxZoom: 5,
                    padding: [26, 26]
                })
                map.classList.add('journey-map--zoomed')
                map.classList.remove('journey-map--zooming')
                return
            }

            journeyMap.flyToBounds(journeyMapFinalBounds, {
                duration: 3.1,
                easeLinearity: 0.16,
                maxZoom: 5,
                padding: [26, 26]
            })

            journeyMap.once('moveend', () => {
                map.classList.add('journey-map--zoomed')
                map.classList.remove('journey-map--zooming')
            })
        }

        function startJourneyMapIntroOnScroll() {
            if (prefersReducedJourneyMotion || !('IntersectionObserver' in window)) {
                finishJourneyMapIntro(false)
                return
            }

            journeyMapIntroObserver = new IntersectionObserver(entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) finishJourneyMapIntro(true)
                })
            }, {
                threshold: 0.34,
                rootMargin: '0px 0px -12% 0px'
            })

            journeyMapIntroObserver.observe(map)
        }

        const locationGroups = groupJourneyMapPoints(mapPoints)
        locationGroups.forEach((group, groupIndex) => {
            const targetIds = [...new Set(group.points.map(point => `journey-${point.album.id}`))]
            const setMarkerAttrs = markerElement => {
                if (!markerElement) return
                markerElement.dataset.journeyTarget = targetIds[0]
                markerElement.dataset.journeyTargets = targetIds.join(',')
                markerElement.setAttribute('aria-label', `${group.label}: ${mediaCountLabel(group.points)}`)
                markerElement.setAttribute('aria-haspopup', 'dialog')
                markerElement.setAttribute('aria-controls', targetIds[0])
                markerElement.setAttribute('aria-expanded', 'false')
                markerElement.style.setProperty('--pin-delay', `${groupIndex * 120}ms`)
            }
            const marker = window.L.marker([group.lat, group.lng], {
                icon: window.L.divIcon({
                    className: `journey-leaflet-marker${group.points.length > 1 ? ' journey-leaflet-marker--group' : ''}`,
                    html: group.points.length > 1
                        ? `<span class="journey-leaflet-marker__dot"><span class="journey-leaflet-marker__count">${group.points.length}</span></span>`
                        : '<span class="journey-leaflet-marker__dot"></span>',
                    iconSize: group.points.length > 1 ? [28, 28] : [22, 22],
                    iconAnchor: group.points.length > 1 ? [14, 14] : [11, 11]
                }),
                keyboard: true,
                title: group.label
            })

            marker.bindTooltip(`${group.label} - ${mediaCountLabel(group.points)}`, {
                className: 'journey-map__tooltip',
                direction: 'top',
                offset: [0, -12]
            })
            marker.bindPopup(buildJourneyPopup(group), {
                className: 'journey-map-popup-wrap',
                maxWidth: 310,
                minWidth: Math.min(292, Math.max(190, group.points.length * 86))
            })

            marker.on('mouseover', () => targetIds.forEach(targetId => syncJourneyHover(targetId, true)))
            marker.on('mouseout', () => targetIds.forEach(targetId => syncJourneyHover(targetId, false)))
            marker.on('add', () => setMarkerAttrs(marker.getElement()))

            markerLayer.addLayer(marker)
            setMarkerAttrs(marker.getElement())
        })

        if (!mapContainer.dataset.journeyPopupBound) {
            mapContainer.addEventListener('click', event => {
                const trigger = event.target.closest('[data-journey-open]')
                if (!trigger) return
                event.preventDefault()
                openJourneyAlbum(trigger.dataset.journeyOpen, Number(trigger.dataset.journeySlide || 0))
            })
            mapContainer.dataset.journeyPopupBound = 'true'
        }

        window.requestAnimationFrame(() => {
            journeyMap.invalidateSize()
            startJourneyMapIntroOnScroll()
        })
    }

    function buildStaticJourneyMap(mapAlbums) {
        const map = createEl('div', 'journey-map journey-map--static')
        map.setAttribute('role', 'group')
        map.setAttribute('aria-label', 'Static USA journey map')

        const image = document.createElement('img')
        image.className = 'journey-map__image'
        image.src = 'https://upload.wikimedia.org/wikipedia/commons/1/1a/Blank_US_Map_%28states_only%29.svg'
        image.alt = ''
        image.loading = 'lazy'
        image.decoding = 'async'
        image.setAttribute('aria-hidden', 'true')

        const colorLayer = createEl('div', 'journey-map__color')
        colorLayer.setAttribute('aria-hidden', 'true')

        const pins = createEl('div', 'journey-map__pins')

        mapAlbums.forEach((album, albumIndex) => {
            const targetId = `journey-${album.id}`
            const button = createEl('button', 'journey-map__pin')
            button.type = 'button'
            if (album.map.x > 78) {
                button.classList.add('journey-map__pin--label-left')
            }
            button.dataset.journeyTarget = targetId
            button.style.setProperty('--x', `${album.map.x}%`)
            button.style.setProperty('--y', `${album.map.y}%`)
            button.style.setProperty('--pin-delay', `${albumIndex * 120}ms`)
            button.setAttribute('aria-label', `${album.map.label || album.title}: ${mediaCountLabel(album.photos)}`)
            button.setAttribute('aria-haspopup', 'dialog')
            button.setAttribute('aria-controls', targetId)
            button.setAttribute('aria-expanded', 'false')

            button.append(
                createEl('span', 'journey-map__pin-dot'),
                createEl('span', 'journey-map__pin-label', album.map.label || album.title)
            )
            button.addEventListener('click', () => openJourneyAlbum(targetId))
            button.addEventListener('mouseenter', () => syncJourneyHover(targetId, true))
            button.addEventListener('mouseleave', () => syncJourneyHover(targetId, false))
            button.addEventListener('focus', () => syncJourneyHover(targetId, true))
            button.addEventListener('blur', () => syncJourneyHover(targetId, false))
            pins.appendChild(button)
        })

        map.append(image, colorLayer, pins)
        mapContainer.replaceChildren(map)
    }

    function buildPlaceCard(album, index) {
        const button = document.createElement('button')
        const targetId = `journey-${album.id}`
        button.className = `journey__place${index === 0 ? ' journey__place--large' : ''}`
        button.type = 'button'
        button.dataset.journeyTarget = targetId
        button.setAttribute('aria-haspopup', 'dialog')
        button.setAttribute('aria-controls', targetId)
        button.setAttribute('aria-expanded', 'false')

        const media = createEl('span', 'journey__place-media')
        const firstImg = document.createElement('img')
        firstImg.className = 'journey__place-img journey__place-img--active'
        firstImg.src = album.cover || photoSrc(album.photos[0])
        firstImg.alt = `${album.title} album preview`
        firstImg.loading = 'lazy'
        firstImg.decoding = 'async'
        media.appendChild(firstImg)

        const content = createEl('span', 'journey__place-content')
        content.append(
            createEl('span', 'journey__place-kicker', mediaCountLabel(album.photos)),
            createEl('span', 'journey__place-title', album.title),
            createEl('span', 'journey__place-copy', 'A rotating window into this album.')
        )

        button.append(media, content)
        button.addEventListener('click', () => openJourneyAlbum(targetId))
        button.addEventListener('mouseenter', () => syncJourneyHover(targetId, true))
        button.addEventListener('mouseleave', () => syncJourneyHover(targetId, false))
        button.addEventListener('focus', () => syncJourneyHover(targetId, true))
        button.addEventListener('blur', () => syncJourneyHover(targetId, false))
        return button
    }

    function buildAlbumPanel(album) {
        const article = createEl('article', 'journey__album')
        const titleId = `journey-${album.id}-title`
        article.id = `journey-${album.id}`
        article.dataset.journeyPanel = ''
        article.role = 'dialog'
        article.setAttribute('aria-modal', 'true')
        article.setAttribute('aria-labelledby', titleId)
        article.hidden = true

        const header = createEl('header', 'journey__album-header')
        const titleWrap = document.createElement('div')
        titleWrap.append(
            createEl('span', 'journey__album-kicker', 'Journey Album'),
            createEl('h3', 'journey__album-title', album.title),
            createEl('p', 'journey__album-copy', mediaCountLabel(album.photos))
        )
        titleWrap.querySelector('.journey__album-title').id = titleId

        const closeButton = createEl('button', 'journey__close')
        closeButton.type = 'button'
        closeButton.dataset.journeyClose = ''
        closeButton.setAttribute('aria-label', `Close ${album.title} album`)
        closeButton.innerHTML = '<i class="uil uil-times"></i>'
        closeButton.addEventListener('click', closeJourneyAlbum)
        header.append(titleWrap, closeButton)

        const controls = createEl('div', `journey__slider-controls${album.photos.length < 2 ? ' journey__slider-controls--single' : ''}`)
        controls.innerHTML = `
            <button class="journey__slider-button" type="button" data-journey-prev aria-label="Previous photo">
                <i class="uil uil-angle-left-b"></i>
            </button>
            <button class="journey__slider-button" type="button" data-journey-next aria-label="Next photo">
                <i class="uil uil-angle-right-b"></i>
            </button>
        `
        controls.querySelector('[data-journey-prev]')?.addEventListener('click', () => moveJourneySlide(article, -1))
        controls.querySelector('[data-journey-next]')?.addEventListener('click', () => moveJourneySlide(article, 1))

        const photos = createEl('div', 'journey__photos')
        photos.setAttribute('aria-label', `${album.title} photos`)
        album.photos.forEach((photo, photoIndex) => {
            const figure = createEl('figure', `journey__photo${isVideoMedia(photo) ? ' journey__photo--video' : ''}`)
            if (isVideoMedia(photo)) {
                const video = document.createElement('video')
                video.dataset.src = photoSrc(photo)
                video.controls = true
                video.playsInline = true
                video.preload = 'metadata'
                video.setAttribute('aria-label', `${album.title} journey video ${photoIndex + 1}`)
                figure.appendChild(video)
            } else {
                const img = document.createElement('img')
                img.dataset.src = photoSrc(photo)
                img.alt = `${album.title} journey photo ${photoIndex + 1}`
                img.loading = 'lazy'
                img.decoding = 'async'
                figure.appendChild(img)
                figure.addEventListener('click', event => {
                    event.stopPropagation()
                    if (figure.classList.contains('journey__photo--prev')) {
                        moveJourneySlide(article, -1)
                    } else {
                        moveJourneySlide(article, 1)
                    }
                })
            }
            photos.appendChild(figure)
        })

        article.append(header, controls, photos)
        return article
    }

    function getJourneyPhotos(panel) {
        return Array.from(panel?.querySelectorAll('.journey__photo') || [])
    }

    function loadJourneyPhoto(photo) {
        const media = photo?.querySelector('img[data-src], video[data-src]')
        if (media && !media.getAttribute('src')) {
            media.src = media.dataset.src
            media.load?.()
        }
    }

    function setJourneySlide(panel, index) {
        const photos = getJourneyPhotos(panel)
        if (!photos.length) return

        const count = photos.length
        const activeIndex = ((index % count) + count) % count
        const prevIndex = (activeIndex - 1 + count) % count
        const nextIndex = (activeIndex + 1) % count
        panel.dataset.activeSlide = String(activeIndex)

        photos.forEach((photo, photoIndex) => {
            if (
                photoIndex === activeIndex ||
                photoIndex === prevIndex ||
                photoIndex === nextIndex
            ) {
                loadJourneyPhoto(photo)
            }

            photo.classList.remove(
                'journey__photo--current',
                'journey__photo--prev',
                'journey__photo--next',
                'journey__photo--far'
            )

            if (photoIndex === activeIndex) {
                photo.classList.add('journey__photo--current')
            } else if (count > 2 && photoIndex === prevIndex) {
                photo.classList.add('journey__photo--prev')
            } else if (count > 1 && photoIndex === nextIndex) {
                photo.classList.add('journey__photo--next')
            } else {
                photo.classList.add('journey__photo--far')
            }
        })
    }

    function setJourneyAlbumHeading(panel, album, index) {
        const activePhoto = album?.photos?.[index]
        const heading = panel?.querySelector('.journey__album-title')
        const copy = panel?.querySelector('.journey__album-copy')
        const place = typeof activePhoto === 'string' ? '' : activePhoto?.place
        if (heading) heading.textContent = place || album.title
        if (copy) {
            copy.textContent = place && place !== album.title
                ? `${album.title} album - ${mediaCountLabel(album.photos)}`
                : mediaCountLabel(album.photos)
        }
    }

    function moveJourneySlide(panel, direction) {
        const activeIndex = Number(panel?.dataset.activeSlide || 0)
        setJourneySlide(panel, activeIndex + direction)
        const album = albums.find(item => `journey-${item.id}` === panel?.id)
        const nextIndex = Number(panel?.dataset.activeSlide || 0)
        setJourneyAlbumHeading(panel, album, nextIndex)
    }

    function openJourneyAlbum(targetId, slideIndex = 0) {
        lastJourneyTrigger = document.activeElement

        journeyPlaces.forEach(place => {
            const isMatch = place.dataset.journeyTarget === targetId
            place.classList.toggle('journey__place--active', isMatch)
            place.setAttribute('aria-expanded', isMatch ? 'true' : 'false')
        })

        currentJourneyMapPins().forEach(pin => {
            const isMatch = mapPinMatchesTarget(pin, targetId)
            pin.classList.toggle('journey-map__pin--active', isMatch)
            pin.setAttribute('aria-expanded', isMatch ? 'true' : 'false')
        })

        journeyPanels.forEach(panel => {
            const isMatch = panel.id === targetId
            panel.classList.remove('journey__album--active')
            panel.hidden = !isMatch
        })

        journeysViewer.classList.add('journeys__viewer--open')
        journeysViewer.setAttribute('aria-hidden', 'false')
        document.body.classList.add('modal-open')

        const activePanel = document.getElementById(targetId)
        if (activePanel) {
            setJourneySlide(activePanel, slideIndex)
            const activeAlbum = albums.find(album => `journey-${album.id}` === targetId)
            setJourneyAlbumHeading(activePanel, activeAlbum, Number(activePanel.dataset.activeSlide || slideIndex))
            void activePanel.offsetWidth
            window.requestAnimationFrame(() => {
                activePanel.classList.add('journey__album--active')
                activePanel.querySelector('[data-journey-close]')?.focus()
            })
        }
    }

    function closeJourneyAlbum() {
        journeysViewer.classList.remove('journeys__viewer--open')
        journeysViewer.setAttribute('aria-hidden', 'true')
        document.body.classList.remove('modal-open')
        journeyPlaces.forEach(place => {
            place.classList.remove('journey__place--active')
            place.setAttribute('aria-expanded', 'false')
        })
        currentJourneyMapPins().forEach(pin => {
            pin.classList.remove('journey-map__pin--active')
            pin.setAttribute('aria-expanded', 'false')
        })
        journeyPanels.forEach(panel => panel.classList.remove('journey__album--active'))
        lastJourneyTrigger?.focus?.()
        lastJourneyTrigger = null
    }

    if (placesContainer.hidden) {
        placesContainer.replaceChildren()
    } else {
        placesContainer.replaceChildren(...albums.map(buildPlaceCard))
    }
    buildJourneyMap()
    journeysViewer.replaceChildren(...albums.map(buildAlbumPanel))
    journeyPlaces = Array.from(placesContainer.querySelectorAll('[data-journey-target]'))
    journeyMapPins = Array.from(mapContainer?.querySelectorAll('[data-journey-target]') || [])
    journeyPanels = Array.from(journeysViewer.querySelectorAll('[data-journey-panel]'))
    prepareMotionReveal(mapContainer?.querySelectorAll('.journey-map') || [], { motion: 'zoom', step: 80 })
    prepareMotionReveal(journeyPlaces, { motion: 'rise', step: 70 })

    if (journeysViewer.parentElement !== document.body) {
        document.body.appendChild(journeysViewer)
    }

    journeysViewer.addEventListener('click', event => {
        if (event.target === journeysViewer) closeJourneyAlbum()
    })

    window.addEventListener('keydown', event => {
        if (!journeysViewer.classList.contains('journeys__viewer--open')) return

        if (event.key === 'Escape') {
            closeJourneyAlbum()
            return
        }

        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
            const activePanel = document.querySelector('.journey__album--active')
            if (!activePanel) return
            event.preventDefault()
            moveJourneySlide(activePanel, event.key === 'ArrowRight' ? 1 : -1)
        }
    })
})()

/*===== PHOTO FAN =====*/
;(function () {
    const fan = document.getElementById('photoFan')
    if (!fan) return
    fan.addEventListener('click', e => {
        e.stopPropagation()
        fan.classList.toggle('is-open')
    })
    document.addEventListener('click', () => fan.classList.remove('is-open'))
})()
