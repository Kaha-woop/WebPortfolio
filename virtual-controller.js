const PLAYTRON_NOTE_MAP = {
    leaf: { label: "Leaf", note: 60, key: "q" },
    stone: { label: "Stone", note: 62, key: "w" },
    shell: { label: "Shell", note: 64, key: "e" },
    glass: { label: "Glass", note: 65, key: "r" },
    lemon: { label: "Lemon", note: 67, key: "t" },
    flower: { label: "Flower", note: 69, key: "y" },
    feather: { label: "Feather", note: 71, key: "u" },
    wood: { label: "Wood", note: 72, key: "i" },
};

const SIMULATOR_VELOCITY = 100;
const activeSoundNotes = new Set();
const soundVoices = new Map();

function setupVirtualController() {
    const padContainer = document.querySelector("#playtron-pads");
    const energySlider = document.querySelector("#energy-control");
    const energyOutput = document.querySelector("#energy-value");
    const lastEventOutput = document.querySelector("#last-midi-event");

    if (padContainer === null || energySlider === null || energyOutput === null || lastEventOutput === null) {
        throw new Error("Playtron simulator controls are missing from index.html");
    }

    const keyToPad = new Map();
    const pads = new Map();
    padContainer.replaceChildren();

    for (const [id, mapping] of Object.entries(PLAYTRON_NOTE_MAP)) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "touch-pad";
        button.dataset.pad = id;
        button.setAttribute("aria-label", `${mapping.label}, note ${mapping.note}, keyboard key ${mapping.key}`);
        button.textContent = mapping.key.toUpperCase();
        padContainer.append(button);

        const pad = { button, mapping, activeSources: new Set() };
        pads.set(id, pad);
        keyToPad.set(mapping.key.toLowerCase(), pad);

        const press = (source) => {
            if (pad.activeSources.has(source)) {
                return;
            }
            const wasInactive = pad.activeSources.size === 0;
            pad.activeSources.add(source);
            pad.button.classList.add("is-active");
            if (wasInactive) {
                noteOn(mapping.note, SIMULATOR_VELOCITY);
            }
        };

        const release = (source) => {
            if (!pad.activeSources.delete(source) || pad.activeSources.size > 0) {
                return;
            }
            pad.button.classList.remove("is-active");
            noteOff(mapping.note);
        };

        pad.press = press;
        pad.release = release;

        button.addEventListener("pointerdown", (event) => {
            if (event.button !== 0) {
                return;
            }
            event.preventDefault();
            press("pointer");
            button.setPointerCapture(event.pointerId);
        });
        button.addEventListener("pointerup", () => release("pointer"));
        button.addEventListener("pointercancel", () => release("pointer"));
        button.addEventListener("lostpointercapture", () => release("pointer"));
        button.addEventListener("keydown", (event) => {
            if ((event.key === " " || event.key === "Enter") && !event.repeat) {
                event.preventDefault();
                press("button-key");
            }
        });
        button.addEventListener("keyup", (event) => {
            if (event.key === " " || event.key === "Enter") {
                event.preventDefault();
                release("button-key");
            }
        });
        button.addEventListener("blur", () => release("button-key"));
    }

    window.addEventListener("keydown", (event) => {
        if (event.target instanceof HTMLElement && event.target.closest("input, textarea, select, [contenteditable='true']")) {
            return;
        }
        const pad = keyToPad.get(event.key.toLowerCase());
        if (pad !== undefined && !event.repeat) {
            event.preventDefault();
            pad.press("keyboard");
        }
    });

    window.addEventListener("keyup", (event) => {
        const pad = keyToPad.get(event.key.toLowerCase());
        if (pad !== undefined) {
            event.preventDefault();
            pad.release("keyboard");
        }
    });

    window.addEventListener("blur", () => {
        for (const pad of pads.values()) {
            for (const source of pad.activeSources) {
                pad.release(source);
            }
        }
    });

    energySlider.addEventListener("input", () => setControlValue(Number(energySlider.value)));
    setControlValue(Number(energySlider.value));
}

document.addEventListener("DOMContentLoaded", setupVirtualController);

function noteOn(note, velocity) {
    if (!Number.isInteger(velocity) || velocity < 0 || velocity > 127) {
        throw new RangeError("simulator velocity must be an integer from 0 to 127");
    }
    handleInputEvent(makeNoteEvent(note, "on", velocity / 127));
    activeSoundNotes.add(note);
    startNoteSound(note);
    showNoteEvent("Note On", note, velocity);
}

function noteOff(note) {
    handleInputEvent(makeNoteEvent(note, "off"));
    activeSoundNotes.delete(note);
    releaseNoteSound(note);
    showNoteEvent("Note Off", note);
}

function controlChange(controller, value) {
    if (!Number.isInteger(value) || value < 0 || value > 127) {
        throw new RangeError("MIDI control value must be an integer from 0 to 127");
    }

    const normalizedValue = value / 127;
    handleInputEvent(makeControlEvent(controller, normalizedValue));

    if (controller === 1) {
        const slider = document.querySelector("#energy-control");
        const output = document.querySelector("#energy-value");
        if (slider !== null) {
            slider.value = String(normalizedValue);
        }
        if (output !== null) {
            output.value = normalizedValue.toFixed(2);
            output.textContent = normalizedValue.toFixed(2);
        }
    }

    const lastEventOutput = document.querySelector("#last-midi-event");
    if (lastEventOutput !== null) {
        lastEventOutput.textContent = `Control Change ${controller}: ${value} (${normalizedValue.toFixed(2)})`;
    }
}

function startNoteSound(note) {
    if (typeof userStartAudio !== "function" || typeof p5.Oscillator !== "function") {
        setAudioStatus("Audio is unavailable in this browser.");
        return;
    }

    Promise.resolve(userStartAudio()).then(() => {
        if (!activeSoundNotes.has(note) || soundVoices.has(note)) {
            return;
        }

        const oscillator = new p5.Oscillator("sine");
        oscillator.freq(midiToFreq(note));
        oscillator.amp(0);
        oscillator.start();
        oscillator.amp(0.055, 0.12);
        soundVoices.set(note, oscillator);
        setAudioStatus("Soft tones are on.");
    }).catch(() => {
        activeSoundNotes.delete(note);
        setAudioStatus("Audio could not start. Try touching an object again.");
    });
}

function releaseNoteSound(note) {
    const oscillator = soundVoices.get(note);
    if (oscillator === undefined) {
        return;
    }

    oscillator.amp(0, 0.35);
    soundVoices.delete(note);
    window.setTimeout(() => oscillator.stop(), 450);
}

function setAudioStatus(message) {
    const output = document.querySelector("#audio-status");
    if (output !== null) {
        output.textContent = message;
    }
}

function showNoteEvent(type, note, velocity) {
    const mapping = Object.values(PLAYTRON_NOTE_MAP).find((entry) => entry.note === note);
    const label = mapping === undefined ? `Note ${note}` : mapping.label;
    const output = document.querySelector("#last-midi-event");
    if (output !== null) {
        const velocityText = velocity === undefined ? "" : `, velocity ${velocity}`;
        output.textContent = `${type}: ${label} (${note})${velocityText}`;
    }
}

function setControlValue(value) {
    handleInputEvent(makeControlEvent(1, value));
    const slider = document.querySelector("#energy-control");
    const output = document.querySelector("#energy-value");
    const lastEventOutput = document.querySelector("#last-midi-event");
    if (slider !== null) {
        slider.value = String(value);
    }
    if (output !== null) {
        output.value = value.toFixed(2);
        output.textContent = value.toFixed(2);
    }
    if (lastEventOutput !== null) {
        lastEventOutput.textContent = `Control Change 1: ${Math.round(value * 127)} (${value.toFixed(2)})`;
    }
}
