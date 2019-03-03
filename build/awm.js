(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const MenuManager_1 = require("./elements/MenuManager");
const Menu_1 = require("./elements/Menu");
const ItemGroup_1 = require("./elements/ItemGroup");
const Item_1 = require("./elements/Item");
const DataManager_1 = require("./data/DataManager");
const AdaptationManager_1 = require("./adaptations/AdaptationManager");
const DebugDisplay_1 = require("./DebugDisplay");
class AdaptiveWebMenus {
    constructor(menuManager, debug = true) {
        this.menuManager = menuManager;
        this.dataManager = new DataManager_1.DataManager(this.menuManager);
        this.adaptationManager = new AdaptationManager_1.AdaptationManager(this.menuManager, this.dataManager);
        this.adaptationManager.applyCurrentAdaptation();
        this.debugDisplay = new DebugDisplay_1.DebugDisplay(this, debug);
    }
    clearHistory() {
        this.dataManager.database.empty();
        this.adaptationManager.resetCurrentAdaptation();
        this.adaptationManager.applyCurrentAdaptation();
    }
    addMenu(menu) {
        this.adaptationManager.resetCurrentAdaptation();
        this.menuManager.addMenu(menu);
        this.dataManager.logger.startListeningForMenuItemClicks(menu);
        this.adaptationManager.applyCurrentAdaptation();
    }
    removeMenu(id) {
        this.adaptationManager.resetCurrentAdaptation();
        let removedMenu = this.menuManager.removeMenu(id);
        if (removedMenu !== null) {
            this.dataManager.logger.stopListeningForMenuItemClicks(removedMenu[0]);
        }
        this.adaptationManager.applyCurrentAdaptation();
    }
    static fromSelectors(selector1, selector2, selector3) {
        if (selector2 === undefined) {
            let menuManager = MenuManager_1.MenuManager.fromSpecificSelectors(selector1);
            return new AdaptiveWebMenus(menuManager);
        }
        else if (selector3 === undefined) {
            let menuManager = MenuManager_1.MenuManager.fromGenericMenuAndItemSelectors(selector1, selector2);
            return new AdaptiveWebMenus(menuManager);
        }
        else {
            let menuManager = MenuManager_1.MenuManager.fromGenericMenuGroupAndItemSelectors(selector1, selector2, selector3);
            return new AdaptiveWebMenus(menuManager);
        }
    }
    static fromAWMClasses() {
        let menuSelector = "." + Menu_1.Menu.AWM_CLASS;
        let groupSelector = "." + ItemGroup_1.ItemGroup.AWM_CLASS;
        let itemSelector = "." + Item_1.Item.AWM_CLASS;
        let menuManager = MenuManager_1.MenuManager.fromGenericMenuGroupAndItemSelectors(menuSelector, groupSelector, itemSelector);
        return new AdaptiveWebMenus(menuManager);
    }
}
exports.AdaptiveWebMenus = AdaptiveWebMenus;

},{"./DebugDisplay":2,"./adaptations/AdaptationManager":4,"./data/DataManager":29,"./elements/Item":34,"./elements/ItemGroup":35,"./elements/Menu":36,"./elements/MenuManager":37}],2:[function(require,module,exports){
(function (global){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const $ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);
const AdaptationManager_1 = require("./adaptations/AdaptationManager");
class DebugDisplay {
    constructor(awm, activate = true) {
        this.awm = awm;
        this.controlsContainerNode = null;
        if (activate) {
            this.activate();
        }
    }
    updateTechnique() {
        let techniqueName = $("#awm-debug-switch-technique-menu").val();
        this.awm.adaptationManager.switchToTechnique(techniqueName);
    }
    updatePolicy() {
        let policyName = $("#awm-debug-switch-policy-menu").val();
        this.awm.adaptationManager.switchToPolicy(policyName);
    }
    addControlContainerNode() {
        let controlsContainer = $("<div>")
            .attr("id", "awm-debug-controls-container");
        $("body").prepend(controlsContainer);
        this.controlsContainerNode = controlsContainer;
    }
    addTechniqueListNode() {
        this.controlsContainerNode
            .append($("<label>")
            .attr("for", "awm-debug-switch-technique-menu")
            .html("Technique:"));
        this.controlsContainerNode
            .append($("<select>")
            .attr("id", "awm-debug-switch-technique-menu")
            .on("change", (_) => {
            this.updateTechnique();
        }));
        for (let name of AdaptationManager_1.AVAILABLE_TECHNIQUE_NAMES) {
            let option = $("<option>")
                .attr("val", name)
                .html(name);
            if (name === this.awm.adaptationManager.getCurrentTechniqueName()) {
                option.prop("selected", true);
            }
            $("#awm-debug-switch-technique-menu").append(option);
        }
    }
    addPolicyListNode() {
        this.controlsContainerNode
            .append($("<label>")
            .attr("for", "awm-debug-switch-policy-menu")
            .html("Policy:"));
        this.controlsContainerNode
            .append($("<select>")
            .attr("id", "awm-debug-switch-policy-menu")
            .on("change", (_) => {
            this.updatePolicy();
        }));
        for (let name of AdaptationManager_1.AVAILABLE_POLICY_NAMES) {
            let option = $("<option>")
                .attr("val", name)
                .html(name);
            if (name === this.awm.adaptationManager.getCurrentPolicyName()) {
                option.prop("selected", true);
            }
            $("#awm-debug-switch-policy-menu").append(option);
        }
    }
    addClearHistoryButtonNode() {
        this.controlsContainerNode
            .append($("<button>")
            .html("Clear history (require page reloading)")
            .attr("id", "awm-debug-clear-history-button")
            .on("click", () => {
            this.awm.clearHistory();
        }));
    }
    addAllControls() {
        this.addControlContainerNode();
        this.addTechniqueListNode();
        this.addPolicyListNode();
        this.addClearHistoryButtonNode();
    }
    removeAllControls() {
        this.controlsContainerNode.remove();
        this.controlsContainerNode = null;
    }
    activate() {
        this.activated = true;
        this.addAllControls();
    }
    desactivate() {
        this.activated = false;
        this.removeAllControls();
    }
}
exports.DebugDisplay = DebugDisplay;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./adaptations/AdaptationManager":4}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Utilities {
    static getCurrentPageID() {
        return window.location.hostname
            .concat(window.location.pathname);
    }
    static getLinkedPageID(link) {
        let linkElement = document.createElement("a");
        linkElement.href = link;
        return linkElement.hostname
            .concat(linkElement.pathname);
    }
    static isLinkMatchingPageID(link, pageID) {
        return Utilities.getLinkedPageID(link) === pageID;
    }
    static isLocalStorageAvailable() {
        if (!window.localStorage) {
            console.error("Error: local storage is not available!");
            return false;
        }
        return true;
    }
}
exports.Utilities = Utilities;

},{}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Highlight_1 = require("./techniques/Highlight");
const Identity_1 = require("./techniques/Identity");
const ReorderItems_1 = require("./techniques/ReorderItems");
const HighlightAndReorderItems_1 = require("./techniques/composites/HighlightAndReorderItems");
const Fold_1 = require("./techniques/Fold");
const ReorderItemsAndFold_1 = require("./techniques/composites/ReorderItemsAndFold");
const HighlightReorderItemsAndFold_1 = require("./techniques/composites/HighlightReorderItemsAndFold");
const ReorderGroups_1 = require("./techniques/ReorderGroups");
const HighlightAndReorderAll_1 = require("./techniques/composites/HighlightAndReorderAll");
const ProgressiveHighlightAndReorderItems_1 = require("./techniques/composites/ProgressiveHighlightAndReorderItems");
const AccessRankPolicy_1 = require("./policies/AccessRankPolicy");
const LongestVisitDurationPolicy_1 = require("./policies/LongestVisitDurationPolicy");
const MostClickedItemsPolicy_1 = require("./policies/MostClickedItemsPolicy");
const MostRecentVisitsPolicy_1 = require("./policies/MostRecentVisitsPolicy");
const MostVisitedPagesPolicy_1 = require("./policies/MostVisitedPagesPolicy");
const SerialPositionCurvePolicy_1 = require("./policies/SerialPositionCurvePolicy");
exports.AVAILABLE_TECHNIQUES = [
    new Identity_1.Identity(),
    new Highlight_1.Highlight(),
    new ReorderItems_1.ReorderItems(),
    new HighlightAndReorderItems_1.HighlightAndReorderItems(),
    new Fold_1.Fold(),
    new ReorderItemsAndFold_1.ReorderItemsAndFold(),
    new HighlightReorderItemsAndFold_1.HighlightReorderItemsAndFold(),
    new ReorderGroups_1.ReorderGroups(),
    new HighlightAndReorderAll_1.HighlightAndReorderAll(),
    new ProgressiveHighlightAndReorderItems_1.ProgressiveHighlightAndReorderItems()
];
exports.AVAILABLE_TECHNIQUE_NAMES = exports.AVAILABLE_TECHNIQUES.map((technique) => {
    return technique.name;
});
exports.AVAILABLE_POLICIES = [
    new MostClickedItemsPolicy_1.MostClickedItemListPolicy(),
    new MostVisitedPagesPolicy_1.MostVisitedPagesPolicy(),
    new MostRecentVisitsPolicy_1.MostRecentVisitsPolicy(),
    new LongestVisitDurationPolicy_1.LongestVisitDurationPolicy(),
    new SerialPositionCurvePolicy_1.SerialPositionCurvePolicy(),
    new AccessRankPolicy_1.AccessRankPolicy()
];
exports.AVAILABLE_POLICY_NAMES = exports.AVAILABLE_POLICIES.map((policy) => {
    return policy.name;
});
class AdaptationManager {
    constructor(menuManager, dataManager) {
        this.menuManager = menuManager;
        this.dataManager = dataManager;
        this.currentTechnique = null;
        this.currentPolicy = null;
        this.restoreAdaptationFromDatabaseOrSetDefault();
    }
    getCurrentTechniqueName() {
        return this.currentTechnique.name;
    }
    setTechnique(name) {
        let technique = exports.AVAILABLE_TECHNIQUES.find((candidateTechnique) => {
            return candidateTechnique.name === name;
        });
        if (technique === undefined) {
            console.error(`Technique with name ${name} does not exist.`);
            return;
        }
        this.currentTechnique = technique;
        console.log(`Technique has been set to ${name}.`);
        this.dataManager.database.persistentStorage.techniqueName = name;
    }
    setDefaultTechnique() {
        this.setTechnique("Highlight + reorder items");
    }
    restoreTechniqueFromDatabaseOrSetDefault() {
        let techniqueName = this.dataManager.database.persistentStorage.techniqueName;
        if (techniqueName === undefined) {
            this.setDefaultTechnique();
            return;
        }
        this.setTechnique(techniqueName);
    }
    switchToTechnique(name) {
        this.resetCurrentAdaptation();
        this.setTechnique(name);
        this.applyCurrentAdaptation();
    }
    getCurrentPolicyName() {
        return this.currentPolicy.name;
    }
    setPolicy(name) {
        let policy = exports.AVAILABLE_POLICIES.find((candidatePolicy) => {
            return candidatePolicy.name === name;
        });
        if (policy === undefined) {
            console.error(`Policy with name ${name} does not exist.`);
            return;
        }
        this.currentPolicy = policy;
        console.log(`Policy has been set to ${name}.`);
        this.dataManager.database.persistentStorage.policyName = name;
    }
    setDefaultPolicy() {
        this.setPolicy("AccessRank");
    }
    restorePolicyFromDatabaseOrSetDefault() {
        let policyName = this.dataManager.database.persistentStorage.policyName;
        if (policyName === undefined) {
            this.setDefaultPolicy();
            return;
        }
        this.setPolicy(policyName);
    }
    switchToPolicy(name) {
        this.resetCurrentAdaptation();
        this.setPolicy(name);
        this.applyCurrentAdaptation();
    }
    restoreAdaptationFromDatabaseOrSetDefault() {
        this.restoreTechniqueFromDatabaseOrSetDefault();
        this.restorePolicyFromDatabaseOrSetDefault();
    }
    applyCurrentAdaptation() {
        this.currentTechnique.apply(this.menuManager, this.currentPolicy, this.dataManager);
        console.log(`Applying technique ${this.currentTechnique.name} with policy ${this.currentPolicy.name}.`);
    }
    resetCurrentAdaptation() {
        this.currentTechnique.reset();
    }
    switchToAdaptation(techniqueName, policyName) {
        this.resetCurrentAdaptation();
        this.setTechnique(techniqueName);
        this.setPolicy(policyName);
        this.applyCurrentAdaptation();
    }
}
exports.AdaptationManager = AdaptationManager;

},{"./policies/AccessRankPolicy":5,"./policies/LongestVisitDurationPolicy":7,"./policies/MostClickedItemsPolicy":8,"./policies/MostRecentVisitsPolicy":9,"./policies/MostVisitedPagesPolicy":10,"./policies/SerialPositionCurvePolicy":13,"./techniques/Fold":14,"./techniques/Highlight":15,"./techniques/Identity":16,"./techniques/ReorderGroups":18,"./techniques/ReorderItems":19,"./techniques/composites/HighlightAndReorderAll":20,"./techniques/composites/HighlightAndReorderItems":21,"./techniques/composites/HighlightReorderItemsAndFold":22,"./techniques/composites/ProgressiveHighlightAndReorderItems":23,"./techniques/composites/ReorderItemsAndFold":24}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ItemClicksAnalyser_1 = require("../../data/ItemClicksAnalyser");
const Policy_1 = require("./Policy");
class AccessRankPolicy extends Policy_1.Policy {
    constructor() {
        super();
        this.name = "AccessRank";
    }
    computeMarkovScores(items, itemClicksAnalysis) {
        let markovScores = new Map();
        for (let item of items) {
            let itemID = item.id;
            let score = (itemClicksAnalysis.itemStats.get(itemID).localNbClicks + 1)
                / (itemClicksAnalysis.totalLocalNbClicks + 1);
            markovScores.set(item, score);
        }
        return markovScores;
    }
    computeCRFScores(items, itemClicksAnalysis) {
        let currentIndex = itemClicksAnalysis.currentEventIndex;
        let crfScores = new Map();
        for (let item of items) {
            let itemID = item.id;
            const p = 2;
            const lambda = 0.1;
            let score = 0;
            for (let eventIndex of itemClicksAnalysis.itemStats.get(itemID).eventIndices) {
                score += Math.pow(1 / p, lambda * (currentIndex - eventIndex));
            }
            crfScores.set(item, score);
        }
        return crfScores;
    }
    computeRegularityScores(items, itemClicksAnalysis) {
        let nbHourlyClicksPerItem = new Map();
        let nbDailyClicksPerItem = new Map();
        for (let item of items) {
            let itemID = item.id;
            let timestamps = itemClicksAnalysis.itemStats.get(itemID).timestamps;
            let nbHourlyClicks = new Array(24).fill(0);
            let nbDailyClicks = new Array(7).fill(0);
            for (let timestamp of timestamps) {
                let hour = new Date(timestamp).getHours();
                nbHourlyClicks[hour] += 1;
                let day = new Date(timestamp).getDay();
                nbDailyClicks[day - 1] += 1;
            }
            nbHourlyClicksPerItem.set(item, nbHourlyClicks);
            nbDailyClicksPerItem.set(item, nbDailyClicks);
        }
        let regularityScores = new Map();
        for (let item of items) {
            let itemID = item.id;
            let h = 1;
            let d = 1;
            if (itemClicksAnalysis.itemStats.get(itemID).nbClicks > 10) {
                let currentHour = new Date().getHours();
                let previousHour = currentHour === 0 ? 23 : currentHour - 1;
                let nextHour = currentHour === 23 ? 23 : 0;
                let nbHourlyClicks = nbHourlyClicksPerItem.get(item);
                let sameHourSlotNbClicks = nbHourlyClicks[previousHour]
                    + nbHourlyClicks[currentHour]
                    + nbHourlyClicks[nextHour];
                let averageSameHourSlotNbClicks = 0;
                for (let i = 0; i < 24; i++) {
                    averageSameHourSlotNbClicks += nbHourlyClicks[i === 0 ? 23 : i - 1]
                        + nbHourlyClicks[i]
                        + nbHourlyClicks[i === 23 ? 0 : i + 1];
                }
                averageSameHourSlotNbClicks /= 24;
                let currentDay = new Date().getDay();
                let nbDailyClicks = nbDailyClicksPerItem.get(item);
                let sameDayNbClicks = nbDailyClicks[currentDay - 1];
                let averageSameDayNbClicks = 0;
                for (let nbClicks of nbDailyClicks) {
                    averageSameDayNbClicks += nbClicks;
                }
                averageSameDayNbClicks /= 7;
                h = sameHourSlotNbClicks / averageSameHourSlotNbClicks;
                d = sameDayNbClicks / averageSameDayNbClicks;
            }
            let score = Math.pow(Math.max(0.8, Math.min(1.25, h * d)), 0.25);
            regularityScores.set(item, score);
        }
        return regularityScores;
    }
    getSortedItemsWithScores(menuManager, dataManager) {
        let itemClicksAnalysis = dataManager.analyser.getItemClickAnalysis();
        let items = menuManager.getAllItems();
        let splitItems = ItemClicksAnalyser_1.ItemClicksAnalyser.splitItemsByStatsAvailability(items, itemClicksAnalysis);
        let itemsWithStats = splitItems.withStats;
        let itemsWithoutStats = splitItems.withoutStats;
        let markovScores = this.computeMarkovScores(itemsWithStats, itemClicksAnalysis);
        let crfScores = this.computeCRFScores(itemsWithStats, itemClicksAnalysis);
        let regularityScores = this.computeRegularityScores(itemsWithStats, itemClicksAnalysis);
        const alpha = 1;
        let accessRankScores = new Map();
        for (let item of itemsWithStats) {
            let markovScore = markovScores.get(item);
            let crfScore = crfScores.get(item);
            let regularityScore = regularityScores.get(item);
            let score = Math.pow(markovScore, alpha)
                * Math.pow(crfScore, 1 / alpha)
                * regularityScore;
            accessRankScores.set(item, score);
        }
        let sortedItemsWithScores = [...accessRankScores.entries()]
            .sort((tuple1, tuple2) => {
            return tuple2[1] - tuple1[1];
        })
            .map((tuple) => {
            return {
                item: tuple[0],
                score: tuple[1]
            };
        });
        let itemsWithoutStatsWithScores = itemsWithoutStats.map((item) => {
            return {
                item: item,
                score: 0
            };
        });
        return sortedItemsWithScores.concat(itemsWithoutStatsWithScores);
    }
}
exports.AccessRankPolicy = AccessRankPolicy;

},{"../../data/ItemClicksAnalyser":31,"./Policy":12}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Policy_1 = require("./Policy");
class LinkedPageScorePolicy extends Policy_1.Policy {
    constructor() {
        super();
        this.pageScores = new Map();
        this.itemScores = new Map();
        this.pageVisitsAnalysis = null;
    }
    computeAndSetPageScores() {
        this.pageScores.clear();
        for (let pageID of this.pageVisitsAnalysis.pageStats.keys()) {
            let score = this.computePageScore(pageID);
            this.pageScores.set(pageID, score);
        }
    }
    computeAndSetItemScores(items) {
        this.itemScores.clear();
        for (let item of items) {
            let score = 0;
            for (let pageID of this.pageScores.keys()) {
                let matchingLinkNodes = item.findLinkNodes(pageID);
                if (matchingLinkNodes.length > 0) {
                    score = this.pageScores.get(pageID);
                    break;
                }
            }
            this.itemScores.set(item, score);
        }
    }
    getSortedItemsWithScores(menuManager, dataManager) {
        let items = menuManager.getAllItems();
        this.pageVisitsAnalysis = dataManager.analyser.getPageVisitsAnalysis();
        this.computeAndSetPageScores();
        this.computeAndSetItemScores(items);
        return [...this.itemScores.entries()]
            .map(([item, score]) => {
            return {
                item: item,
                score: score
            };
        })
            .sort((itemWithScore1, itemWithScore2) => {
            return itemWithScore2.score - itemWithScore1.score;
        });
    }
}
exports.LinkedPageScorePolicy = LinkedPageScorePolicy;

},{"./Policy":12}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const LinkedPageScorePolicy_1 = require("./LinkedPageScorePolicy");
class LongestVisitDurationPolicy extends LinkedPageScorePolicy_1.LinkedPageScorePolicy {
    constructor() {
        super();
        this.name = "Longest visit duration";
    }
    computePageScore(pageID) {
        return this.pageVisitsAnalysis.pageStats.get(pageID).totalVisitDuration;
    }
}
exports.LongestVisitDurationPolicy = LongestVisitDurationPolicy;

},{"./LinkedPageScorePolicy":6}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ItemClicksAnalyser_1 = require("../../data/ItemClicksAnalyser");
const Policy_1 = require("./Policy");
class MostClickedItemListPolicy extends Policy_1.Policy {
    constructor() {
        super();
        this.name = "Most clicked items";
        this.onlyLocalClicks = false;
    }
    sortMappedElementsByNbClicks(elementsToNbClicks) {
        return [...elementsToNbClicks.entries()]
            .map((tuple) => {
            return { element: tuple[0], nbClicks: tuple[1] };
        })
            .sort((e1, e2) => {
            return e2.nbClicks - e1.nbClicks;
        });
    }
    getItemNbClicks(item, analysis) {
        let itemStats = analysis.itemStats.get(item.id);
        return this.onlyLocalClicks
            ? itemStats.localNbClicks
            : itemStats.nbClicks;
    }
    mapItemsToNbClicks(items, analysis) {
        let itemsMappedToNbClicks = new Map();
        for (let item of items) {
            let nbClicks = this.getItemNbClicks(item, analysis);
            itemsMappedToNbClicks.set(item, nbClicks);
        }
        return itemsMappedToNbClicks;
    }
    getSortedItemsWithScores(menuManager, dataManager) {
        let itemClicksAnalysis = dataManager.analyser.getItemClickAnalysis();
        let items = menuManager.getAllItems();
        let splitItems = ItemClicksAnalyser_1.ItemClicksAnalyser.splitItemsByStatsAvailability(items, itemClicksAnalysis);
        let itemsMappedToNbClicks = this.mapItemsToNbClicks(splitItems.withStats, itemClicksAnalysis);
        let sortedItems = this.sortMappedElementsByNbClicks(itemsMappedToNbClicks);
        let totalNbConsideredClicks = this.onlyLocalClicks
            ? itemClicksAnalysis.totalLocalNbClicks
            : itemClicksAnalysis.totalNbClicks;
        let sortedItemsWithScores = sortedItems.map((e) => {
            return {
                item: e.element,
                score: e.nbClicks / totalNbConsideredClicks
            };
        });
        let remainingItemsWithScores = splitItems.withoutStats.map((item) => {
            return {
                item: item,
                score: 0
            };
        });
        return sortedItemsWithScores.concat(remainingItemsWithScores);
    }
    getGroupNbClicks(group, analysis) {
        let groupStats = analysis.groupStats.get(group.id);
        return this.onlyLocalClicks
            ? groupStats.localNbClicks
            : groupStats.nbClicks;
    }
    mapGroupsToNbClicks(groups, analysis) {
        let groupsMappedToNbClicks = new Map();
        for (let group of groups) {
            let nbClicks = this.getGroupNbClicks(group, analysis);
            groupsMappedToNbClicks.set(group, nbClicks);
        }
        return groupsMappedToNbClicks;
    }
    getSortedItemGroupsWithScores(menuManager, dataManager) {
        let itemClicksAnalysis = dataManager.analyser.getItemClickAnalysis();
        let groups = menuManager.getAllGroups();
        let splitGroups = ItemClicksAnalyser_1.ItemClicksAnalyser.splitItemGroupsByStatsAvailability(groups, itemClicksAnalysis);
        let groupsMappedToNbClicks = this.mapGroupsToNbClicks(splitGroups.withStats, itemClicksAnalysis);
        let sortedGroups = this.sortMappedElementsByNbClicks(groupsMappedToNbClicks);
        let totalNbConsideredClicks = this.onlyLocalClicks
            ? itemClicksAnalysis.totalLocalNbClicks
            : itemClicksAnalysis.totalNbClicks;
        let sortedGroupsWithScores = sortedGroups.map((e) => {
            return {
                group: e.element,
                score: e.nbClicks / totalNbConsideredClicks
            };
        });
        let remainingGroupsWithScores = splitGroups.withoutStats.map((group) => {
            return {
                group: group,
                score: 0
            };
        });
        return sortedGroupsWithScores.concat(remainingGroupsWithScores);
    }
}
exports.MostClickedItemListPolicy = MostClickedItemListPolicy;

},{"../../data/ItemClicksAnalyser":31,"./Policy":12}],9:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const LinkedPageScorePolicy_1 = require("./LinkedPageScorePolicy");
class MostRecentVisitsPolicy extends LinkedPageScorePolicy_1.LinkedPageScorePolicy {
    constructor() {
        super();
        this.name = "Most recently visited";
    }
    computePageScore(pageID) {
        return this.pageVisitsAnalysis.pageStats.get(pageID).lastVisitTimestamp;
    }
}
exports.MostRecentVisitsPolicy = MostRecentVisitsPolicy;

},{"./LinkedPageScorePolicy":6}],10:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const LinkedPageScorePolicy_1 = require("./LinkedPageScorePolicy");
class MostVisitedPagesPolicy extends LinkedPageScorePolicy_1.LinkedPageScorePolicy {
    constructor() {
        super();
        this.name = "Most visited pages";
    }
    computePageScore(pageID) {
        return this.pageVisitsAnalysis.pageStats.get(pageID).nbVisits;
    }
}
exports.MostVisitedPagesPolicy = MostVisitedPagesPolicy;

},{"./LinkedPageScorePolicy":6}],11:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Policy_1 = require("./Policy");
class NodeIndexOrderPolicy extends Policy_1.Policy {
    constructor() {
        super();
        this.name = "Node index order";
    }
    getSortedItemsWithScores(menuManager) {
        let items = menuManager.getAllItems();
        let uniformScore = 1 / items.length;
        return items
            .sort((item1, item2) => {
            return item1.node.index() - item2.node.index();
        })
            .map((item) => {
            return {
                item: item,
                score: uniformScore
            };
        });
    }
    getSortedItemGroupsWithScores(menuManager) {
        let groups = menuManager.getAllGroups();
        let uniformScore = 1 / groups.length;
        return groups
            .sort((group1, group2) => {
            return group1.node.index() - group2.node.index();
        })
            .map((group) => {
            return {
                group: group,
                score: uniformScore
            };
        });
    }
}
exports.NodeIndexOrderPolicy = NodeIndexOrderPolicy;

},{"./Policy":12}],12:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Policy {
    getSortedItems(menuManager, dataManager) {
        return this.getSortedItemsWithScores(menuManager, dataManager)
            .map((itemWithScore) => {
            return itemWithScore.item;
        });
    }
    getSortedItemGroupsWithScores(menuManager, dataManager) {
        let scorePerGroup = new Map();
        let sumOfScores = 0;
        let sortedItemsWithScores = this.getSortedItemsWithScores(menuManager, dataManager);
        for (let itemWithScore of sortedItemsWithScores) {
            let score = itemWithScore.score;
            let group = itemWithScore.item.parent;
            if (!scorePerGroup.has(group)) {
                scorePerGroup.set(group, score);
            }
            else {
                let currentGroupScore = scorePerGroup.get(group);
                scorePerGroup.set(group, currentGroupScore + score);
            }
            sumOfScores += score;
        }
        return [...scorePerGroup.entries()]
            .sort((tuple1, tuple2) => {
            return tuple2[1] - tuple1[1];
        })
            .map((tuple) => {
            return {
                group: tuple[0],
                score: tuple[1] / sumOfScores
            };
        });
    }
    getSortedItemGroups(menuManager, dataManager) {
        return this.getSortedItemGroupsWithScores(menuManager, dataManager)
            .map((groupWithScore) => {
            return groupWithScore.group;
        });
    }
}
exports.Policy = Policy;

},{}],13:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const LinkedPageScorePolicy_1 = require("./LinkedPageScorePolicy");
class SerialPositionCurvePolicy extends LinkedPageScorePolicy_1.LinkedPageScorePolicy {
    constructor() {
        super();
        this.name = "Serial-Position curve";
    }
    computeFamiliarityScore(pageID) {
        if (!this.pageVisitsAnalysis.pageStats.has(pageID)) {
            return 0;
        }
        let pageStats = this.pageVisitsAnalysis.pageStats.get(pageID);
        let recency = 0;
        let primacy = 0;
        let lastVisitTimestamp = pageStats.lastVisitTimestamp;
        let firstVisitTimestamp = pageStats.firstVisitTimestamp;
        for (let currentPageStats of this.pageVisitsAnalysis.pageStats.values()) {
            if (currentPageStats.lastVisitTimestamp > lastVisitTimestamp) {
                recency++;
            }
            if (currentPageStats.firstVisitTimestamp < firstVisitTimestamp) {
                primacy++;
            }
        }
        let frequencyScore = pageStats.visitFrequency;
        let recencyScore = (this.pageVisitsAnalysis.nbUniquePages - recency) / this.pageVisitsAnalysis.nbUniquePages;
        let primacyScore = (this.pageVisitsAnalysis.nbUniquePages - primacy) / this.pageVisitsAnalysis.nbUniquePages;
        let familiarity = (0.4 * frequencyScore)
            + (0.4 * recencyScore)
            + (0.2 * primacyScore);
        return familiarity;
    }
    computePageScore(pageID) {
        return this.computeFamiliarityScore(pageID);
    }
}
exports.SerialPositionCurvePolicy = SerialPositionCurvePolicy;

},{"./LinkedPageScorePolicy":6}],14:[function(require,module,exports){
(function (global){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const $ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);
const Item_1 = require("../../elements/Item");
class Fold {
    constructor() {
        this.name = "Fold";
        this.folderNodes = [];
    }
    unfold(folderNode) {
        folderNode.removeClass(Fold.IS_FOLDED_CLASS);
        folderNode
            .find("." + Fold.SWITCH_FOLD_BUTTON_CLASS)
            .html("Show less");
    }
    fold(folderNode) {
        folderNode.addClass(Fold.IS_FOLDED_CLASS);
        folderNode
            .find("." + Fold.SWITCH_FOLD_BUTTON_CLASS)
            .html("Show more");
    }
    switchFoldState(folderNode) {
        if (folderNode.hasClass(Fold.IS_FOLDED_CLASS)) {
            this.unfold(folderNode);
        }
        else {
            this.fold(folderNode);
        }
    }
    createSwitchFoldButton(folderNode) {
        let button = $("<button>")
            .addClass(Fold.SWITCH_FOLD_BUTTON_CLASS)
            .attr("type", "button");
        button.on("click", () => {
            this.switchFoldState(folderNode);
        });
        return button;
    }
    createAndAppendFoldButtonToFolder(folderNode) {
        let button = this.createSwitchFoldButton(folderNode);
        folderNode
            .find("." + Fold.FOLDABLE_ELEMENT_CLASS)
            .last()
            .after(button);
    }
    makeFolder(items) {
        for (let item of items) {
            item.node.addClass(Fold.FOLDABLE_ELEMENT_CLASS);
        }
        let folderNode = items[0].parent.node;
        folderNode.addClass(Fold.FOLDER_ELEMENT_CLASS);
        this.folderNodes.push(folderNode);
        this.createAndAppendFoldButtonToFolder(folderNode);
        this.fold(folderNode);
    }
    getMaxNbItemsToDisplayInGroup(nbItemsInGroup) {
        return Math.ceil(Math.sqrt(nbItemsInGroup));
    }
    splitAndApplyByGroup(items) {
        let topItemsSplitByGroup = Item_1.Item.splitAllByGroup(items);
        for (let sameGroupItems of topItemsSplitByGroup) {
            this.applyInGroup(sameGroupItems);
        }
    }
    applyInGroup(sameGroupItems) {
        let totalNbGroupItems = sameGroupItems[0].parent.items.length;
        let nbItemToKeep = this.getMaxNbItemsToDisplayInGroup(totalNbGroupItems);
        sameGroupItems.splice(0, nbItemToKeep);
        this.makeFolder(sameGroupItems);
    }
    apply(menuManager, policy, dataManager) {
        let items = policy.getSortedItems(menuManager, dataManager);
        this.splitAndApplyByGroup(items);
    }
    reset() {
        for (let folderNode of this.folderNodes) {
            folderNode
                .find("." + Fold.FOLDABLE_ELEMENT_CLASS)
                .removeClass(Fold.FOLDER_ELEMENT_CLASS);
            folderNode
                .find("." + Fold.SWITCH_FOLD_BUTTON_CLASS)
                .remove();
            folderNode.removeClass(Fold.FOLDER_ELEMENT_CLASS);
        }
        this.folderNodes = [];
    }
}
Fold.IS_FOLDED_CLASS = "awm-folded";
Fold.SWITCH_FOLD_BUTTON_CLASS = "awm-fold-button";
Fold.FOLDABLE_ELEMENT_CLASS = "awm-foldable";
Fold.FOLDER_ELEMENT_CLASS = "awm-folder";
exports.Fold = Fold;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../../elements/Item":34}],15:[function(require,module,exports){
(function (global){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const $ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);
const Item_1 = require("../../elements/Item");
var HighlightingLevel;
(function (HighlightingLevel) {
    HighlightingLevel["High"] = "awm-high";
    HighlightingLevel["Low"] = "awm-low";
})(HighlightingLevel || (HighlightingLevel = {}));
const HIGHLIGHTING_LEVELS_CLASSES = Object.keys(HighlightingLevel)
    .map((key) => {
    return HighlightingLevel[key];
});
class Highlight {
    constructor() {
        this.name = "Highlight";
        this.itemsToHighlightAtHighLevel = new Set();
    }
    onNode(node, level) {
        node.addClass([Highlight.HIGHLIGHTED_ELEMENT_CLASS, level]);
    }
    onAllItems(items) {
        for (let item of items) {
            let highlightingLevel = this.itemsToHighlightAtHighLevel.has(item)
                ? HighlightingLevel.High
                : HighlightingLevel.Low;
            this.onNode(item.node, highlightingLevel);
        }
    }
    getFilteredSortedItemWithScores(menuManager, policy, dataManager) {
        return policy
            .getSortedItemsWithScores(menuManager, dataManager)
            .filter((itemWithScore) => {
            return itemWithScore.score > 0;
        });
    }
    getMaxNbItemsToHighlight(nbItems) {
        return Math.floor(Math.sqrt(nbItems));
    }
    getMaxNbItemsToHighlightInGroup(nbItemsInGroup) {
        return Math.floor(Math.sqrt(nbItemsInGroup));
    }
    computeItemsToHighlightAtHighLevel(itemWithScores) {
        this.itemsToHighlightAtHighLevel.clear();
        for (let i = 0; i < Math.min(2, itemWithScores.length); i++) {
            let itemWithScore = itemWithScores[i];
            if (itemWithScore.score === 0) {
                continue;
            }
            this.itemsToHighlightAtHighLevel.add(itemWithScore.item);
        }
    }
    applyInGroup(sameGroupItems) {
        let totalNbGroupItems = sameGroupItems[0].parent.items.length;
        let nbTopSameGroupItemsToKeep = this.getMaxNbItemsToHighlightInGroup(totalNbGroupItems);
        let topSameGroupItems = sameGroupItems.splice(0, nbTopSameGroupItemsToKeep);
        this.onAllItems(topSameGroupItems);
    }
    splitAndApplyByGroup(items) {
        let topItemsSplitByGroup = Item_1.Item.splitAllByGroup(items);
        for (let sameGroupItems of topItemsSplitByGroup) {
            this.applyInGroup(sameGroupItems);
        }
    }
    apply(menuManager, policy, dataManager) {
        let itemWithScores = this.getFilteredSortedItemWithScores(menuManager, policy, dataManager);
        let totalNbItems = menuManager.getNbItems();
        let nbTopItemsToKeep = this.getMaxNbItemsToHighlight(totalNbItems);
        let topItemWtihScores = itemWithScores.slice(0, nbTopItemsToKeep);
        let topItems = topItemWtihScores.map((itemScore) => {
            return itemScore.item;
        });
        this.computeItemsToHighlightAtHighLevel(topItemWtihScores);
        this.splitAndApplyByGroup(topItems);
    }
    reset() {
        let classesToRemove = HIGHLIGHTING_LEVELS_CLASSES;
        classesToRemove.push(Highlight.HIGHLIGHTED_ELEMENT_CLASS);
        $("." + Highlight.HIGHLIGHTED_ELEMENT_CLASS)
            .removeClass(classesToRemove);
        this.itemsToHighlightAtHighLevel.clear();
    }
}
Highlight.HIGHLIGHTED_ELEMENT_CLASS = "awm-highlighted";
exports.Highlight = Highlight;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../../elements/Item":34}],16:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Identity {
    constructor() {
        this.name = "Identity";
    }
    reset() {
    }
    apply() {
    }
}
exports.Identity = Identity;

},{}],17:[function(require,module,exports){
(function (global){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const $ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);
const AdaptiveElement_1 = require("../../elements/AdaptiveElement");
class Reorder {
    constructor() {
        this.childrenInOriginalOrder = new Map();
        this.nonReorderableElementsInitialIndices = new Map();
    }
    getReorderedElementClass() {
        return "awm-reordered";
    }
    splitNodesByParents(nodes) {
        let parentsToChildren = new Map();
        for (let node of nodes) {
            let parentElement = node
                .parent()
                .get(0);
            if (parentsToChildren.has(parentElement)) {
                parentsToChildren
                    .get(parentElement)
                    .push(node);
            }
            else {
                parentsToChildren.set(parentElement, [node]);
            }
        }
        return parentsToChildren;
    }
    insertNode(node, index) {
        if (index === node.index()) {
            return;
        }
        if (index === 0) {
            node
                .parent()
                .prepend(node);
        }
        else {
            node
                .parent()
                .children()
                .eq(index - 1)
                .after(node);
        }
    }
    moveReorderableNode(node, index) {
        this.insertNode(node, index);
        node.addClass(this.getReorderedElementClass());
    }
    reinsertNonReorderableElements() {
        for (let element of this.nonReorderableElementsInitialIndices.keys()) {
            let originalIndex = this.nonReorderableElementsInitialIndices.get(element);
            this.insertNode($(element), originalIndex);
        }
    }
    saveNonReorderableElementsOriginalIndices(parent) {
        parent.children("." + Reorder.NON_REORDERABLE_ELEMENT_CLASS)
            .each((_, element) => {
            let index = $(element).index();
            this.nonReorderableElementsInitialIndices.set(element, index);
        });
    }
    saveParentNodeChildrenInOriginalOrder(elements) {
        for (let element of elements) {
            let parentElement = element.node.parent()[0];
            if (!this.childrenInOriginalOrder.has(parentElement)) {
                this.childrenInOriginalOrder.set(parentElement, $(parentElement).children());
            }
        }
    }
    getSortedChildrenIndices(parent) {
        let type = this.getReorderedElementType();
        return parent
            .children(`[${AdaptiveElement_1.AdaptiveElement.TAG_PREFIX}type=${type}]`)
            .get()
            .map((element) => {
            return $(element).index();
        })
            .sort((index1, index2) => {
            return index1 - index2;
        });
    }
    reorderAllElements(elements) {
        let nodes = elements.map((element) => {
            return element.node;
        });
        let nodesSplitByParents = this.splitNodesByParents(nodes);
        for (let parent of nodesSplitByParents.keys()) {
            let parentNode = $(parent);
            let childNodes = nodesSplitByParents.get(parent);
            this.saveNonReorderableElementsOriginalIndices(parentNode);
            let insertionIndices = this.getSortedChildrenIndices(parentNode);
            childNodes.forEach((node, index) => {
                this.moveReorderableNode(node, insertionIndices[index]);
            });
        }
        this.reinsertNonReorderableElements();
    }
    reset() {
        for (let [parent, orderedChildNodes] of this.childrenInOriginalOrder.entries()) {
            let parentNode = $(parent);
            orderedChildNodes.each((_, element) => {
                parentNode.append(element);
            });
        }
        this.childrenInOriginalOrder.clear();
        let reorderedElementClass = this.getReorderedElementClass();
        $("." + reorderedElementClass).removeClass(reorderedElementClass);
        this.nonReorderableElementsInitialIndices.clear();
    }
}
Reorder.NON_REORDERABLE_ELEMENT_CLASS = "awm-no-reordering";
exports.Reorder = Reorder;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../../elements/AdaptiveElement":33}],18:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Reorder_1 = require("./Reorder");
const ItemGroup_1 = require("../../elements/ItemGroup");
class ReorderGroups extends Reorder_1.Reorder {
    constructor() {
        super();
        this.name = "Reorder groups";
    }
    getReorderedElementClass() {
        return "awm-reordered-group";
    }
    getReorderedElementType() {
        return ItemGroup_1.ItemGroup.ELEMENT_TYPE;
    }
    getFilteredSortedGroups(menuManager, policy, dataManager) {
        return policy
            .getSortedItemGroupsWithScores(menuManager, dataManager)
            .filter((groupWithScore) => {
            if (!groupWithScore.group.canBeReordered) {
                return false;
            }
            return groupWithScore.score > 0;
        })
            .map((groupWithScore) => {
            return groupWithScore.group;
        });
    }
    apply(menuManager, policy, dataManager) {
        let groups = this.getFilteredSortedGroups(menuManager, policy, dataManager);
        this.saveParentNodeChildrenInOriginalOrder(groups);
        this.reorderAllElements(groups);
    }
}
ReorderGroups.REORDERED_ELEMENT_CLASS = "awm-reordered-group";
exports.ReorderGroups = ReorderGroups;

},{"../../elements/ItemGroup":35,"./Reorder":17}],19:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Reorder_1 = require("./Reorder");
const Item_1 = require("../../elements/Item");
class ReorderItems extends Reorder_1.Reorder {
    constructor() {
        super();
        this.name = "Reorder items";
    }
    getReorderedElementClass() {
        return "awm-reordered-item";
    }
    getReorderedElementType() {
        return Item_1.Item.ELEMENT_TYPE;
    }
    getFilteredSortedItems(menuManager, policy, dataManager) {
        return policy
            .getSortedItemsWithScores(menuManager, dataManager)
            .filter((itemWithScore) => {
            if (!itemWithScore.item.canBeReordered) {
                return false;
            }
            return itemWithScore.score > 0;
        })
            .map((itemWithScore) => {
            return itemWithScore.item;
        });
    }
    getMaxNbItemsToReorder(nbItems) {
        return Math.floor(Math.sqrt(nbItems));
    }
    getMaxNbItemsToReorderInGroup(nbItemsInGroup) {
        return Math.floor(Math.sqrt(nbItemsInGroup));
    }
    applyInGroup(sameGroupItems) {
        let totalNbGroupItems = sameGroupItems[0].parent.items.length;
        let nbTopSameGroupItemsToKeep = this.getMaxNbItemsToReorderInGroup(totalNbGroupItems);
        let topSameGroupItems = sameGroupItems.splice(0, nbTopSameGroupItemsToKeep);
        this.reorderAllElements(topSameGroupItems);
    }
    splitAndApplyByGroup(items) {
        let topItemsSplitByGroup = Item_1.Item.splitAllByGroup(items);
        for (let sameGroupItems of topItemsSplitByGroup) {
            this.applyInGroup(sameGroupItems);
        }
    }
    apply(menuManager, policy, dataManager) {
        let items = this.getFilteredSortedItems(menuManager, policy, dataManager);
        this.saveParentNodeChildrenInOriginalOrder(items);
        let totalNbItems = menuManager.getNbItems();
        let nbTopItemsToKeep = this.getMaxNbItemsToReorder(totalNbItems);
        let topItems = items.slice(0, nbTopItemsToKeep);
        this.splitAndApplyByGroup(topItems);
    }
}
ReorderItems.REORDERED_ELEMENT_CLASS = "awm-reordered-item";
exports.ReorderItems = ReorderItems;

},{"../../elements/Item":34,"./Reorder":17}],20:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ReorderItems_1 = require("../ReorderItems");
const ReorderGroups_1 = require("./../ReorderGroups");
const Highlight_1 = require("../Highlight");
class HighlightAndReorderAll {
    constructor() {
        this.name = "Highlight + reorder items & groups";
        this.highlight = new Highlight_1.Highlight();
        this.reorderItems = new ReorderItems_1.ReorderItems();
        this.reorderGroups = new ReorderGroups_1.ReorderGroups();
    }
    reset() {
        this.reorderGroups.reset();
        this.reorderItems.reset();
        this.highlight.reset();
    }
    apply(menuManager, policy, dataManager) {
        this.highlight.apply(menuManager, policy, dataManager);
        this.reorderItems.apply(menuManager, policy, dataManager);
        this.reorderGroups.apply(menuManager, policy, dataManager);
    }
}
exports.HighlightAndReorderAll = HighlightAndReorderAll;

},{"../Highlight":15,"../ReorderItems":19,"./../ReorderGroups":18}],21:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Highlight_1 = require("../Highlight");
const ReorderItems_1 = require("../ReorderItems");
class HighlightAndReorderItems {
    constructor() {
        this.name = "Highlight + reorder items";
        this.highlight = new Highlight_1.Highlight();
        this.reorder = new ReorderItems_1.ReorderItems();
    }
    reset() {
        this.reorder.reset();
        this.highlight.reset();
    }
    apply(menuManager, policy, dataManager) {
        this.highlight.apply(menuManager, policy, dataManager);
        this.reorder.apply(menuManager, policy, dataManager);
    }
}
exports.HighlightAndReorderItems = HighlightAndReorderItems;

},{"../Highlight":15,"../ReorderItems":19}],22:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Highlight_1 = require("../Highlight");
const ReorderItems_1 = require("../ReorderItems");
const Fold_1 = require("../Fold");
const NodeIndexOrderPolicy_1 = require("../../policies/NodeIndexOrderPolicy");
class HighlightReorderItemsAndFold {
    constructor() {
        this.name = "Highlight + reorder + fold";
        this.highlight = new Highlight_1.Highlight();
        this.reorder = new ReorderItems_1.ReorderItems();
        this.fold = new Fold_1.Fold();
        this.nodeIndexOrderPolicy = new NodeIndexOrderPolicy_1.NodeIndexOrderPolicy();
    }
    reset() {
        this.fold.reset();
        this.reorder.reset();
        this.highlight.reset();
    }
    apply(menuManager, policy, dataManager) {
        this.highlight.apply(menuManager, policy, dataManager);
        this.reorder.apply(menuManager, policy, dataManager);
        this.fold.apply(menuManager, this.nodeIndexOrderPolicy);
    }
}
exports.HighlightReorderItemsAndFold = HighlightReorderItemsAndFold;

},{"../../policies/NodeIndexOrderPolicy":11,"../Fold":14,"../Highlight":15,"../ReorderItems":19}],23:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Highlight_1 = require("../Highlight");
const ReorderItems_1 = require("../ReorderItems");
const AccessRankPolicy_1 = require("../../policies/AccessRankPolicy");
class ProgressiveHighlightAndReorderItems {
    constructor() {
        this.name = "Progressive HL + R items";
        this.policy = new AccessRankPolicy_1.AccessRankPolicy();
        this.allItems = null;
        this.previousItemCharacteristics = null;
        this.currentItemCharacteristics = null;
        this.progressiveHighlight = this.createProgressiveHighlight();
        this.progressiveReorder = this.createProgressiveReorderItem();
    }
    getItemsWithCurrentState(state) {
        let itemIDsWithMatchingState = Object.keys(this.currentItemCharacteristics)
            .filter((itemID) => {
            return this.currentItemCharacteristics[itemID].state === state;
        });
        return this.allItems.filter((item) => {
            return itemIDsWithMatchingState.find((itemID) => {
                return item.id === itemID;
            }) !== undefined;
        });
    }
    createProgressiveHighlight() {
        let self = this;
        return new class ProgressiveHighlight extends Highlight_1.Highlight {
            constructor() {
                super();
            }
            apply() {
                let itemsToHighlightAtHighLevel = self.getItemsWithCurrentState(2)
                    .concat(self.getItemsWithCurrentState(3));
                let itemsToHighlight = itemsToHighlightAtHighLevel
                    .concat(self.getItemsWithCurrentState(1));
                this.itemsToHighlightAtHighLevel = new Set(itemsToHighlightAtHighLevel);
                this.onAllItems(itemsToHighlight);
            }
        }();
    }
    createProgressiveReorderItem() {
        let self = this;
        return new class ProgressiveReorderItems extends ReorderItems_1.ReorderItems {
            constructor() {
                super();
            }
            apply() {
                let sortedItemsToReorder = self.getItemsWithCurrentState(3)
                    .sort((item1, item2) => {
                    return self.currentItemCharacteristics[item2.id].score
                        - self.currentItemCharacteristics[item1.id].score;
                });
                this.reorderAllElements(sortedItemsToReorder);
            }
        }();
    }
    loadOrInitPreviousItemCharactertics(items, database) {
        this.previousItemCharacteristics = database.persistentStorage.previousItemCharacteristics;
        if (this.previousItemCharacteristics === undefined) {
            this.previousItemCharacteristics = {};
        }
        for (let item of items) {
            let itemID = item.id;
            if (!(itemID in this.previousItemCharacteristics)) {
                this.previousItemCharacteristics[itemID] = {
                    state: 0,
                    score: 0,
                    lastStateChangeScore: 0
                };
            }
        }
    }
    saveCurrentItemCharacteristics(database) {
        database.persistentStorage.previousItemCharacteristics = JSON.parse(JSON.stringify(this.currentItemCharacteristics));
    }
    computeItemAdaptationState(previousState, previousScore, currentScore, lastStateChangeScore) {
        let scoreDifference = currentScore - lastStateChangeScore;
        if (Math.abs(scoreDifference) < 0.1) {
            return previousState;
        }
        switch (previousState) {
            case 0:
                if (currentScore > 0.1) {
                    return 1;
                }
                else {
                    return 0;
                }
            case 1:
                if (scoreDifference > 0.3) {
                    return 2;
                }
                else if (scoreDifference < -0.2) {
                    return 0;
                }
                else {
                    return 1;
                }
            case 2:
                if (scoreDifference > 0.3) {
                    return 3;
                }
                else if (scoreDifference < -0.2) {
                    return 1;
                }
                else {
                    return 2;
                }
            case 3:
                if (scoreDifference < -0.4) {
                    return 2;
                }
                else {
                    return 3;
                }
        }
    }
    computeCurrentItemCharacteristics(sortedItemsWithScores) {
        let currentItemCharacteristics = {};
        for (let itemWithScore of sortedItemsWithScores) {
            let itemID = itemWithScore.item.id;
            let previousScore = this.previousItemCharacteristics[itemID].score;
            let lastStateChangeScore = this.previousItemCharacteristics[itemID].lastStateChangeScore;
            let currentScore = itemWithScore.score;
            let previousState = this.previousItemCharacteristics[itemID].state;
            let currentState = this.computeItemAdaptationState(previousState, previousScore, currentScore, lastStateChangeScore);
            currentItemCharacteristics[itemID] = {
                state: currentState,
                score: currentScore,
                lastStateChangeScore: previousState === currentState
                    ? this.previousItemCharacteristics[itemID].lastStateChangeScore
                    : currentScore
            };
        }
        this.currentItemCharacteristics = currentItemCharacteristics;
    }
    reset() {
        this.progressiveReorder.reset();
        this.progressiveHighlight.reset();
        this.allItems = null;
        this.previousItemCharacteristics = null;
        this.currentItemCharacteristics = null;
    }
    apply(menuManager, _, dataManager) {
        let allItems = menuManager.getAllItems();
        let sortedItemsWithScores = this.policy.getSortedItemsWithScores(menuManager, dataManager);
        this.allItems = allItems;
        this.loadOrInitPreviousItemCharactertics(allItems, dataManager.database);
        this.computeCurrentItemCharacteristics(sortedItemsWithScores);
        this.saveCurrentItemCharacteristics(dataManager.database);
        console.log("Current characterstics", this.currentItemCharacteristics);
        this.progressiveHighlight.apply(null, null);
        this.progressiveReorder.apply(null, null);
    }
}
exports.ProgressiveHighlightAndReorderItems = ProgressiveHighlightAndReorderItems;

},{"../../policies/AccessRankPolicy":5,"../Highlight":15,"../ReorderItems":19}],24:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ReorderItems_1 = require("../ReorderItems");
const Fold_1 = require("../Fold");
const NodeIndexOrderPolicy_1 = require("../../policies/NodeIndexOrderPolicy");
class ReorderItemsAndFold {
    constructor() {
        this.name = "Reorder items + fold";
        this.reorder = new ReorderItems_1.ReorderItems();
        this.fold = new Fold_1.Fold();
        this.naturalOrderPolicy = new NodeIndexOrderPolicy_1.NodeIndexOrderPolicy();
    }
    reset() {
        this.fold.reset();
        this.reorder.reset();
    }
    apply(menuManager, policy, dataManager) {
        this.reorder.apply(menuManager, policy, dataManager);
        this.fold.apply(menuManager, this.naturalOrderPolicy);
    }
}
exports.ReorderItemsAndFold = ReorderItemsAndFold;

},{"../../policies/NodeIndexOrderPolicy":11,"../Fold":14,"../ReorderItems":19}],25:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AdaptiveWebMenus_1 = require("./AdaptiveWebMenus");
window["AdaptiveWebMenus"] = AdaptiveWebMenus_1.AdaptiveWebMenus;

},{"./AdaptiveWebMenus":1}],26:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ItemClicksAnalyser_1 = require("./ItemClicksAnalyser");
const PageVisitsAnalyser_1 = require("./PageVisitsAnalyser");
class DataAnalyser {
    constructor(database) {
        this.itemClicksAnalyser = new ItemClicksAnalyser_1.ItemClicksAnalyser(database);
        this.pageVisitsAnalyser = new PageVisitsAnalyser_1.PageVisitsAnalyser(database);
    }
    getItemClickAnalysis() {
        return this.itemClicksAnalyser.getAnalysis();
    }
    getPageVisitsAnalysis() {
        return this.pageVisitsAnalyser.getAnalysis();
    }
}
exports.DataAnalyser = DataAnalyser;

},{"./ItemClicksAnalyser":31,"./PageVisitsAnalyser":32}],27:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class DataAnalyserModule {
    constructor(database) {
        this.database = database;
        this.cachedAnalysis = null;
        this.cachedAnalysisContentRevision = 0;
    }
    needsAnalysisUpdate() {
        return this.cachedAnalysis === null
            || this.cachedAnalysisContentRevision !== this.database.getCurrentRevision();
    }
    updateContentRevision() {
        this.cachedAnalysisContentRevision = this.database.getCurrentRevision();
    }
    makeAnalysisDeepCopy(analysis) {
        return JSON.parse(JSON.stringify(analysis));
    }
    getAnalysis() {
        if (this.needsAnalysisUpdate()) {
            this.updateContentRevision();
            this.cachedAnalysis = this.computeAnalysis();
        }
        return this.makeAnalysisDeepCopy(this.cachedAnalysis);
    }
}
exports.DataAnalyserModule = DataAnalyserModule;

},{}],28:[function(require,module,exports){
(function (global){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const $ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);
const Utilities_1 = require("../Utilities");
class DataLogger {
    constructor(database, menuManager) {
        this.database = database;
        this.pageLoadTimestamp = Date.now();
        this.itemClickCallbacks = new Map();
        this.init(menuManager);
    }
    init(menuManager) {
        this.startListeningForAllMenusItemClicks(menuManager);
        this.startListeningForPageBeforeUnload();
    }
    startListeningForItemClicks(items) {
        let self = this;
        for (let item of items) {
            let callback = (event) => {
                self.onMenuItemClick(event, item);
            };
            this.itemClickCallbacks.set(item.id, callback);
            item.node.on("click", callback);
        }
    }
    stopListeningForItemClicks(items) {
        for (let item of items) {
            let callback = this.itemClickCallbacks.get(item.id);
            this.itemClickCallbacks.delete(item.id);
            item.node.off("click", callback);
        }
    }
    startListeningForMenuItemClicks(menu) {
        let items = menu.getAllItems();
        this.startListeningForItemClicks(items);
    }
    stopListeningForMenuItemClicks(menu) {
        let items = menu.getAllItems();
        this.stopListeningForItemClicks(items);
    }
    startListeningForAllMenusItemClicks(menuManager) {
        let items = menuManager.getAllItems();
        this.startListeningForItemClicks(items);
    }
    stopListeningForAllMenusItemClicks(menuManager) {
        let items = menuManager.getAllItems();
        this.stopListeningForItemClicks(items);
    }
    onMenuItemClick(event, item) {
        this.database.logItemClick({
            itemID: item.id,
            groupID: item.parent.id,
            menuID: item.parent.parent.id,
            timestamp: event.timeStamp,
            pageID: Utilities_1.Utilities.getCurrentPageID()
        });
    }
    startListeningForPageBeforeUnload() {
        let self = this;
        $(window).on("beforeunload", (event) => {
            self.onPageBeforeUnload(event);
        });
    }
    onPageBeforeUnload(event) {
        this.database.logPageVisit({
            timestamp: this.pageLoadTimestamp,
            pageID: Utilities_1.Utilities.getCurrentPageID(),
            duration: event.timeStamp
        });
    }
}
exports.DataLogger = DataLogger;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../Utilities":3}],29:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Database_1 = require("./Database");
const DataLogger_1 = require("./DataLogger");
const DataAnalyser_1 = require("./DataAnalyser");
class DataManager {
    constructor(menuManager) {
        this.database = new Database_1.Database();
        this.logger = new DataLogger_1.DataLogger(this.database, menuManager);
        this.analyser = new DataAnalyser_1.DataAnalyser(this.database);
        console.log("ITEM CLICK ANALYSIS", this.analyser.getItemClickAnalysis());
        console.log("PAGE VISITS ANALYSIS", this.analyser.getPageVisitsAnalysis());
    }
}
exports.DataManager = DataManager;

},{"./DataAnalyser":26,"./DataLogger":28,"./Database":30}],30:[function(require,module,exports){
(function (global){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const $ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);
const Utilities_1 = require("../Utilities");
class Database {
    constructor() {
        this.init();
        this.startListeningForPageUnload();
        console.log("Database loaded:", this);
    }
    init() {
        this.setContentToDefault();
        if (this.isLocalStorageDataAvailable()) {
            this.loadFromLocalStorage();
        }
    }
    setContentToDefault() {
        this.tables = {
            itemClicks: {
                currentIndex: 0,
                entries: []
            },
            pageVisits: {
                currentIndex: 0,
                entries: []
            }
        };
        this.persistentStorage = {};
        this.currentRevision = 0;
    }
    empty() {
        this.setContentToDefault();
        this.clearLocalStorageData();
    }
    getCurrentRevision() {
        return this.currentRevision;
    }
    isRevisionUpToDate(revision) {
        return this.currentRevision === revision;
    }
    getItemClickLogs() {
        return this.tables.itemClicks.entries;
    }
    getItemClickLogsCurrentIndex() {
        return this.tables.itemClicks.currentIndex;
    }
    logItemClick(log) {
        let newEntry = Object.assign(log, {
            index: this.tables.itemClicks.currentIndex
        });
        this.tables.itemClicks.entries.push(newEntry);
        this.tables.itemClicks.currentIndex += 1;
        this.currentRevision += 1;
        return this.currentRevision;
    }
    getPageVisitLogs() {
        return this.tables.pageVisits.entries;
    }
    getPageVisitLogsCurrentIndex() {
        return this.tables.pageVisits.currentIndex;
    }
    logPageVisit(log) {
        let newEntry = Object.assign(log, {
            index: this.tables.pageVisits.currentIndex
        });
        this.tables.pageVisits.entries.push(newEntry);
        this.tables.pageVisits.currentIndex += 1;
        this.currentRevision += 1;
        return this.currentRevision;
    }
    packDataToJSON() {
        let packedData = {
            tables: this.tables,
            persistentStorage: this.persistentStorage,
            currentRevision: this.currentRevision
        };
        return JSON.stringify(packedData);
    }
    unpackDataFromJSON(json) {
        let unpackedData = JSON.parse(json);
        function getFirstValueIfDefined(value1, value2) {
            return value1 !== undefined ? value1 : value2;
        }
        this.tables = getFirstValueIfDefined(unpackedData.tables, this.tables);
        this.persistentStorage = getFirstValueIfDefined(unpackedData.persistentStorage, this.persistentStorage);
        this.currentRevision = getFirstValueIfDefined(unpackedData.currentRevision, this.currentRevision);
    }
    isLocalStorageDataAvailable() {
        return Utilities_1.Utilities.isLocalStorageAvailable()
            && window.localStorage.getItem(Database.LOCAL_STORAGE_KEY) !== null;
    }
    saveInLocalStorage() {
        if (!Utilities_1.Utilities.isLocalStorageAvailable()) {
            return;
        }
        let packedDataAsJSON = this.packDataToJSON();
        window.localStorage.setItem(Database.LOCAL_STORAGE_KEY, packedDataAsJSON);
    }
    loadFromLocalStorage() {
        if (!Utilities_1.Utilities.isLocalStorageAvailable()) {
            return;
        }
        let packedDataAsJSON = window.localStorage.getItem(Database.LOCAL_STORAGE_KEY);
        this.unpackDataFromJSON(packedDataAsJSON);
    }
    clearLocalStorageData() {
        if (!Utilities_1.Utilities.isLocalStorageAvailable()) {
            return;
        }
        window.localStorage.removeItem(Database.LOCAL_STORAGE_KEY);
    }
    startListeningForPageUnload() {
        $(window).on("unload", (_) => {
            this.onPageUnload();
        });
    }
    onPageUnload() {
        this.saveInLocalStorage();
    }
}
Database.LOCAL_STORAGE_KEY = "awm-data";
exports.Database = Database;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../Utilities":3}],31:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Utilities_1 = require("../Utilities");
const DataAnalyserModule_1 = require("./DataAnalyserModule");
class ItemClicksAnalyser extends DataAnalyserModule_1.DataAnalyserModule {
    constructor(database) {
        super(database);
    }
    createItemClickAnalysis() {
        return {
            totalNbClicks: 0,
            totalLocalNbClicks: 0,
            itemStats: new Map(),
            groupStats: new Map(),
            currentEventIndex: this.database.getItemClickLogsCurrentIndex()
        };
    }
    createItemStats() {
        return {
            nbClicks: 0,
            localNbClicks: 0,
            clickFrequency: 0,
            localClickFrequency: 0,
            eventIndices: [],
            sourcePageIDs: [],
            timestamps: []
        };
    }
    createItemGroupStats() {
        return {
            nbClicks: 0,
            localNbClicks: 0,
            clickFrequency: 0,
            localClickFrequency: 0,
            eventIndices: [],
            sourcePageIDs: [],
            timestamps: []
        };
    }
    makeAnalysisDeepCopy(analysis) {
        return {
            totalNbClicks: analysis.totalNbClicks,
            totalLocalNbClicks: analysis.totalLocalNbClicks,
            itemStats: new Map(analysis.itemStats),
            groupStats: new Map(analysis.groupStats),
            currentEventIndex: analysis.currentEventIndex
        };
    }
    updateItemStatsWithClick(log, analysis, clickIsLocal) {
        let itemID = log.itemID;
        if (!analysis.itemStats.has(itemID)) {
            analysis.itemStats.set(itemID, this.createItemStats());
        }
        let itemStats = analysis.itemStats.get(itemID);
        itemStats.nbClicks += 1;
        if (clickIsLocal) {
            itemStats.localNbClicks += 1;
        }
        itemStats.sourcePageIDs.push(log.pageID);
        itemStats.timestamps.push(log.timestamp);
        itemStats.eventIndices.push(log.index);
    }
    updateItemGroupStatsWithClick(log, analysis, clickIsLocal) {
        let groupID = log.groupID;
        if (!analysis.groupStats.has(groupID)) {
            analysis.groupStats.set(groupID, this.createItemGroupStats());
        }
        let groupStats = analysis.groupStats.get(groupID);
        groupStats.nbClicks += 1;
        if (clickIsLocal) {
            groupStats.localNbClicks += 1;
        }
        groupStats.sourcePageIDs.push(log.pageID);
        groupStats.timestamps.push(log.timestamp);
        groupStats.eventIndices.push(log.index);
    }
    processItemClickLog(log, analysis) {
        let currentPageID = Utilities_1.Utilities.getCurrentPageID();
        let clickIsLocal = log.pageID === currentPageID;
        analysis.totalNbClicks += 1;
        if (clickIsLocal) {
            analysis.totalLocalNbClicks += 1;
        }
        this.updateItemStatsWithClick(log, analysis, clickIsLocal);
        this.updateItemGroupStatsWithClick(log, analysis, clickIsLocal);
    }
    computeFrequencies(analysis) {
        for (let itemStats of analysis.itemStats.values()) {
            itemStats.clickFrequency = itemStats.nbClicks / analysis.totalNbClicks;
            itemStats.localClickFrequency = itemStats.localNbClicks / analysis.totalLocalNbClicks;
        }
    }
    computeAnalysis() {
        let itemClickLogs = this.database.getItemClickLogs();
        let analysis = this.createItemClickAnalysis();
        for (let itemClickLog of itemClickLogs) {
            this.processItemClickLog(itemClickLog, analysis);
        }
        this.computeFrequencies(analysis);
        return analysis;
    }
    static splitItemsByStatsAvailability(items, analysis) {
        let itemsWithStats = [];
        let itemsWithoutStats = [];
        for (let item of items) {
            let itemID = item.id;
            if (analysis.itemStats.has(itemID)) {
                itemsWithStats.push(item);
            }
            else {
                itemsWithoutStats.push(item);
            }
        }
        return {
            withStats: itemsWithStats,
            withoutStats: itemsWithoutStats
        };
    }
    static splitItemGroupsByStatsAvailability(groups, analysis) {
        let groupsWithStats = [];
        let groupsWithoutStats = [];
        for (let group of groups) {
            let groupID = group.id;
            if (analysis.groupStats.has(groupID)) {
                groupsWithStats.push(group);
            }
            else {
                groupsWithoutStats.push(group);
            }
        }
        return {
            withStats: groupsWithStats,
            withoutStats: groupsWithoutStats
        };
    }
}
exports.ItemClicksAnalyser = ItemClicksAnalyser;

},{"../Utilities":3,"./DataAnalyserModule":27}],32:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DataAnalyserModule_1 = require("./DataAnalyserModule");
class PageVisitsAnalyser extends DataAnalyserModule_1.DataAnalyserModule {
    constructor(database) {
        super(database);
    }
    createPageVisitsAnalysis() {
        return {
            totalNbVisits: 0,
            nbUniquePages: 0,
            pageStats: new Map(),
            currentEventIndex: this.database.getItemClickLogsCurrentIndex()
        };
    }
    createPageStats() {
        return {
            nbVisits: 0,
            visitFrequency: 0,
            timestamps: [],
            firstVisitTimestamp: Number.MAX_SAFE_INTEGER,
            lastVisitTimestamp: 0,
            visitDurations: [],
            totalVisitDuration: 0,
            eventIndices: []
        };
    }
    makeAnalysisDeepCopy(analysis) {
        return {
            totalNbVisits: analysis.totalNbVisits,
            nbUniquePages: analysis.nbUniquePages,
            pageStats: new Map(analysis.pageStats),
            currentEventIndex: analysis.currentEventIndex
        };
    }
    processPageVisitLog(log, analysis) {
        let pageID = log.pageID;
        let pageHasAlreadyBeenSeen = analysis.pageStats.has(pageID);
        analysis.totalNbVisits += 1;
        if (!pageHasAlreadyBeenSeen) {
            analysis.nbUniquePages += 1;
        }
        if (!pageHasAlreadyBeenSeen) {
            analysis.pageStats.set(pageID, this.createPageStats());
        }
        let pageStats = analysis.pageStats.get(pageID);
        pageStats.nbVisits += 1;
        let timestamp = log.timestamp;
        pageStats.timestamps.push(timestamp);
        pageStats.firstVisitTimestamp = Math.min(timestamp, pageStats.firstVisitTimestamp);
        pageStats.lastVisitTimestamp = Math.max(timestamp, pageStats.lastVisitTimestamp);
        let duration = log.duration;
        pageStats.visitDurations.push(duration);
        pageStats.totalVisitDuration += duration;
        pageStats.eventIndices.push(log.index);
    }
    computeFrequencies(analysis) {
        for (let pageStats of analysis.pageStats.values()) {
            pageStats.visitFrequency = pageStats.nbVisits / analysis.totalNbVisits;
        }
    }
    computeAnalysis() {
        let pageVisitLogs = this.database.getPageVisitLogs();
        let analysis = this.createPageVisitsAnalysis();
        for (let pageVisitLog of pageVisitLogs) {
            this.processPageVisitLog(pageVisitLog, analysis);
        }
        this.computeFrequencies(analysis);
        return analysis;
    }
}
exports.PageVisitsAnalyser = PageVisitsAnalyser;

},{"./DataAnalyserModule":27}],33:[function(require,module,exports){
(function (global){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const $ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);
exports.NO_SELECTOR = Symbol("No selector");
function isSelector(candidate) {
    let type = $.type(candidate);
    if (type === "object") {
        return candidate instanceof jQuery
            || candidate instanceof Element;
    }
    return type === "string";
}
exports.isSelector = isSelector;
class AdaptiveElement {
    constructor(node, selector = exports.NO_SELECTOR, parent = null) {
        this.node = node;
        this.selector = selector;
        this.parent = parent;
        this.id = this.getID();
        this.tagWithType();
    }
    tag(name, value) {
        this.node.attr(AdaptiveElement.TAG_PREFIX + name, value);
    }
    getTag(name) {
        return AdaptiveElement.getNodeTag(this.node, name);
    }
    tagWithType() {
        this.tag("type", this.getType());
    }
    getSelector() {
        return AdaptiveElement.nodeToSelector(this.node);
    }
    getID() {
        return this.getType() + "/" + this.getSelector();
    }
    static getNodeTag(node, name) {
        return node.attr(AdaptiveElement.TAG_PREFIX + name);
    }
    static nodeToSelector(node) {
        if ((!node) || node.length === 0) {
            return "";
        }
        if (node.is("body") || node.is("html")) {
            return node.prop("tagName");
        }
        let id = node.attr("id");
        if (id && id.length > 0) {
            return `#${id}`;
        }
        let tag = node.prop("tagName");
        let index = node.index();
        return AdaptiveElement.nodeToSelector(node.parent()) + ` > ${tag}:eq(${index})`;
    }
}
AdaptiveElement.TAG_PREFIX = "data-awm-";
exports.AdaptiveElement = AdaptiveElement;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],34:[function(require,module,exports){
(function (global){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const $ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);
const AdaptiveElement_1 = require("./AdaptiveElement");
const Utilities_1 = require("../Utilities");
const Reorder_1 = require("../adaptations/techniques/Reorder");
class Item extends AdaptiveElement_1.AdaptiveElement {
    constructor(node, selector, parent) {
        super(node, selector, parent);
        this.canBeReordered = true;
        if (node.hasClass(Reorder_1.Reorder.NON_REORDERABLE_ELEMENT_CLASS)) {
            this.canBeReordered = false;
        }
    }
    getType() {
        return Item.ELEMENT_TYPE;
    }
    findLinkNodes(pageID) {
        let linkNodes = this.node.find("a");
        if (this.node.is("a")) {
            linkNodes = linkNodes.add(this.node);
        }
        if (pageID !== undefined) {
            linkNodes = linkNodes.filter((_, element) => {
                let href = $(element).attr("href");
                return Utilities_1.Utilities.isLinkMatchingPageID(href, pageID);
            });
        }
        return linkNodes;
    }
    static splitAllByGroup(items) {
        let itemsSplitByGroup = new Map();
        for (let item of items) {
            let group = item.parent;
            if (itemsSplitByGroup.has(group)) {
                itemsSplitByGroup.get(group)
                    .push(item);
            }
            else {
                itemsSplitByGroup.set(group, [item]);
            }
        }
        return [...itemsSplitByGroup.values()];
    }
    static fromSelector(selector, parent) {
        let node = parent.node.find(selector);
        return new Item(node, selector, parent);
    }
}
Item.AWM_CLASS = "awm-item";
Item.ELEMENT_TYPE = "item";
exports.Item = Item;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../Utilities":3,"../adaptations/techniques/Reorder":17,"./AdaptiveElement":33}],35:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AdaptiveElement_1 = require("./AdaptiveElement");
const Item_1 = require("./Item");
const Reorder_1 = require("../adaptations/techniques/Reorder");
class ItemGroup extends AdaptiveElement_1.AdaptiveElement {
    constructor(node, selector, parent, items = []) {
        super(node, selector, parent);
        this.items = items;
        this.canBeReordered = true;
        if (node.hasClass(Reorder_1.Reorder.NON_REORDERABLE_ELEMENT_CLASS)) {
            this.canBeReordered = false;
        }
    }
    getType() {
        return ItemGroup.ELEMENT_TYPE;
    }
    fillUsingItemSelector(itemSelector) {
        let self = this;
        this.node
            .find(itemSelector)
            .each((_, element) => {
            self.items.push(Item_1.Item.fromSelector(element, self));
        });
        this.updateItemsReorderingConstraints();
    }
    isAlphabeticallySorted() {
        let itemLabels = this.items.map((item) => {
            return item.node.text();
        });
        let nbLabels = itemLabels.length;
        const localeCompareOptions = {
            usage: "sort",
            sensitivity: "base",
            ignorePunctuation: true,
            numeric: true
        };
        return itemLabels.every((label, index) => {
            if (index === nbLabels - 1) {
                return true;
            }
            return label.localeCompare(itemLabels[index + 1], localeCompareOptions) < 0;
        });
    }
    updateItemsReorderingConstraints() {
        let notAlphabeticallySorted = !this.isAlphabeticallySorted();
        for (let item of this.items) {
            item.canBeReordered = item.canBeReordered
                ? notAlphabeticallySorted
                : false;
        }
    }
    static fromSelectors(groupSelector, itemSelector, parent) {
        let node = groupSelector === AdaptiveElement_1.NO_SELECTOR
            ? parent.node
            : parent.node.find(groupSelector);
        let group = new ItemGroup(node, groupSelector, parent);
        group.fillUsingItemSelector(itemSelector);
        return group;
    }
}
ItemGroup.AWM_CLASS = "awm-group";
ItemGroup.ELEMENT_TYPE = "group";
exports.ItemGroup = ItemGroup;

},{"../adaptations/techniques/Reorder":17,"./AdaptiveElement":33,"./Item":34}],36:[function(require,module,exports){
(function (global){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const $ = (typeof window !== "undefined" ? window['jQuery'] : typeof global !== "undefined" ? global['jQuery'] : null);
const AdaptiveElement_1 = require("./AdaptiveElement");
const ItemGroup_1 = require("./ItemGroup");
class Menu extends AdaptiveElement_1.AdaptiveElement {
    constructor(node, selector, groups = []) {
        super(node, selector);
        this.groups = groups;
    }
    getType() {
        return Menu.ELEMENT_TYPE;
    }
    getAllItems() {
        let items = [];
        for (let group of this.groups) {
            items = items.concat(group.items);
        }
        return items;
    }
    getAllItemNodes() {
        return this
            .getAllItems()
            .map((item) => {
            return item.node;
        });
    }
    fillUsingGenericItemSelector(itemSelector) {
        this.groups.push(ItemGroup_1.ItemGroup.fromSelectors(AdaptiveElement_1.NO_SELECTOR, itemSelector, this));
    }
    fillUsingGenericGroupAndItemSelectors(groupSelector, itemSelector) {
        let groupNodes = this.node.is(groupSelector)
            ? this.node
            : this.node.find(groupSelector);
        groupNodes.each((_, element) => {
            this.groups.push(ItemGroup_1.ItemGroup.fromSelectors(element, itemSelector, this));
        });
    }
    fillUsingSpecificGroupSelectors(descendantSelectors) {
        for (let groupSelector in descendantSelectors) {
            if (descendantSelectors.hasOwnProperty(groupSelector)) {
                let itemSelectors = descendantSelectors[groupSelector];
                this.groups.push(ItemGroup_1.ItemGroup.fromSelectors(groupSelector, itemSelectors, this));
            }
        }
    }
    static getAllMenusItems(menus) {
        let allMenusItems = [];
        for (let menu of menus) {
            allMenusItems = allMenusItems.concat(menu.getAllItems());
        }
        return allMenusItems;
    }
    static getAllMenusGroups(menus) {
        let allMenusGroups = [];
        for (let menu of menus) {
            allMenusGroups = allMenusGroups.concat(menu.groups);
        }
        return allMenusGroups;
    }
    static fromSelectors(menuSelector, selector2, selector3) {
        let node = $(menuSelector);
        let menu = new Menu(node, menuSelector);
        if (selector3 === undefined) {
            if (AdaptiveElement_1.isSelector(selector2)) {
                menu.fillUsingGenericItemSelector(selector2);
            }
            else {
                menu.fillUsingSpecificGroupSelectors(selector2);
            }
        }
        else {
            menu.fillUsingGenericGroupAndItemSelectors(selector2, selector3);
        }
        return menu;
    }
}
Menu.AWM_CLASS = "awm-menu";
Menu.ELEMENT_TYPE = "menu";
exports.Menu = Menu;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./AdaptiveElement":33,"./ItemGroup":35}],37:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Menu_1 = require("./Menu");
const AdaptiveElement_1 = require("./AdaptiveElement");
class MenuManager {
    constructor(menus = []) {
        this.menus = menus;
    }
    getAllItems() {
        return Menu_1.Menu.getAllMenusItems(this.menus);
    }
    getNbItems() {
        return this.getAllItems().length;
    }
    getAllGroups() {
        return Menu_1.Menu.getAllMenusGroups(this.menus);
    }
    getNbGroups() {
        return this.getAllGroups().length;
    }
    getAllMenus() {
        return this.menus;
    }
    getNbMenus() {
        return this.getAllMenus().length;
    }
    addMenu(menu) {
        this.menus.push(menu);
    }
    removeMenu(id) {
        let removalIndex = this.menus.findIndex((menu) => {
            return menu.id === id;
        });
        if (removalIndex === -1) {
            return null;
        }
        return this.menus.splice(removalIndex, 1)[0];
    }
    static fromGenericMenuAndItemSelectors(menuSelector, itemSelector) {
        let menus = [];
        $(menuSelector).each((_, element) => {
            menus.push(Menu_1.Menu.fromSelectors(element, itemSelector));
        });
        return new MenuManager(menus);
    }
    static fromGenericMenuGroupAndItemSelectors(menuSelector, groupSelector, itemSelector) {
        let menus = [];
        $(menuSelector).each((_, element) => {
            menus.push(Menu_1.Menu.fromSelectors(element, groupSelector, itemSelector));
        });
        return new MenuManager(menus);
    }
    static fromSpecificSelectors(selectors) {
        let menus = [];
        for (let menuSelector in selectors) {
            if (selectors.hasOwnProperty(menuSelector)) {
                let descendantSelector = selectors[menuSelector];
                if (AdaptiveElement_1.isSelector(descendantSelector)) {
                    menus.push(Menu_1.Menu.fromSelectors(menuSelector, descendantSelector));
                }
                else {
                    descendantSelector = descendantSelector;
                    menus.push(Menu_1.Menu.fromSelectors(menuSelector, descendantSelector));
                }
            }
        }
        return new MenuManager(menus);
    }
}
exports.MenuManager = MenuManager;

},{"./AdaptiveElement":33,"./Menu":36}]},{},[25]);
