const artworkState = {
    energy: 0.5,
    heldNotes: new Map(),
    noteVisuals: []
};

function validateMidiNumber(value, name) {
    if (!Number.isInteger(value) || value < 0 || value > 127) {
        throw new RangeError(`${name} must be an integer from 0 to 127`);
    }
}

function validateNormalizedValue(value, name) {
    if (typeof value !== "number" || !Number.isFinite(value) || value < 0 || value > 1) {
        throw new RangeError(`${name} must be a finite number from 0 to 1`);
    }
}

function makeNoteEvent(note, state, velocity = 1) {
    validateMidiNumber(note, "note");
    if (state !== "on" && state !== "off") {
        throw new TypeError('note state must be "on" or "off"');
    }

    if (state === "off") {
        return { type: "note", note, state };
    }

    validateNormalizedValue(velocity, "velocity");
    return { type: "note", note, state, velocity };
}

function makeControlEvent(controller, value) {
    validateMidiNumber(controller, "controller");
    validateNormalizedValue(value, "control value");
    return { type: "control", controller, value };
}

function handleInputEvent(event) {
    if (event === null || typeof event !== "object") {
        throw new TypeError("input event must be an object");
    }

    if (event.type === "note") {
        validateMidiNumber(event.note, "note");

        if (event.state === "on") {
            validateNormalizedValue(event.velocity, "velocity");
            artworkState.heldNotes.set(event.note, event.velocity);
            const previousVisual = [...artworkState.noteVisuals].reverse()
                .find((visual) => visual.note === event.note && visual.releasedAt === null);
            if (previousVisual !== undefined) {
                previousVisual.releasedAt = performance.now();
            }
            artworkState.noteVisuals.push({
                note: event.note,
                velocity: event.velocity,
                startedAt: performance.now(),
                releasedAt: null
            });
            return;
        }

        if (event.state === "off") {
            artworkState.heldNotes.delete(event.note);
            const activeVisual = [...artworkState.noteVisuals].reverse()
                .find((visual) => visual.note === event.note && visual.releasedAt === null);
            if (activeVisual !== undefined) {
                activeVisual.releasedAt = performance.now();
            }
            return;
        }

        throw new TypeError('note state must be "on" or "off"');
    }

    if (event.type === "control") {
        validateMidiNumber(event.controller, "controller");
        validateNormalizedValue(event.value, "control value");
        if (event.controller === 1) {
            artworkState.energy = event.value;
        }
        return;
    }

    throw new TypeError('input event type must be "note" or "control"');
}

function getArtworkState() {
    const now = performance.now();
    artworkState.noteVisuals = artworkState.noteVisuals.filter((visual) =>
        visual.releasedAt === null || now - visual.releasedAt < 5000
    );

    return {
        energy: artworkState.energy,
        heldNotes: Array.from(artworkState.heldNotes, ([note, velocity]) => ({ note, velocity })),
        noteVisuals: artworkState.noteVisuals.map((visual) => ({ ...visual }))
    };
}
