const mothField = document.querySelector(".moth-field");
const keeper = document.querySelector(".keeper");
const collectionNote = document.querySelector(".collection-note");
const collectionButtons = document.querySelectorAll(".collection-link");
const searchToggle = document.querySelector(".search-toggle");
const searchForm = document.querySelector(".search-form");
const searchInput = document.querySelector("#collection-search");
const searchCloseButton = document.querySelector(".classification-close");
const tagFilters = document.querySelector(".tag-filters");
const tagLogicToggle = document.querySelector(".logic-and");
const filterResults = document.querySelector(".filter-results");
const clearFiltersButton = document.querySelector(".clear-filters");
const livingView = document.querySelector("#living-view");
const deadCollectionView = document.querySelector("#dead-collection-view");
const deadCollectionButton = document.querySelector('.collection-link[data-collection="dead"]');
const livingCollectionButton = document.querySelector('.collection-link[data-collection="living"]');
const specimenArchive = document.querySelector(".specimen-archive");
const collectedCount = document.querySelector(".collected-count");
const totalCount = document.querySelector(".total-count");
const resurrectAllButton = document.querySelector(".resurrect-all");
const returnLivingButton = document.querySelector(".return-living");
const projectDialog = document.querySelector(".project-modal");
const projectTitle = document.querySelector("#project-title");
const projectDescription = document.querySelector("#project-description");
const projectMothType = document.querySelector(".archive-moth-type");
const projectYear = document.querySelector(".archive-year");
const projectMedia = document.querySelector(".archive-media");
const mediaCount = document.querySelector(".media-count");
const projectTags = document.querySelector(".archive-tags");
const closeProjectButton = document.querySelector(".archive-close");
const previousMediaButton = document.querySelector(".media-previous");
const nextMediaButton = document.querySelector(".media-next");

if (
    mothField === null ||
    keeper === null ||
    collectionNote === null ||
    searchToggle === null ||
    searchForm === null ||
    searchInput === null ||
    searchCloseButton === null ||
    tagFilters === null ||
    tagLogicToggle === null ||
    filterResults === null ||
    clearFiltersButton === null ||
    livingView === null ||
    deadCollectionView === null ||
    deadCollectionButton === null ||
    livingCollectionButton === null ||
    specimenArchive === null ||
    collectedCount === null ||
    totalCount === null ||
    resurrectAllButton === null ||
    returnLivingButton === null ||
    projectDialog === null ||
    projectTitle === null ||
    projectDescription === null ||
    projectMothType === null ||
    projectYear === null ||
    projectMedia === null ||
    mediaCount === null ||
    projectTags === null ||
    closeProjectButton === null ||
    previousMediaButton === null ||
    nextMediaButton === null
) {
    throw new Error("The portfolio page is missing a required interactive element.");
}

const collectionStorageKey = "moth-collector-collected-projects";
const collectedProjectIds = loadCollectedProjects();
const projectSearchText = (project) =>
    `${project.title} ${project.year} ${project.description} ${project.tags.join(" ")} ${project.tags.map((tag) => tag.replace(/\s+/g, "")).join(" ")} ${project.mothType}`.toLowerCase();
let filterController = null;
let applyProjectFilters = () => {};

function loadCollectedProjects() {
    try {
        const stored = JSON.parse(localStorage.getItem(collectionStorageKey) ?? "[]");
        if (!Array.isArray(stored)) {
            throw new Error("Saved collection data should be an array.");
        }
        const validIds = new Set(projects.map((project) => project.id));
        return new Set(stored.filter((id) => validIds.has(id)));
    } catch (error) {
        console.error("Could not load the saved moth collection:", error);
        return new Set();
    }
}

function saveCollectedProjects() {
    try {
        localStorage.setItem(collectionStorageKey, JSON.stringify([...collectedProjectIds]));
    } catch (error) {
        console.error("Could not save the moth collection:", error);
    }
}

function clearCollectedProjects() {
    try {
        localStorage.removeItem(collectionStorageKey);
        return true;
    } catch (error) {
        console.error("Could not clear the saved moth collection:", error);
        return false;
    }
}

function createMothDrawing() {
    const drawing = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    drawing.setAttribute("class", "moth-drawing");
    drawing.setAttribute("viewBox", "0 0 120 96");
    drawing.setAttribute("aria-hidden", "true");
    drawing.innerHTML = `
        <g class="moth-wing moth-wing-left">
            <path d="M56 45C45 17 20 7 9 16c-7 6-2 23 10 34 10 9 23 12 35 5-6 15-3 27 3 28 7 0 10-13 3-27" fill="#c6ad83" stroke="#382d3d" stroke-width="2.5" stroke-linejoin="round"></path>
            <path d="M57 47C45 27 26 19 17 24c-4 3-1 14 8 22 9 8 19 10 31 5Z" fill="#806b85" stroke="#382d3d" stroke-width="1.5" stroke-linejoin="round"></path>
            <path d="M24 28c6-1 10 2 11 8M23 45c5-2 10 0 12 5" stroke="#cdb990" stroke-width="2" stroke-linecap="round"></path>
            <path d="M45 67c4 4 8 6 13 7" stroke="#d7bb8d" stroke-width="1.5" stroke-linecap="round"></path>
        </g>
        <g class="moth-wing moth-wing-right">
            <path d="M64 45c11-28 36-38 47-29 7 6 2 23-10 34-10 9-23 12-35 5 6 15 3 27-3 28-7 0-10-13-3-27" fill="#c6ad83" stroke="#382d3d" stroke-width="2.5" stroke-linejoin="round"></path>
            <path d="M63 47c12-20 31-28 40-23 4 3 1 14-8 22-9 8-19 10-31 5Z" fill="#806b85" stroke="#382d3d" stroke-width="1.5" stroke-linejoin="round"></path>
            <path d="M96 28c-6-1-10 2-11 8m12 9c-5-2-10 0-12 5" stroke="#cdb990" stroke-width="2" stroke-linecap="round"></path>
            <path d="M75 67c-4 4-8 6-13 7" stroke="#d7bb8d" stroke-width="1.5" stroke-linecap="round"></path>
        </g>
        <g>
            <path d="M57 48c-1-12 0-23 5-32 1-2 4-2 5 0 5 9 6 20 5 32l-2 27c0 4-3 7-6 7s-6-3-6-7l-1-27Z" fill="#3c3042" stroke="#201923" stroke-width="2"></path>
            <path d="M60 17c-4-7-10-10-15-9m24 9c4-7 10-10 15-9" stroke="#3c3042" stroke-width="2" stroke-linecap="round"></path>
            <circle cx="61" cy="48" r="2" fill="#e7d2a6"></circle>
        </g>`;
    return drawing;
}

// Build each specimen from the editable data in projects.js.
const mothButtons = projects.map((project, index) => {
    const moth = document.createElement("button");
    moth.className = "moth";
    moth.type = "button";
    moth.setAttribute("aria-label", `Open project: ${project.title}`);
    moth.title = project.title;
    moth.dataset.projectId = project.id;
    moth.dataset.index = String(index);
    moth.dataset.search = projectSearchText(project);
    moth.dataset.mothType = project.mothType;
    moth.style.setProperty("--moth-hue", `${(index % 4) * 16 - 16}deg`);
    moth.append(createMothDrawing());
    const tooltip = document.createElement("span");
    tooltip.className = "moth-tooltip";
    tooltip.setAttribute("aria-hidden", "true");
    tooltip.textContent = project.title;
    moth.append(tooltip);
    moth.addEventListener("click", () => {
        if (moth.classList.contains("is-filtered-out")) {
            return;
        }
        openProject(project, moth);
    });

    mothField.append(moth);
    return moth;
});

initializeMothFlight(mothButtons);
mothField.addEventListener("mothdeathcomplete", () => {
    if (collectedProjectIds.size === projects.length) {
        keeper.classList.add("is-face-revealed");
    }
});
mothButtons.forEach((moth) => {
    if (collectedProjectIds.has(moth.dataset.projectId)) {
        moth.remove();
    }
});
if (collectedProjectIds.size === projects.length) {
    keeper.classList.add("is-face-revealed");
}

function renderDeadCollection() {
    collectedCount.textContent = String(collectedProjectIds.size);
    totalCount.textContent = String(projects.length);
    specimenArchive.replaceChildren(...projects.map((project, index) => {
        const entry = document.createElement("article");
        entry.className = "specimen-entry";
        entry.dataset.projectId = project.id;
        const specimenNumber = String(index + 1).padStart(2, "0");

        if (collectedProjectIds.has(project.id)) {
            const button = document.createElement("button");
            button.className = "specimen-card is-collected";
            button.type = "button";
            button.setAttribute("aria-label", `Open archived project ${project.title}, ${project.year}, specimen ${specimenNumber}`);
            button.dataset.search = projectSearchText(project);
            button.append(createMothDrawing());

            const details = document.createElement("span");
            details.className = "specimen-details";
            const number = document.createElement("span");
            number.className = "specimen-number";
            number.textContent = `NO. ${specimenNumber}`;
            const title = document.createElement("span");
            title.className = "specimen-title";
            title.textContent = project.title;
            const year = document.createElement("span");
            year.className = "specimen-year";
            year.textContent = String(project.year);
            details.append(number, title, year);
            button.append(details);
            button.addEventListener("click", () => openProject(project, null, button));
            entry.append(button);
        } else {
            const locked = document.createElement("div");
            locked.className = "specimen-card is-locked";
            locked.setAttribute("role", "img");
            locked.setAttribute("aria-label", `Locked, undiscovered specimen ${specimenNumber}`);
            locked.dataset.search = projectSearchText(project);
            locked.append(createMothDrawing());
            const question = document.createElement("span");
            question.className = "specimen-question";
            question.setAttribute("aria-hidden", "true");
            question.textContent = "?";
            locked.append(question);
            const details = document.createElement("span");
            details.className = "specimen-details";
            const number = document.createElement("span");
            number.className = "specimen-number";
            number.textContent = `NO. ${specimenNumber}`;
            const title = document.createElement("span");
            title.className = "specimen-title";
            title.textContent = "Undiscovered";
            const year = document.createElement("span");
            year.className = "specimen-year";
            year.textContent = "—";
            details.append(number, title, year);
            locked.append(details);
            entry.append(locked);
        }

        return entry;
    }));

    applyProjectFilters();
}

renderDeadCollection();
filterController = initializeSpecimenFilters({
    projects,
    moths: mothButtons,
    searchInput,
    tagList: tagFilters,
    logicToggle: tagLogicToggle,
    resultsOutput: filterResults,
    archive: specimenArchive
});
applyProjectFilters = filterController.apply;
filterController.apply();

let activeProject = null;
let activeMedia = [];
let activeMediaIndex = 0;
let mothToRestore = null;
let returnFocusTarget = null;
let pendingFirstView = false;
let closeTimer = 0;
let dialogIsClosing = false;

function openProject(project, moth = null, focusTarget = null) {
    if (projectDialog.open) {
        return;
    }

    clearTimeout(closeTimer);
    activeProject = project;
    activeMediaIndex = 0;
    mothToRestore = moth;
    returnFocusTarget = focusTarget;
    pendingFirstView = moth !== null && !collectedProjectIds.has(project.id);
    if (moth !== null) {
        setMothFlightPaused(moth, true);
    }

    projectTitle.textContent = project.title;
    projectDescription.textContent = project.description;
    projectMothType.textContent = project.mothType;
    projectYear.textContent = String(project.year);
    projectTags.replaceChildren(...project.tags.map((tag) => {
        const item = document.createElement("li");
        item.textContent = tag;
        return item;
    }));

    const imagePaths = project.images.length > 0 ? project.images : [project.thumbnail];
    activeMedia = imagePaths.map((src) => ({ type: "image", src }));
    if (project.video) {
        activeMedia.push({ type: "video", src: project.video });
    }
    renderProjectMedia();

    projectDialog.showModal();
    projectDialog.classList.remove("is-closing");
    requestAnimationFrame(() => projectDialog.classList.add("is-visible"));
    closeProjectButton.focus();
}

function renderProjectMedia() {
    const item = activeMedia[activeMediaIndex];
    if (item === undefined || activeProject === null) {
        throw new Error(`Project "${activeProject?.id ?? "unknown"}" has no media to display.`);
    }

    const previousVideo = projectMedia.querySelector("video");
    if (previousVideo !== null) {
        previousVideo.pause();
    }

    let media;
    if (item.type === "video") {
        media = document.createElement("video");
        media.controls = true;
        media.preload = "metadata";
        media.poster = activeProject.thumbnail;
        media.src = item.src;
        media.setAttribute("aria-label", `${activeProject.title} project video`);
    } else {
        media = document.createElement("img");
        media.src = item.src;
        media.alt = `${activeProject.title} — image ${activeMediaIndex + 1}`;
    }

    projectMedia.replaceChildren(media);
    mediaCount.textContent = `${activeMediaIndex + 1} / ${activeMedia.length}`;
    const hasMultipleMedia = activeMedia.length > 1;
    previousMediaButton.disabled = !hasMultipleMedia;
    nextMediaButton.disabled = !hasMultipleMedia;
}

function changeProjectMedia(direction) {
    if (activeMedia.length < 2) {
        return;
    }

    activeMediaIndex = (activeMediaIndex + direction + activeMedia.length) % activeMedia.length;
    renderProjectMedia();
}

function closeProject() {
    if (!projectDialog.open || dialogIsClosing) {
        return;
    }

    const video = projectMedia.querySelector("video");
    if (video !== null) {
        video.pause();
    }

    dialogIsClosing = true;
    projectDialog.classList.remove("is-visible");
    projectDialog.classList.add("is-closing");
    closeTimer = window.setTimeout(() => {
        projectDialog.close();
        projectDialog.classList.remove("is-closing");
    }, 240);
}

closeProjectButton.addEventListener("click", closeProject);
previousMediaButton.addEventListener("click", () => changeProjectMedia(-1));
nextMediaButton.addEventListener("click", () => changeProjectMedia(1));
projectDialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeProject();
});
projectDialog.addEventListener("close", () => {
    dialogIsClosing = false;
    if (mothToRestore !== null) {
        const moth = mothToRestore;
        if (pendingFirstView && activeProject !== null) {
            collectedProjectIds.add(activeProject.id);
            saveCollectedProjects();
            renderDeadCollection();
            moth.setAttribute("aria-hidden", "true");
            moth.setAttribute("tabindex", "-1");
            beginMothDeath(moth);
            deadCollectionButton.focus();
        } else {
            setMothFlightPaused(moth, false);
            moth.focus();
        }
        mothToRestore = null;
    } else if (returnFocusTarget !== null) {
        returnFocusTarget.focus();
    }
    returnFocusTarget = null;
    pendingFirstView = false;
    activeProject = null;
    activeMedia = [];
});
projectDialog.addEventListener("click", (event) => {
    if (event.target === projectDialog) {
        closeProject();
    }
});
projectDialog.addEventListener("keydown", (event) => {
    if (event.key !== "Tab") {
        return;
    }

    const focusable = [...projectDialog.querySelectorAll(
        'button:not([disabled]), a[href], input:not([disabled]), video[controls], [tabindex]:not([tabindex="-1"])'
    )].filter((element) => element.getClientRects().length > 0);
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
    }
});

const collectionMessages = {
    living: "Living specimens.",
    dead: "Collection.",
    about: "Project archive."
};
let selectedCollection = "living";

collectionButtons.forEach((button) => {
    button.addEventListener("click", () => {
        selectedCollection = button.dataset.collection;
        collectionButtons.forEach((item) => {
            const isSelected = item === button;
            item.classList.toggle("is-selected", isSelected);
            item.setAttribute("aria-pressed", String(isSelected));
        });

        if (selectedCollection === "dead") {
            livingView.hidden = true;
            deadCollectionView.hidden = false;
            mothButtons.forEach((moth) => setMothFlightPaused(moth, true));
            renderDeadCollection();
        } else {
            livingView.hidden = false;
            deadCollectionView.hidden = true;
            mothButtons.forEach((moth) => setMothFlightPaused(moth, false));
            collectionNote.textContent = collectionMessages[selectedCollection];
        }
    });
});

returnLivingButton.addEventListener("click", () => {
    selectedCollection = "living";
    livingView.hidden = false;
    deadCollectionView.hidden = true;
    mothButtons.forEach((moth) => setMothFlightPaused(moth, false));
    collectionButtons.forEach((button) => {
        const isSelected = button.dataset.collection === "living";
        button.classList.toggle("is-selected", isSelected);
        button.setAttribute("aria-pressed", String(isSelected));
    });
    collectionNote.textContent = collectionMessages.living;
    livingCollectionButton.focus();
});

resurrectAllButton.addEventListener("click", () => {
    if (collectedProjectIds.size === 0) {
        return;
    }

    const confirmed = window.confirm("Reset the Collection and return every moth to the character?");
    if (!confirmed) {
        return;
    }

    if (!clearCollectedProjects()) {
        window.alert("The saved collection could not be cleared. Please check this browser's storage settings and try again.");
        return;
    }

    const viewedProjectIds = new Set(collectedProjectIds);
    collectedProjectIds.clear();
    keeper.classList.remove("is-face-revealed");

    mothButtons.forEach((moth) => {
        if (viewedProjectIds.has(moth.dataset.projectId)) {
            mothField.append(moth);
            resurrectMoth(moth);
        } else {
            setMothFlightPaused(moth, false);
        }
    });

    filterController.clear();
    renderDeadCollection();
    selectedCollection = "living";
    livingView.hidden = false;
    deadCollectionView.hidden = true;
    collectionButtons.forEach((button) => {
        const isSelected = button.dataset.collection === "living";
        button.classList.toggle("is-selected", isSelected);
        button.setAttribute("aria-pressed", String(isSelected));
    });
    collectionNote.textContent = collectionMessages.living;
    livingCollectionButton.focus();
});

searchToggle.addEventListener("click", () => {
    const isOpening = searchForm.hidden;
    searchForm.hidden = !isOpening;
    searchToggle.setAttribute("aria-expanded", String(isOpening));

    if (isOpening) {
        searchInput.focus();
    }
});

function closeSearchPanel(restoreFocus = true) {
    searchForm.hidden = true;
    searchToggle.setAttribute("aria-expanded", "false");
    if (restoreFocus) {
        searchToggle.focus();
    }
}

searchCloseButton.addEventListener("click", () => closeSearchPanel());
clearFiltersButton.addEventListener("click", () => {
    filterController.clear();
    searchInput.focus();
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && projectDialog.open) {
        event.preventDefault();
        closeProject();
        return;
    }

    if (event.key === "Escape" && !searchForm.hidden) {
        event.preventDefault();
        closeSearchPanel();
    }
});
