const trigger = document.getElementById('cv-preview-trigger')
const dialog = document.getElementById('cv-preview')

if (trigger && dialog && typeof dialog.showModal === 'function') {
    const documentView = dialog.querySelector('.cv-preview__document')
    const pages = dialog.querySelector('.cv-preview__pages')
    const status = dialog.querySelector('.cv-preview__status')
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const renderedPages = []
    let loading = null
    let closeTimer = 0
    let displayWidth = 0

    function updateTextLayers() {
        const width = pages.clientWidth
        if (!width || width === displayWidth) return
        displayWidth = width
        for (const { page, element, textLayer } of renderedPages) {
            const viewport = page.getViewport({ scale: width / page.getViewport({ scale: 1 }).width })
            element.style.setProperty('--total-scale-factor', viewport.scale)
            textLayer.update({ viewport })
        }
    }

    async function renderDocument() {
        status.hidden = false
        status.classList.remove('cv-preview__status--error')
        status.querySelector('.cv-preview__message').textContent = 'Loading CV…'
        status.querySelector('a').hidden = true
        documentView.setAttribute('aria-busy', 'true')

        try {
            // Load the renderer only when someone opens the CV. No viewer UI is used.
            const pdfjs = await import('./vendor/pdfjs/pdf.min.mjs')
            pdfjs.GlobalWorkerOptions.workerSrc = new URL('./vendor/pdfjs/pdf.worker.min.mjs', import.meta.url).href
            const pdf = await pdfjs.getDocument({ url: trigger.href, isEvalSupported: false }).promise

            pages.replaceChildren()
            renderedPages.length = 0
            const rasterWidth = Math.min(1600, Math.max(1200, (displayWidth || 900) * (window.devicePixelRatio || 1)))

            for (let number = 1; number <= pdf.numPages; number++) {
                const page = await pdf.getPage(number)
                const base = page.getViewport({ scale: 1 })
                const raster = page.getViewport({ scale: rasterWidth / base.width })
                const canvas = document.createElement('canvas')
                canvas.width = Math.ceil(raster.width)
                canvas.height = Math.ceil(raster.height)
                canvas.setAttribute('aria-hidden', 'true')
                await page.render({ canvasContext: canvas.getContext('2d'), viewport: raster }).promise

                const element = document.createElement('section')
                element.className = 'cv-preview__page'
                element.setAttribute('aria-label', `CV page ${number}`)
                element.append(canvas)
                pages.append(element)

                // Keep the text selectable and available to screen readers.
                const viewport = page.getViewport({ scale: (pages.clientWidth || displayWidth || 900) / base.width })
                element.style.setProperty('--total-scale-factor', viewport.scale)
                const textContainer = document.createElement('div')
                textContainer.className = 'cv-preview__text'
                element.append(textContainer)
                const textLayer = new pdfjs.TextLayer({
                    textContentSource: await page.getTextContent(),
                    container: textContainer,
                    viewport
                })
                await textLayer.render()
                renderedPages.push({ page, element, textLayer })

                // Preserve the document's own web and email links without adding controls.
                for (const annotation of await page.getAnnotations({ intent: 'display' })) {
                    if (annotation.subtype !== 'Link' || !/^(https?:|mailto:)/i.test(annotation.url || '')) continue
                    const [x1, y1] = base.convertToViewportPoint(annotation.rect[0], annotation.rect[1])
                    const [x2, y2] = base.convertToViewportPoint(annotation.rect[2], annotation.rect[3])
                    const link = document.createElement('a')
                    link.className = 'cv-preview__link'
                    link.href = annotation.url
                    link.target = '_blank'
                    link.rel = 'noopener noreferrer'
                    link.setAttribute('aria-label', annotation.url)
                    link.style.left = `${Math.min(x1, x2) / base.width * 100}%`
                    link.style.top = `${Math.min(y1, y2) / base.height * 100}%`
                    link.style.width = `${Math.abs(x2 - x1) / base.width * 100}%`
                    link.style.height = `${Math.abs(y2 - y1) / base.height * 100}%`
                    element.append(link)
                }
                status.hidden = true
            }
        } catch (error) {
            status.hidden = false
            status.classList.add('cv-preview__status--error')
            status.querySelector('.cv-preview__message').textContent = 'The CV preview could not load.'
            status.querySelector('a').hidden = false
            loading = null
            console.error('CV preview:', error)
        } finally {
            documentView.setAttribute('aria-busy', 'false')
        }
    }

    function closePreview() {
        if (!dialog.open || dialog.classList.contains('is-closing')) return
        if (reducedMotion.matches) {
            dialog.close()
            return
        }
        dialog.classList.add('is-closing')
        // Keep the dialog open until its exit animation has finished.
        closeTimer = window.setTimeout(() => dialog.close(), 300)
    }

    trigger.addEventListener('click', event => {
        if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return
        event.preventDefault()
        if (dialog.open) return
        dialog.classList.remove('is-closing')
        dialog.showModal()
        document.documentElement.classList.add('cv-preview-open')
        updateTextLayers()
        if (!loading) loading = renderDocument()
    })

    dialog.querySelector('.cv-preview__close').addEventListener('click', closePreview)
    dialog.addEventListener('cancel', event => {
        event.preventDefault()
        closePreview()
    })
    dialog.addEventListener('click', event => {
        if (event.target !== dialog) return
        const bounds = dialog.getBoundingClientRect()
        if (event.clientX < bounds.left || event.clientX > bounds.right ||
            event.clientY < bounds.top || event.clientY > bounds.bottom) closePreview()
    })
    dialog.addEventListener('animationend', event => {
        if (event.target === dialog && event.animationName === 'cv-preview-out') dialog.close()
    })
    dialog.addEventListener('close', () => {
        window.clearTimeout(closeTimer)
        dialog.classList.remove('is-closing')
        document.documentElement.classList.remove('cv-preview-open')
        trigger.focus({ preventScroll: true })
    })

    new ResizeObserver(updateTextLayers).observe(pages)
}
