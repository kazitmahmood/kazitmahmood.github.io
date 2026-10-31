/* Progressive presentation enhancements; the document works without them. */
;(() => {
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const storyViewport = matchMedia('(min-width: 901px) and (min-height: 650px)')
    const hero = document.getElementById('home')
    const heroScene = hero.querySelector('.hero__scene')
    const heroIntro = hero.querySelector('.hero__intro')
    const heroStory = hero.querySelector('.hero__story')
    const heroWave = hero.querySelector('.wave-stage')
    let storyEnabled = false
    const clamp = value => Math.max(0, Math.min(1, value))
    const progress = document.createElement('div')
    progress.id = 'scroll-progress'
    progress.setAttribute('aria-hidden', 'true')
    document.body.append(progress)
    let scrollFrame = 0
    const updateProgress = () => {
        scrollFrame = 0
        const distance = document.documentElement.scrollHeight - innerHeight
        progress.style.transform = `scaleX(${distance > 0 ? Math.min(1, scrollY / distance) : 0})`
        if (storyEnabled) {
            const travel = hero.offsetHeight - heroScene.offsetHeight - 78
            const position = clamp(-hero.getBoundingClientRect().top / Math.max(1, travel))
            heroIntro.style.opacity = String(1 - clamp(position / .42))
            heroIntro.style.transform = `translateY(${-position * 65}px)`
            heroStory.style.opacity = String(clamp((position - .42) / .36))
            heroStory.style.transform = `translateY(${(1 - position) * 28}px)`
            heroWave.style.transform = `translateY(${position * 25}px) scale(${1 + position * .17})`
        }
    }
    const queueProgress = () => {
        if (!scrollFrame) scrollFrame = requestAnimationFrame(updateProgress)
    }
    addEventListener('scroll', queueProgress, { passive: true })
    addEventListener('resize', queueProgress)
    function syncStory() {
        storyEnabled = storyViewport.matches && !motionPreference.matches
        document.documentElement.classList.toggle('scroll-story', storyEnabled)
        if (!storyEnabled) {
            ;[heroIntro, heroStory, heroWave].forEach(element => {
                element.style.removeProperty('opacity')
                element.style.removeProperty('transform')
            })
        }
        queueProgress()
    }
    storyViewport.addEventListener('change', syncStory)
    motionPreference.addEventListener('change', syncStory)
    syncStory()
    if ('ResizeObserver' in window) new ResizeObserver(queueProgress).observe(document.querySelector('main'))
    updateProgress()

    if ('IntersectionObserver' in window && !motionPreference.matches) {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(({ target, isIntersecting }) => {
                if (!isIntersecting) return
                target.classList.remove('flow-pending')
                observer.unobserve(target)
            })
        }, { rootMargin: '0px 0px -24px 0px', threshold: 0 })
        document.querySelectorAll('.section__title, .research__card, .project__card, .timeline__item, .skills__group, .blog__card, .awards__col').forEach(element => {
            // Never hide content that is already on screen or is a hash destination.
            if (element.getBoundingClientRect().top < innerHeight || location.hash) return
            element.classList.add('flow-reveal', 'flow-pending')
            observer.observe(element)
        })
        motionPreference.addEventListener('change', () => {
            if (!motionPreference.matches) return
            observer.disconnect()
            document.querySelectorAll('.flow-pending').forEach(element => element.classList.remove('flow-pending'))
        })
        addEventListener('beforeprint', () => {
            document.querySelectorAll('.flow-pending').forEach(element => element.classList.remove('flow-pending'))
        })
    }

    // Keep the mobile drawer keyboard-contained while it is open.
    const menu = document.getElementById('nav-menu')
    document.addEventListener('keydown', event => {
        if (event.key !== 'Tab' || !menu.classList.contains('show-menu')) return
        const focusable = [...menu.querySelectorAll('a, button')].filter(el => el.getClientRects().length)
        const first = focusable[0], last = focusable.at(-1)
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
    })
    const mobile = matchMedia('(max-width: 768px)')
    mobile.addEventListener('change', () => {
        if (!mobile.matches) setMobileNav(false)
    })

    // No autoplay or wheel interception: highlights advance only on user input.
    const track = document.getElementById('highlights-track')
    const cards = [...track.querySelectorAll('.highlight')]
    const controls = document.querySelector('.highlights__controls')
    const dots = [...controls.querySelectorAll('[data-highlight]')]
    const arrows = [...controls.querySelectorAll('[data-highlight-step]')]
    let currentHighlight = 0, galleryFrame = 0
    function updateGallery() {
        galleryFrame = 0
        const firstLeft = cards[0].offsetLeft
        let closest = Infinity
        cards.forEach((card, index) => {
            const distance = Math.abs(card.offsetLeft - firstLeft - track.scrollLeft)
            if (distance < closest) { closest = distance; currentHighlight = index }
        })
        dots.forEach((dot, index) => {
            if (index === currentHighlight) dot.setAttribute('aria-current', 'true')
            else dot.removeAttribute('aria-current')
        })
        arrows[0].disabled = currentHighlight === 0
        arrows[1].disabled = currentHighlight === cards.length - 1
    }
    function selectHighlight(index) {
        const next = Math.max(0, Math.min(cards.length - 1, index))
        track.scrollTo({ left: cards[next].offsetLeft - cards[0].offsetLeft, behavior: motionPreference.matches ? 'instant' : 'smooth' })
    }
    dots.forEach((dot, index) => dot.addEventListener('click', () => selectHighlight(index)))
    arrows.forEach(arrow => arrow.addEventListener('click', () => selectHighlight(currentHighlight + Number(arrow.dataset.highlightStep))))
    track.addEventListener('scroll', () => {
        if (!galleryFrame) galleryFrame = requestAnimationFrame(updateGallery)
    }, { passive: true })
    track.addEventListener('keydown', event => {
        if (event.target !== track) return
        if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
            event.preventDefault()
            selectHighlight(currentHighlight + (event.key === 'ArrowRight' ? 1 : -1))
        }
        if (event.key === 'Home' || event.key === 'End') {
            event.preventDefault()
            selectHighlight(event.key === 'Home' ? 0 : cards.length - 1)
        }
    })
    addEventListener('resize', updateGallery)
    controls.hidden = false
    updateGallery()

    // Continuous concept illustrations. Geometry is updated together so springs
    // stay attached, the phase marker follows its orbit, and beam supports stay put.
    const beads = [...track.querySelectorAll('[data-elastic-bead]')]
    const springs = track.querySelector('[data-elastic-springs]')
    const elasticTrail = track.querySelector('[data-elastic-trail]')
    const phaseOrbit = track.querySelector('[data-phase-orbit]')
    const phaseLoops = [...phaseOrbit.querySelectorAll('ellipse')]
    const phaseMarkers = [...phaseOrbit.querySelectorAll('[data-phase-marker]')]
    const beamSurface = track.querySelector('[data-beam-surface]')
    const beamSide = track.querySelector('[data-beam-side]')
    const beamForce = track.querySelector('[data-beam-force]')
    const beamTrace = track.querySelector('[data-beam-trace]')

    function springPath(start, end, amplitude) {
        const lead = Math.min(18, (end - start) * .18)
        const coilStart = start + lead
        const coilEnd = end - lead
        let path = `M${start} 282L${coilStart} 282`
        for (let step = 1; step < 12; step++) {
            const x = coilStart + (coilEnd - coilStart) * step / 12
            path += `L${x.toFixed(2)} ${282 + (step % 2 ? -amplitude : amplitude)}`
        }
        return `${path}L${coilEnd} 282L${end} 282`
    }

    // Every longitudinal edge shares the same projection and bending curve.
    // Endpoints stay fixed on the supports; the front face remains a closed solid.
    function beamCurve(across, down, bend) {
        const x = 128 + across * 104
        const y = 302 + across * 42 + down
        return {
            start: `${x} ${y}`,
            control: `${x + 155} ${y - 73 + bend * 2}`,
            end: `${x + 310} ${y - 146}`,
            midpointY: y - 73 + bend
        }
    }

    const drawHighlight = [
        time => {
            const shared = Math.sin(time * .8) * 4
            const first = Math.sin(time * 1.6) * 23 + shared
            const second = -Math.sin(time * 1.6) * 19 + shared
            beads[0].setAttribute('transform', `translate(${first.toFixed(2)} 0)`)
            beads[1].setAttribute('transform', `translate(${second.toFixed(2)} 0)`)
            springs.setAttribute('d', [
                'M0 282H62',
                springPath(62, 163 + first, 15),
                springPath(331 + first, 419 + second, 15),
                springPath(587 + second, 640, 9)
            ].join(' '))
            elasticTrail.setAttribute('stroke-dashoffset', (-time * 12).toFixed(2))
        },
        time => {
            const depth = 100 + Math.sin(time * .45) * 18
            phaseOrbit.setAttribute('transform', `translate(352 275) rotate(${-28 + Math.sin(time * .3) * 12})`)
            phaseLoops.forEach(loop => loop.setAttribute('ry', depth.toFixed(2)))
            const x = (Math.cos(time * .85) * 205).toFixed(2)
            const y = (Math.sin(time * .85) * depth).toFixed(2)
            phaseMarkers.forEach(marker => {
                marker.setAttribute('cx', x)
                marker.setAttribute('cy', y)
            })
        },
        time => {
            const load = (1 - Math.cos(time * 1.5)) / 2
            const bend = load * 24
            const back = beamCurve(0, 0, bend)
            const front = beamCurve(1, 0, bend)
            const underside = beamCurve(1, 26, bend)
            const center = beamCurve(.5, 0, bend)
            beamSurface.setAttribute('d', `M${back.start}L${front.start}Q${front.control} ${front.end}L${back.end}Q${back.control} ${back.start}Z`)
            beamSide.setAttribute('d', `M${front.start}Q${front.control} ${front.end}L${underside.end}Q${underside.control} ${underside.start}Z`)
            beamTrace.setAttribute('d', `M${center.start}Q${center.control} ${center.end}`)
            beamTrace.setAttribute('stroke-dashoffset', (-time * 14).toFixed(2))
            const tip = center.midpointY
            beamForce.setAttribute('d', `M335 ${120 - load * 12}V${tip - 4}M325 ${tip - 20}L335 ${tip - 2}L345 ${tip - 20}`)
            beamForce.setAttribute('opacity', String(.65 + load * .35))
        }
    ]
    const highlightScenes = cards.map((card, index) => ({ card, draw: drawHighlight[index], visible: false, time: 0 }))
    let highlightFrame = 0, highlightPrevious = 0
    const canAnimateHighlights = () => !motionPreference.matches && !document.hidden && highlightScenes.some(scene => scene.visible)
    function animateHighlights(now) {
        highlightFrame = 0
        const delta = highlightPrevious ? Math.min((now - highlightPrevious) / 1000, .05) : 0
        highlightPrevious = now
        highlightScenes.forEach(scene => {
            if (!scene.visible) return
            scene.time += delta
            scene.draw(scene.time)
        })
        if (canAnimateHighlights()) highlightFrame = requestAnimationFrame(animateHighlights)
    }
    function syncHighlights() {
        if (highlightFrame) cancelAnimationFrame(highlightFrame)
        highlightFrame = 0
        highlightPrevious = 0
        if (canAnimateHighlights()) highlightFrame = requestAnimationFrame(animateHighlights)
    }
    highlightScenes.forEach(scene => scene.draw(0))
    if ('IntersectionObserver' in window) {
        const highlightObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                const scene = highlightScenes.find(item => item.card === entry.target)
                scene.visible = entry.isIntersecting && entry.intersectionRatio >= .25
            })
            syncHighlights()
        }, { threshold: [0, .25] })
        highlightScenes.forEach(scene => highlightObserver.observe(scene.card))
    } else {
        highlightScenes.forEach(scene => { scene.visible = true })
        syncHighlights()
    }
    motionPreference.addEventListener('change', syncHighlights)
    document.addEventListener('visibilitychange', syncHighlights)

    // Research films are part of the page. Load on approach, pause out of view,
    // and remember a visitor's deliberate pause when they return to the section.
    document.querySelectorAll('video[data-inline-motion]').forEach(video => {
        let inView = false, userPaused = false, automaticPause = false
        const sync = () => {
            if (inView) loadLazyVideo(video)
            if (inView && !userPaused && !motionPreference.matches && !document.hidden) {
                video.play().catch(() => {})
            } else if (!video.paused) {
                automaticPause = true
                video.pause()
            }
        }
        video.addEventListener('pause', () => {
            if (!automaticPause) userPaused = true
            automaticPause = false
        })
        video.addEventListener('play', () => { userPaused = false })
        motionPreference.addEventListener('change', sync)
        document.addEventListener('visibilitychange', sync)
        if ('IntersectionObserver' in window) {
            new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; sync() }, { threshold: .35 }).observe(video)
        } else { inView = true; sync() }
    })

    // An abstract elastic-wave illustration, not a numerical simulation.
    // Render only while visible, stop in background tabs, and honor motion settings.
    const canvas = document.getElementById('wave-canvas')
    const context = canvas?.getContext('2d')
    if (!context) return
    const stage = canvas.parentElement
    let width = 0, height = 0, frame = 0, phase = 0, previousTime = 0
    let visible = false, paused = motionPreference.matches
    let pointer = .5, pointerTarget = .5

    const rows = 44, columns = 112
    const pointsX = new Float32Array(rows * (columns + 1))
    const pointsY = new Float32Array(rows * (columns + 1))
    function point(column, row, time) {
        const x = column / columns
        const depth = row / (rows - 1)
        const envelope = Math.sin(x * Math.PI) ** .8
        const wave = Math.sin(x * 10.5 - time + depth * 3.2) * envelope
        const second = Math.cos(x * 17 + time * .35 + depth * 2) * envelope * .16
        const amplitude = Math.min(height * .19, width * .17)
        return {
            x: width * (-.06 + x * 1.12) + (depth - .5) * width * .12,
            y: height * (.65 + depth * .07) - (wave + second) * amplitude * (.6 + depth * .48) + (pointer - .5) * (x - .5) * 25
        }
    }

    function draw() {
        context.clearRect(0, 0, width, height)
        for (let row = 0; row < rows; row++) {
            const depth = row / (rows - 1)
            const hue = 192 + depth * 56
            context.beginPath()
            for (let column = 0; column <= columns; column++) {
                const p = point(column, row, phase)
                const index = row * (columns + 1) + column
                pointsX[index] = p.x
                pointsY[index] = p.y
                if (!column) context.moveTo(p.x, p.y)
                else context.lineTo(p.x, p.y)
            }
            context.strokeStyle = `hsla(${hue}, 90%, ${56 + depth * 22}%, ${.28 + depth * .52})`
            context.lineWidth = .8 + depth * .5
            context.stroke()
            // Sparse light points keep the field legible without turning it into noise.
            for (let column = 2; column < columns; column += 4) {
                if (row % 2) continue
                const index = row * (columns + 1) + column
                context.beginPath()
                context.arc(pointsX[index], pointsY[index], .55 + depth * .55, 0, Math.PI * 2)
                context.fillStyle = `hsla(${hue}, 90%, 88%, ${.3 + depth * .5})`
                context.fill()
            }
        }
        for (let column = 0; column <= columns; column += 2) {
            context.beginPath()
            for (let row = 0; row < rows; row++) {
                const index = row * (columns + 1) + column
                if (!row) context.moveTo(pointsX[index], pointsY[index])
                else context.lineTo(pointsX[index], pointsY[index])
            }
            context.strokeStyle = 'rgba(125, 176, 240, .13)'
            context.lineWidth = .6
            context.stroke()
        }
    }

    function animate(time) {
        frame = 0
        phase += Math.min((time - (previousTime || time)) / 1000, .05) * .65
        previousTime = time
        pointer += (pointerTarget - pointer) * .025
        draw()
        if (visible && !paused && !document.hidden) frame = requestAnimationFrame(animate)
    }
    function syncAnimation() {
        if (frame) cancelAnimationFrame(frame)
        frame = 0
        previousTime = 0
        if (visible && !paused && !document.hidden) frame = requestAnimationFrame(animate)
        else draw()
    }
    function resize() {
        width = stage.clientWidth
        height = stage.clientHeight
        const ratio = Math.min(devicePixelRatio || 1, 2)
        canvas.width = Math.round(width * ratio)
        canvas.height = Math.round(height * ratio)
        context.setTransform(ratio, 0, 0, ratio, 0, 0)
        draw()
    }
    motionPreference.addEventListener('change', () => { paused = motionPreference.matches; syncAnimation() })
    document.addEventListener('visibilitychange', syncAnimation)
    stage.addEventListener('pointermove', event => { pointerTarget = (event.clientX - stage.getBoundingClientRect().left) / width }, { passive: true })
    stage.addEventListener('pointerleave', () => { pointerTarget = .5 })
    if ('ResizeObserver' in window) new ResizeObserver(resize).observe(stage)
    else addEventListener('resize', resize)
    resize()
    if ('IntersectionObserver' in window) {
        new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; syncAnimation() }).observe(stage)
    } else { visible = true; syncAnimation() }
})()
