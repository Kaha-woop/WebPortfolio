const MIDI_DEVICE_MAP = {
    notes: {
        // Map incoming note numbers to artwork notes here, for example: 36: 60
    },
    controls: {
        1: 1
    }
};

function setupMIDIController() {
    const connectButton = document.querySelector("#connect-midi");
    const inputSelect = document.querySelector("#midi-input-select");
    const statusOutput = document.querySelector("#midi-status");

    if (connectButton === null || inputSelect === null || statusOutput === null) {
        throw new Error("MIDI connection controls are missing from index.html");
    }

    let midiAccess = null;
    let activeInput = null;
    let messageHandler = null;

    const setStatus = (message) => {
        statusOutput.textContent = message;
    };

    const detachInput = () => {
        if (activeInput !== null && messageHandler !== null) {
            activeInput.removeEventListener("midimessage", messageHandler);
        }
        activeInput = null;
        messageHandler = null;
    };

    const listenToSelectedInput = () => {
        detachInput();
        if (midiAccess === null || inputSelect.value === "") {
            return;
        }

        const input = midiAccess.inputs.get(inputSelect.value);
        if (input === undefined) {
            setStatus("The selected MIDI input is no longer available.");
            return;
        }

        activeInput = input;
        messageHandler = (event) => receiveMIDIMessage(event, input.name);
        input.addEventListener("midimessage", messageHandler);
        setStatus(`Listening to ${input.name || "MIDI input"}.`);
    };

    const refreshInputs = () => {
        if (midiAccess === null) {
            return;
        }

        const previousInputId = inputSelect.value;
        const inputs = Array.from(midiAccess.inputs.values());
        inputSelect.replaceChildren();

        for (const input of inputs) {
            const option = document.createElement("option");
            option.value = input.id;
            option.textContent = [input.name || "MIDI input", input.manufacturer]
                .filter(Boolean)
                .join(" - ");
            inputSelect.append(option);
        }

        inputSelect.disabled = inputs.length === 0;
        if (inputs.length === 0) {
            detachInput();
            setStatus("MIDI access is ready, but no input devices are connected.");
            return;
        }

        inputSelect.value = inputs.some((input) => input.id === previousInputId)
            ? previousInputId
            : inputs[0].id;
        listenToSelectedInput();
    };

    inputSelect.addEventListener("change", listenToSelectedInput);
    connectButton.addEventListener("click", async () => {
        if (!("requestMIDIAccess" in navigator)) {
            setStatus("Web MIDI is not supported by this browser.");
            return;
        }

        connectButton.disabled = true;
        setStatus("Requesting MIDI access...");
        try {
            midiAccess = await navigator.requestMIDIAccess();
            midiAccess.onstatechange = refreshInputs;
            refreshInputs();
            if (midiAccess.inputs.size === 0) {
                setStatus("MIDI access is ready, but no input devices are connected.");
            }
        } catch (error) {
            console.error("Could not access MIDI inputs:", error);
            if (error.name === "NotAllowedError" || error.name === "SecurityError") {
                setStatus("MIDI permission was denied. Allow MIDI access in the browser and try again.");
            } else {
                setStatus(`Could not access MIDI inputs: ${error.message}`);
            }
        } finally {
            connectButton.disabled = false;
        }
    });
}

function receiveMIDIMessage(event, inputName) {
    const [status, data1, data2] = event.data;
    console.info(`MIDI from ${inputName || "MIDI input"}:`, Array.from(event.data));

    if (event.data.length < 3) {
        return;
    }

    const messageType = status & 0xf0;
    const incomingNote = data1;
    const mappedNote = Object.prototype.hasOwnProperty.call(MIDI_DEVICE_MAP.notes, incomingNote)
        ? MIDI_DEVICE_MAP.notes[incomingNote]
        : incomingNote;

    if (messageType === 0x90 && data2 > 0) {
        noteOn(mappedNote, data2);
        return;
    }

    if (messageType === 0x80 || (messageType === 0x90 && data2 === 0)) {
        noteOff(mappedNote);
        return;
    }

    if (messageType === 0xb0) {
        const mappedController = MIDI_DEVICE_MAP.controls[data1];
        if (mappedController !== undefined) {
            controlChange(mappedController, data2);
        }
    }
}

document.addEventListener("DOMContentLoaded", setupMIDIController);
