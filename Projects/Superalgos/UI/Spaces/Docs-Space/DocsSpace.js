function newSuperalgosDocSpace() {
    const MODULE_NAME = 'Doc Space'
    let thisObject = {
        sidePanelTab: undefined,
        container: undefined,
        navigateTo: navigateTo,
        physics: physics,
        draw: draw,
        getContainer: getContainer,
        initialize: initialize,
        finalize: finalize
    }

    let isInitialized = false

    thisObject.container = newContainer()
    thisObject.container.name = MODULE_NAME
    thisObject.container.initialize()
    thisObject.container.isClickeable = true
    thisObject.container.isDraggeable = false
    thisObject.container.detectMouseOver = true
    thisObject.container.status = 'hidden'

    resize()

    let browserResizedEventSubscriptionId
    let openingEventSubscriptionId
    let closingEventSubscriptionId
    let textSelection = ''
    let htmlSelection = ''
    let selectedParagraph
    let selectedParagraphData = ''
    let selectedParagraphHeight = 0

    return thisObject

    function initialize() {
        thisObject.sidePanelTab = newSidePanelTab()
        thisObject.sidePanelTab.container.connectToParent(thisObject.container, false, false)
        thisObject.sidePanelTab.initialize('right')
        openingEventSubscriptionId = thisObject.sidePanelTab.container.eventHandler.listenToEvent('opening', onOpening)
        closingEventSubscriptionId = thisObject.sidePanelTab.container.eventHandler.listenToEvent('closing', onClosing)

        browserResizedEventSubscriptionId = canvas.eventHandler.listenToEvent('Browser Resized', resize)
        setUpContextMenu()
        isInitialized = true

        function setUpContextMenu() {
            window.contextMenu = {
                editText: editText,
                editHTML: editHTML,
                code: code,
                note: note,
                warning: warning,
                important: important
            }

            function editText() {
                contextMenuForceOutClick()
                showHTMLTextArea()

                function showHTMLTextArea() {
                    if (selectedParagraph === undefined) { return }

                    let textArea = document.createElement('textarea');
                    textArea.id = "textArea";
                    textArea.spellcheck = false;
                    textArea.className = "docs-text-area"
                    textArea.style.height = selectedParagraphHeight
                    textArea.value = selectedParagraphData
                    selectedParagraph.innerHTML = ""
                    selectedParagraph.appendChild(textArea)
                    textArea.style.display = 'block'
                    textArea.focus()
                    EDITOR_ON_FOCUS = true
                }
            }

            function editHTML() {
                console.log(htmlSelection)
                contextMenuForceOutClick()
            }

            function code() {

            }

            function note() {

            }

            function warning() {

            }

            function important() {

            }
        }
    }

    function finalize() {
        canvas.eventHandler.stopListening(browserResizedEventSubscriptionId)
        thisObject.sidePanelTab.container.eventHandler.stopListening(openingEventSubscriptionId)
        thisObject.sidePanelTab.container.eventHandler.stopListening(closingEventSubscriptionId)
    }

    function onOpening() {

    }

    function onClosing() {

    }

    function navigateTo(node) {

        let nodeAppDefinition = SCHEMAS_BY_PROJECT.get(node.project).map.appSchema.get(node.type)
        let nodeDocsDefinition = SCHEMAS_BY_PROJECT.get(node.project).map.docSchema.get(node.type)

        if (nodeDocsDefinition === undefined) {
            node.payload.uiObject.setErrorMessage('This node in undefined at the DOC_SCHEMA. ')
            return
        }
        buildNodeHtmlPage()
        contextMenuActivateRightClick()

        function buildNodeHtmlPage() {
            let HTML = ''

            HTML = HTML + '<div id="context-menu-clickable-div" class="docs-node-html-page-container">' // Container Starts

            /* Title */
            HTML = HTML + '<div><h2 class="docs-h2" id="' + node.type.toLowerCase().replace(' ', '-') + '" > ' + node.type + '</h2></div>'

            /* We start with the Definition Table */
            if (nodeDocsDefinition.definition !== undefined) {
                HTML = HTML + '<table class="docs-definitionTable">'
                HTML = HTML + '<tr>'
                HTML = HTML + '<td>'
                HTML = HTML + '<div id="definitionImageDiv" class="docs-image-container"/>'
                HTML = HTML + '</td>'
                HTML = HTML + '<td>'
                HTML = HTML + '<div class="docs-normal-font"><strong>' + addToolTips(node, nodeDocsDefinition.definition) + '</strong></div>'
                HTML = HTML + '</td>'
                HTML = HTML + '</tr>'
                HTML = HTML + '</table>'
            }

            /* Content Section */
            if (nodeDocsDefinition.content !== undefined) {
                for (let i = 0; i < nodeDocsDefinition.content.length; i++) {
                    let paragraph = nodeDocsDefinition.content[i]
                    HTML = HTML + '<p>' + paragraph + '</p>'
                }
            }

            /* Adding Section */
            if (nodeDocsDefinition.adding !== undefined) {
                if (nodeDocsDefinition.adding.length > 0) {
                    HTML = HTML + '<h3 class="docs-h3">Adding a ' + node.type + '</h3>'
                    for (let i = 0; i < nodeDocsDefinition.adding.length; i++) {
                        let paragraph = nodeDocsDefinition.adding[i]
                        HTML = HTML + '<p>' + paragraph + '</p>'
                    }
                }
            }

            /* Configuring Section */
            if (nodeDocsDefinition.configuring !== undefined) {
                if (nodeDocsDefinition.configuring.length > 0) {
                    HTML = HTML + '<h3 class="docs-h3">Configuring a ' + node.type + '</h3>'
                    for (let i = 0; i < nodeDocsDefinition.configuring.length; i++) {
                        let paragraph = nodeDocsDefinition.configuring[i]
                        HTML = HTML + '<p>' + paragraph + '</p>'
                    }
                }
            }

            /* Starting Section */
            if (nodeDocsDefinition.starting !== undefined) {
                if (nodeDocsDefinition.starting.length > 0) {
                    HTML = HTML + '<h3 class="docs-h3">Starting a ' + node.type + '</h3>'
                    for (let i = 0; i < nodeDocsDefinition.starting.length; i++) {
                        let paragraph = nodeDocsDefinition.starting[i]
                        HTML = HTML + '<p>' + paragraph + '</p>'
                    }
                }
            }

            HTML = HTML + '</div>' // Container Ends

            let docsAppDiv = document.getElementById('docsDiv')
            docsAppDiv.innerHTML = HTML

            if (nodeDocsDefinition.definition !== undefined) {
                addDefinitionImage(nodeAppDefinition, node.project)
            }
        }

        thisObject.sidePanelTab.open()
    }

    function contextMenuActivateRightClick() {
        const contextMenuClickablDiv = document.getElementById('context-menu-clickable-div')
        const menu = document.getElementById('menu')
        const outClick = document.getElementById('docsDiv')

        contextMenuClickablDiv.addEventListener('contextmenu', e => {
            e.preventDefault()
            contextMenuGetSelection()

            menu.style.top = `${e.clientY}px`
            menu.style.left = `${e.clientX}px`
            menu.classList.add('show')

            outClick.style.display = "block"
        })

        outClick.addEventListener('click', () => {
            menu.classList.remove('show')
            outClick.style.display = "none"
        })
    }

    function contextMenuForceOutClick() {
        const outClick = document.getElementById('docsDiv')
        const menu = document.getElementById('menu')
        menu.classList.remove('show')
        outClick.style.display = "none"
    }

    function contextMenuGetSelection() {
        let range
        if (document.selection && document.selection.createRange) {
            range = document.selection.createRange()
            htmlSelection = range.htmlText
        }
        else if (window.getSelection) {
            var selection = window.getSelection()
            selectedParagraphData = selection.baseNode.data
            selectedParagraph = selection.baseNode.parentNode
            selectedParagraphHeight = selection.baseNode.parentNode.getClientRects()[0].height
            if (selection.rangeCount > 0) {
                range = selection.getRangeAt(0)
                var clonedSelection = range.cloneContents()
                var div = document.createElement('div')
                div.appendChild(clonedSelection)
                htmlSelection = div.innerHTML
                textSelection = div.innerText
            }
            else {
                htmlSelection = ''
            }
        }
        else {
            htmlSelection = ''
        }
    }

    function addDefinitionImage(nodeAppDefinition, project) {
        if (nodeAppDefinition.icon === undefined) {
            imageName = nodeAppDefinition.type.toLowerCase().replace(' ', '-')
        }
        let htmlImage = document.createElement("IMG")
        let webParam = 'Icons/' + project + '/' + imageName + '.png'

        htmlImage.src = webParam
        htmlImage.width = "150"
        htmlImage.height = "150"

        let definitionImageDiv = document.getElementById('definitionImageDiv')
        definitionImageDiv.appendChild(htmlImage)
    }

    function addToolTips(node, text) {

        const TOOL_TIP_HTML = '<div class="docs-tooltip">NODE_TYPE<span class="docs-tooltiptext">NODE_DEFINITION</span></div>'
        let resultingText = ''
        text = tagNodeTypes(text, node.type)
        let splittedText = text.split('->')

        for (let i = 0; i < splittedText.length; i = i + 2) {
            let firstPart = splittedText[i]
            let nodeType = splittedText[i + 1]
            if (nodeType === undefined) {
                return resultingText + firstPart
            }
            /*
            We will search across all DOC and CONCEPT SCHEMAS
            */
            let found = false
            let definitionNode

            for (let j = 0; j < PROJECTS_ARRAY.length; j++) {
                let project = PROJECTS_ARRAY[j]
                definitionNode = SCHEMAS_BY_PROJECT.get(project).map.docSchema.get(nodeType)
                if (definitionNode !== undefined) {
                    found = true
                    break
                }
                definitionNode = SCHEMAS_BY_PROJECT.get(project).map.conceptSchema.get(nodeType)
                if (definitionNode !== undefined) {
                    found = true
                    break
                }
            }
            if (found === false) {
                node.payload.uiObject.setErrorMessage(nodeType + ' not found at Doc Schema or Concept Schema of any Project.')
                return
            }

            let definition = definitionNode.definition
            if (definition === undefined || definition === "") {
                resultingText = resultingText + firstPart + nodeType
            } else {
                let tooltip = TOOL_TIP_HTML.replace('NODE_TYPE', nodeType).replace('NODE_DEFINITION', definition)
                resultingText = resultingText + firstPart + tooltip
            }
        }
        return resultingText
    }

    function tagNodeTypes(text, excludeNodeType) {
        let words = text.split(' ')
        let taggedText = ''
        for (let i = 0; i < words.length; i++) {
            let phrase1 = words[i]
            let phrase2 = words[i] + ' ' + words[i + 1]
            let phrase3 = words[i] + ' ' + words[i + 1] + ' ' + words[i + 2]
            let phrase4 = words[i] + ' ' + words[i + 1] + ' ' + words[i + 2] + ' ' + words[i + 3]

            let cleanPhrase1 = cleanPhrase(phrase1)
            let cleanPhrase2 = cleanPhrase(phrase2)
            let cleanPhrase3 = cleanPhrase(phrase3)
            let cleanPhrase4 = cleanPhrase(phrase4)

            let found = false

            for (let j = 0; j < PROJECTS_ARRAY.length; j++) {
                let project = PROJECTS_ARRAY[j]

                /* Search in docSchema */
                if (SCHEMAS_BY_PROJECT.get(project).map.docSchema.get(cleanPhrase4) !== undefined && cleanPhrase4 !== excludeNodeType) {
                    taggedText = taggedText + phrase4.replace(cleanPhrase4, '->' + cleanPhrase4 + '->') + ' '
                    i = i + 3
                    found = true
                    break
                }
                if (SCHEMAS_BY_PROJECT.get(project).map.docSchema.get(cleanPhrase3) !== undefined && cleanPhrase3 !== excludeNodeType) {
                    taggedText = taggedText + phrase3.replace(cleanPhrase3, '->' + cleanPhrase3 + '->') + ' '
                    i = i + 2
                    found = true
                    break
                }
                if (SCHEMAS_BY_PROJECT.get(project).map.docSchema.get(cleanPhrase2) !== undefined && cleanPhrase2 !== excludeNodeType) {
                    taggedText = taggedText + phrase2.replace(cleanPhrase2, '->' + cleanPhrase2 + '->') + ' '
                    i = i + 1
                    found = true
                    break
                }
                if (SCHEMAS_BY_PROJECT.get(project).map.docSchema.get(cleanPhrase1) !== undefined && cleanPhrase1 !== excludeNodeType) {
                    taggedText = taggedText + phrase1.replace(cleanPhrase1, '->' + cleanPhrase1 + '->') + ' '
                    found = true
                    break
                }

                /* Search in conceptSchema */
                if (SCHEMAS_BY_PROJECT.get(project).map.conceptSchema.get(cleanPhrase4) !== undefined && cleanPhrase4 !== excludeNodeType) {
                    taggedText = taggedText + phrase4.replace(cleanPhrase4, '->' + cleanPhrase4 + '->') + ' '
                    i = i + 3
                    found = true
                    break
                }
                if (SCHEMAS_BY_PROJECT.get(project).map.conceptSchema.get(cleanPhrase3) !== undefined && cleanPhrase3 !== excludeNodeType) {
                    taggedText = taggedText + phrase3.replace(cleanPhrase3, '->' + cleanPhrase3 + '->') + ' '
                    i = i + 2
                    found = true
                    break
                }
                if (SCHEMAS_BY_PROJECT.get(project).map.conceptSchema.get(cleanPhrase2) !== undefined && cleanPhrase2 !== excludeNodeType) {
                    taggedText = taggedText + phrase2.replace(cleanPhrase2, '->' + cleanPhrase2 + '->') + ' '
                    i = i + 1
                    found = true
                    break
                }
                if (SCHEMAS_BY_PROJECT.get(project).map.conceptSchema.get(cleanPhrase1) !== undefined && cleanPhrase1 !== excludeNodeType) {
                    taggedText = taggedText + phrase1.replace(cleanPhrase1, '->' + cleanPhrase1 + '->') + ' '
                    found = true
                    break
                }
            }

            if (found === false) {
                taggedText = taggedText + phrase1 + ' '
            }

            function cleanPhrase(phrase) {
                return phrase.replace(',', '').replace(';', '').replace('(', '').replace(')', '').replace('-', '').replace('_', '')
            }
        }
        return taggedText
    }

    function resize() {
        thisObject.container.frame.width = 800
        thisObject.container.frame.height = browserCanvas.height // - TOP_SPACE_HEIGHT
        thisObject.container.frame.position.x = browserCanvas.width
        thisObject.container.frame.position.y = 0 // TOP_SPACE_HEIGHT

        if (thisObject.sidePanelTab !== undefined) {
            thisObject.sidePanelTab.resize()
        }
    }

    function getContainer(point, purpose) {
        let container

        container = thisObject.sidePanelTab.getContainer(point, purpose)
        if (container !== undefined) { return container }

        if (thisObject.container.frame.isThisPointHere(point, true) === true) {
            return thisObject.container
        } else {
            return undefined
        }
    }

    function physics() {
        thisObject.sidePanelTab.physics()
        docsAppDivPhysics()

        function docsAppDivPhysics() {
            let docsAppDiv = document.getElementById('docsDiv')
            docsAppDivPosition = {
                x: 0,
                y: 0
            }
            docsAppDivPosition = thisObject.container.frame.frameThisPoint(docsAppDivPosition)
            docsAppDiv.style = '   ' +
                'overflow-y: scroll;' +
                'overflow-x: hidden;' +
                'position:fixed; top:' + docsAppDivPosition.y + 'px; ' +
                'left:' + docsAppDivPosition.x + 'px; z-index:1; ' +
                'width: ' + thisObject.container.frame.width + 'px;' +
                'height: ' + thisObject.container.frame.height + 'px'
        }
    }

    function draw() {
        if (CAN_SPACES_DRAW === false) { return }
        if (isInitialized === false) { return }
        borders()
        thisObject.sidePanelTab.draw()
    }

    function borders() {
        let point1
        let point2
        let point3
        let point4

        point1 = {
            x: 0,
            y: 0
        }

        point2 = {
            x: thisObject.container.frame.width,
            y: 0
        }

        point3 = {
            x: thisObject.container.frame.width,
            y: thisObject.container.frame.height
        }

        point4 = {
            x: 0,
            y: thisObject.container.frame.height
        }

        point1 = thisObject.container.frame.frameThisPoint(point1)
        point2 = thisObject.container.frame.frameThisPoint(point2)
        point3 = thisObject.container.frame.frameThisPoint(point3)
        point4 = thisObject.container.frame.frameThisPoint(point4)

        browserCanvasContext.setLineDash([0, 0])
        browserCanvasContext.beginPath()
        browserCanvasContext.moveTo(point1.x, point1.y)
        browserCanvasContext.lineTo(point2.x, point2.y)
        browserCanvasContext.lineTo(point3.x, point3.y)
        browserCanvasContext.lineTo(point4.x, point4.y)
        browserCanvasContext.lineTo(point1.x, point1.y)
        browserCanvasContext.closePath()

        let opacity = 1

        browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.LIGHT_GREY + ', ' + opacity + ''
        browserCanvasContext.fill()

        browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.GREY + ', ' + opacity + ''
        browserCanvasContext.lineWidth = 0.3
        browserCanvasContext.stroke()

        /* Shadow */

        if (thisObject.container.status !== 'hidden') {
            for (let i = 0; i <= 30; i++) {
                opacity = 1 - (i / 300) - 0.95

                browserCanvasContext.setLineDash([0, 0])
                browserCanvasContext.beginPath()
                browserCanvasContext.moveTo(point2.x + i, point2.y)
                browserCanvasContext.lineTo(point3.x + i, point3.y)
                browserCanvasContext.closePath()

                browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.BLACK + ', ' + opacity + ''
                browserCanvasContext.lineWidth = 1
                browserCanvasContext.stroke()
            }
        }
    }
}
