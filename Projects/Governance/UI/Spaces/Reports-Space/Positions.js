function newGovernanceReportsPositions() {
    let thisObject = {
        addHTML: addHTML,
        initialize: initialize,
        finalize: finalize
    }

    return thisObject

    function initialize() {

    }

    function finalize() {

    }

    function addHTML(tabIndex) {
        return UI.projects.governance.utilities.commonTables.addHTML(
            'positions',
            'Position',
            'Positions',
            tabIndex
        )
    }
}