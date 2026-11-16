const PREVIEW_DEBOUNCE_MS = 200;

// matches a full edit link or just its "id/key" ending
const EDIT_LINK = /(?:^|\/)([a-z0-9]+)\/([0-9a-f]+)\/?$/i;

function sendJson(url, method, body, headers = {}) {
    return fetch(url, {
        method,
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify(body),
    });
}

async function errorMessage(response) {
    const body = await response.json().catch(() => null);
    return body?.error ?? `request failed (${response.status})`;
}

const authorization = (token) => ({ Authorization: `Bearer ${token}` });

const editPath = (id, token) => `/edit/${id}/${token}`;

async function canEdit(id, token) {
    const response = await fetch(`/api/counters/${id}/access`, {
        headers: authorization(token),
    });
    return response.ok && (await response.json()).canEdit;
}

function initHomePage() {
    const createButton = document.querySelector("#create-counter");
    const createStatus = document.querySelector("#create-status");
    const openForm = document.querySelector("#open-counter-form");
    const openStatus = document.querySelector("#open-status");

    createButton.addEventListener("click", async () => {
        createButton.disabled = true;
        createStatus.textContent = "";
        const response = await sendJson("/api/counters", "POST", {});
        if (!response.ok) {
            createStatus.textContent = await errorMessage(response);
            createButton.disabled = false;
            return;
        }
        const { id, token } = await response.json();
        location.href = editPath(id, token);
    });

    openForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        openStatus.textContent = "";
        const match = openForm.elements.reference.value.trim().match(EDIT_LINK);
        if (!match) {
            openStatus.textContent = "That does not look like an edit link.";
            return;
        }
        const [, id, token] = match;
        if (await canEdit(id, token)) location.href = editPath(id, token);
        else openStatus.textContent = "No counter found for that edit link.";
    });
}

function initEditPage() {
    const form = document.querySelector("#counter-form");
    const preview = document.querySelector("#preview");
    const status = document.querySelector("#status");
    const submitButton = form.querySelector('button[type="submit"]');
    const cssField = form.elements.css;
    const resetButton = document.querySelector("#reset-css");
    const resetStatus = document.querySelector("#reset-status");
    const counterId = document.body.dataset.counterId;
    const editToken = location.pathname.split("/").filter(Boolean).pop();

    let previewTimer;
    let previewUrl;
    let countWasEdited = false;
    let selectedTheme = form.elements.theme.value;

    const themeInput = (name) =>
        form.querySelector(`input[name="theme"][value="${CSS.escape(name)}"]`);

    const themeCss = (name) => themeInput(name).dataset.css;

    function hasCustomCss() {
        const css = cssField.value.trim();
        return css !== "" && css !== themeCss(selectedTheme).trim();
    }

    function useThemeCss() {
        cssField.value = themeCss(selectedTheme);
        resetButton.hidden = true;
    }

    function changeTheme(input) {
        const keepCustomCss =
            hasCustomCss() &&
            !confirm(
                "You have made custom changes. They will be overwritten. Continue?",
            );
        if (keepCustomCss) {
            const previousInput = themeInput(selectedTheme);
            previousInput.checked = true;
            // arrow keys move focus along with the selection
            previousInput.focus();
            return;
        }
        selectedTheme = input.value;
        useThemeCss();
    }

    function readForm() {
        const data = new FormData(form);
        return {
            theme: data.get("theme"),
            css: data.get("css"),
            minDigits: Number(data.get("minDigits")),
            count: Number(data.get("count")),
        };
    }

    function fillForm(counter) {
        const savedThemeInput = themeInput(counter.theme);
        if (savedThemeInput) {
            savedThemeInput.checked = true;
            selectedTheme = counter.theme;
        }
        form.elements.minDigits.value = counter.minDigits;
        form.elements.count.value = counter.count;
        cssField.value = counter.css || themeCss(selectedTheme);
        resetButton.hidden = !hasCustomCss();
        if (hasCustomCss()) form.querySelector("details").open = true;
    }

    async function refreshPreview() {
        const response = await sendJson("/api/preview", "POST", readForm());
        if (!response.ok) return;
        const nextUrl = URL.createObjectURL(await response.blob());
        preview.src = nextUrl;
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        previewUrl = nextUrl;
    }

    function schedulePreview() {
        clearTimeout(previewTimer);
        previewTimer = setTimeout(refreshPreview, PREVIEW_DEBOUNCE_MS);
    }

    async function saveCounter() {
        const { count, ...config } = readForm();
        // an untouched theme is saved as empty css so it keeps following the theme
        if (!hasCustomCss()) config.css = "";
        // sending an untouched count would overwrite hits that arrived while editing
        const changes = countWasEdited ? { ...config, count } : config;
        const response = await sendJson(
            `/api/counters/${counterId}`,
            "PUT",
            changes,
            authorization(editToken),
        );
        if (!response.ok) throw new Error(await errorMessage(response));
        countWasEdited = false;
        return "Saved.";
    }

    async function loadCounter() {
        document.querySelector("#embed-code").value =
            `<a href="${location.origin}/"><img src="${location.origin}/c/${counterId}.svg" alt="visitor counter"></a>`;
        document.querySelector("#edit-link").value = location.href;

        const response = await fetch(`/api/counters/${counterId}`);
        if (!response.ok) {
            status.textContent = await errorMessage(response);
            return;
        }
        fillForm(await response.json());
        refreshPreview();
    }

    form.addEventListener("input", (event) => {
        if (event.target.name === "count") countWasEdited = true;
        if (event.target.name === "theme") changeTheme(event.target);
        resetButton.hidden = !hasCustomCss();
        status.textContent = "";
        // an unchanged live region would stay silent on the next reset
        resetStatus.textContent = "";
        schedulePreview();
    });

    resetButton.addEventListener("click", () => {
        if (
            !confirm(
                "You have made custom changes. They will be removed. Continue?",
            )
        )
            return;
        useThemeCss();
        cssField.focus();
        resetStatus.textContent = "Custom changes removed.";
        schedulePreview();
    });

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        submitButton.disabled = true;
        status.textContent = "";
        try {
            status.textContent = await saveCounter();
        } catch (error) {
            status.textContent = error.message;
        } finally {
            submitButton.disabled = false;
        }
    });

    for (const field of document.querySelectorAll(".copyable")) {
        field.addEventListener("focus", () => field.select());
    }

    loadCounter();
}

const page = document.body.dataset.page;
if (page === "home") initHomePage();
if (page === "edit") initEditPage();
