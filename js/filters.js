function initializeSpecimenFilters({ projects, moths, searchInput, tagList, logicToggle, resultsOutput, archive }) {
    if (
        searchInput === null ||
        tagList === null ||
        logicToggle === null ||
        resultsOutput === null ||
        archive === null
    ) {
        throw new Error("The specimen classification panel is missing a required element.");
    }

    const selectedTags = new Set();
    const allTags = [...new Set(projects.flatMap((project) => project.tags))]
        .sort((first, second) => first.localeCompare(second));
    const tagButtons = new Map();
    let requireAllTags = false;

    allTags.forEach((tag) => {
        const button = document.createElement("button");
        button.className = "tag-filter";
        button.type = "button";
        button.textContent = `#${tag.replace(/\s+/g, "")}`;
        button.setAttribute("aria-label", `Filter by ${tag}`);
        button.setAttribute("aria-pressed", "false");
        button.addEventListener("click", () => {
            if (selectedTags.has(tag)) {
                selectedTags.delete(tag);
            } else {
                selectedTags.add(tag);
            }
            button.setAttribute("aria-pressed", String(selectedTags.has(tag)));
            apply();
        });
        tagButtons.set(tag, button);
        tagList.append(button);
    });

    function matchesProject(project, query) {
        const tagText = project.tags.flatMap((tag) => [tag, tag.replace(/\s+/g, "")]).join(" ");
        const text = `${project.title} ${project.description} ${project.year} ${tagText}`.toLowerCase();
        if (query.length > 0 && !text.includes(query)) {
            return false;
        }

        if (selectedTags.size === 0) {
            return true;
        }

        const matchingTagCount = project.tags.filter((tag) => selectedTags.has(tag)).length;
        return requireAllTags
            ? matchingTagCount === selectedTags.size
            : matchingTagCount > 0;
    }

    function apply() {
        const query = searchInput.value.trim().toLowerCase();
        const filtersAreActive = query.length > 0 || selectedTags.size > 0;
        const matchingIds = new Set(
            projects.filter((project) => matchesProject(project, query)).map((project) => project.id)
        );

        moths.forEach((moth) => {
            if (!moth.isConnected) {
                return;
            }

            const matches = matchingIds.has(moth.dataset.projectId);
            moth.classList.toggle("is-filtered-out", !matches);
            moth.classList.toggle("is-filter-match", matches && filtersAreActive);
            moth.setAttribute("aria-disabled", String(!matches));
            moth.tabIndex = matches ? 0 : -1;
            if (!matches && document.activeElement === moth) {
                searchInput.focus();
            }
        });

        archive.querySelectorAll(".specimen-entry").forEach((entry) => {
            entry.hidden = !matchingIds.has(entry.dataset.projectId);
        });

        resultsOutput.textContent = `${matchingIds.size} ${matchingIds.size === 1 ? "specimen" : "specimens"} match`;
    }

    function clear() {
        searchInput.value = "";
        selectedTags.clear();
        requireAllTags = false;
        logicToggle.checked = false;
        tagButtons.forEach((button) => button.setAttribute("aria-pressed", "false"));
        apply();
    }

    searchInput.addEventListener("input", apply);
    logicToggle.addEventListener("change", () => {
        requireAllTags = logicToggle.checked;
        apply();
    });

    return { apply, clear };
}
