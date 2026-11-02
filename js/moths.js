// Resting positions use percentages of the character's configurable face area.
const mothClusterSettings = [
    { x: 20, y: 29, scale: 1.08, rotation: -13, wingDuration: 0.72 },
    { x: 46, y: 19, scale: 0.91, rotation: 8, wingDuration: 0.84 },
    { x: 76, y: 28, scale: 1.12, rotation: -7, wingDuration: 0.68 },
    { x: 31, y: 49, scale: 0.94, rotation: 14, wingDuration: 0.91 },
    { x: 58, y: 43, scale: 1.16, rotation: -5, wingDuration: 0.77 },
    { x: 83, y: 53, scale: 0.9, rotation: 11, wingDuration: 0.88 },
    { x: 39, y: 75, scale: 1.1, rotation: -9, wingDuration: 0.74 },
    { x: 68, y: 73, scale: 0.96, rotation: 6, wingDuration: 0.82 }
];

const mothFlightStates = new WeakMap();
const mothDeathTimers = new WeakMap();
const mothDeathParticles = new WeakMap();

function setMothFlightPaused(moth, paused) {
    const state = mothFlightStates.get(moth);
    if (state === undefined) {
        throw new Error("Cannot pause flight for a moth that has not been initialized.");
    }

    state.paused = paused;
    moth.classList.toggle("is-captured", paused);
}

function beginMothDeath(moth) {
    const state = mothFlightStates.get(moth);
    if (state === undefined) {
        throw new Error("Cannot animate the death of a moth that has not been initialized.");
    }

    state.paused = true;
    moth.classList.remove("is-captured", "is-disturbed");
    moth.classList.add("is-dying");
    moth.setAttribute("aria-disabled", "true");
    moth.style.pointerEvents = "none";

    const field = moth.closest(".moth-field");
    if (field === null) {
        throw new Error("The dying moth is not inside the moth field.");
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        moth.remove();
        field.dispatchEvent(new CustomEvent("mothdeathcomplete", { detail: { moth } }));
        return;
    }

    const mothBounds = moth.getBoundingClientRect();
    const fieldBounds = field.getBoundingClientRect();
    const particles = document.createElement("span");
    particles.className = "moth-particles";
    particles.style.left = `${mothBounds.left - fieldBounds.left + mothBounds.width / 2}px`;
    particles.style.top = `${mothBounds.top - fieldBounds.top + mothBounds.height / 2}px`;

    for (let index = 0; index < 14; index += 1) {
        const particle = document.createElement("span");
        const angle = (Math.PI * 2 * index) / 14 + (Math.random() - 0.5) * 0.55;
        const distance = 14 + Math.random() * 27;
        particle.className = "moth-particle";
        particle.style.setProperty("--particle-x", `${Math.cos(angle) * distance}px`);
        particle.style.setProperty("--particle-y", `${Math.sin(angle) * distance}px`);
        particle.style.setProperty("--particle-delay", `${Math.random() * 0.22}s`);
        particles.append(particle);
    }

    field.append(particles);
    mothDeathParticles.set(moth, particles);
    const timer = window.setTimeout(() => {
        particles.remove();
        moth.remove();
        mothDeathTimers.delete(moth);
        mothDeathParticles.delete(moth);
        field.dispatchEvent(new CustomEvent("mothdeathcomplete", { detail: { moth } }));
    }, 1600);
    mothDeathTimers.set(moth, timer);
}

function resurrectMoth(moth) {
    const timer = mothDeathTimers.get(moth);
    if (timer !== undefined) {
        window.clearTimeout(timer);
        mothDeathTimers.delete(moth);
    }

    mothDeathParticles.get(moth)?.remove();
    mothDeathParticles.delete(moth);
    moth.classList.remove("is-dying", "is-hidden");
    moth.removeAttribute("aria-hidden");
    moth.removeAttribute("aria-disabled");
    moth.removeAttribute("tabindex");
    moth.style.pointerEvents = "";
    setMothFlightPaused(moth, false);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        moth.classList.remove("is-resurrecting");
        return;
    }

    moth.classList.remove("is-resurrecting");
    void moth.offsetWidth;
    moth.classList.add("is-resurrecting");
    moth.addEventListener("animationend", () => {
        moth.classList.remove("is-resurrecting");
    }, { once: true });
}

function initializeMothFlight(moths) {
    const field = document.querySelector(".moth-field");
    const keeper = document.querySelector(".keeper");
    if (field === null || keeper === null) {
        throw new Error("The character or moth cluster is missing from index.html.");
    }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const pointerMotion = window.matchMedia("(hover: hover) and (pointer: fine)");
    const cursor = { x: 0, y: 0, active: false };
    const states = moths.map((moth, index) => {
        const settings = mothClusterSettings[index % mothClusterSettings.length];
        const state = {
            moth,
            restX: settings.x / 100,
            restY: settings.y / 100,
            scale: settings.scale,
            rotation: settings.rotation,
            phase: index * 1.73,
            wingDuration: settings.wingDuration,
            x: 0,
            y: 0,
            velocityX: 0,
            velocityY: 0,
            baseX: 0,
            baseY: 0,
            paused: false,
            pointerOver: false,
            focused: false,
            disturbedUntil: 0
        };
        mothFlightStates.set(moth, state);

        moth.style.left = `${settings.x}%`;
        moth.style.top = `${settings.y}%`;
        moth.style.setProperty("--moth-scale", String(settings.scale));
        moth.style.setProperty("--moth-rotation", `${settings.rotation}deg`);
        moth.style.setProperty("--wing-duration", `${settings.wingDuration}s`);
        moth.style.setProperty("--wing-delay", `${-(index % 4) * 0.17}s`);
        moth.style.setProperty("--wing-angle", `${7 + index % 4}deg`);
        moth.style.willChange = "transform";
        moth.addEventListener("pointerenter", () => {
            state.pointerOver = true;
        });
        moth.addEventListener("pointerleave", () => {
            state.pointerOver = false;
        });
        moth.addEventListener("focus", () => {
            state.focused = true;
        });
        moth.addEventListener("blur", () => {
            state.focused = false;
        });

        return state;
    });

    function updateRestingPositions() {
        const bounds = field.getBoundingClientRect();
        const density = Number.parseFloat(
            getComputedStyle(document.documentElement).getPropertyValue("--cluster-density")
        ) || 1;
        states.forEach((state) => {
            const x = 0.5 + (state.restX - 0.5) * density;
            const y = 0.5 + (state.restY - 0.5) * density;
            state.baseX = bounds.left + bounds.width * x;
            state.baseY = bounds.top + bounds.height * y;
        });
    }

    updateRestingPositions();
    window.addEventListener("resize", updateRestingPositions, { passive: true });
    const characterImage = keeper.querySelector("img");
    if (characterImage !== null && !characterImage.complete) {
        characterImage.addEventListener("load", updateRestingPositions, { once: true });
    }
    if ("ResizeObserver" in window) {
        new ResizeObserver(updateRestingPositions).observe(keeper);
    }
    window.addEventListener("pointermove", (event) => {
        if (!pointerMotion.matches || event.pointerType !== "mouse") {
            return;
        }
        cursor.x = event.clientX;
        cursor.y = event.clientY;
        cursor.active = true;
    }, { passive: true });
    window.addEventListener("pointerout", (event) => {
        if (event.relatedTarget === null) {
            cursor.active = false;
        }
    }, { passive: true });

    const rootStyle = getComputedStyle(document.documentElement);
    const repulsionRadius = Number.parseFloat(rootStyle.getPropertyValue("--repulsion-radius")) || 110;
    const repulsionStrength = Number.parseFloat(rootStyle.getPropertyValue("--repulsion-strength")) || 24;
    const maxDisplacement = Number.parseFloat(rootStyle.getPropertyValue("--max-moth-displacement")) || 28;
    const returnSpeed = Number.parseFloat(rootStyle.getPropertyValue("--return-speed")) || 18;
    const damping = 2 * Math.sqrt(returnSpeed);
    let frameId = 0;
    let previousFrame = 0;

    function animate(frameTime) {
        if (previousFrame === 0) {
            previousFrame = frameTime;
        }
        const delta = Math.min((frameTime - previousFrame) / 1000, 0.04);
        previousFrame = frameTime;

        states.forEach((state) => {
            if (
                !state.moth.isConnected ||
                state.paused ||
                state.moth.classList.contains("is-filtered-out")
            ) {
                return;
            }

            const canRepel =
                !reducedMotion.matches &&
                pointerMotion.matches &&
                cursor.active &&
                !state.pointerOver &&
                !state.focused;
            const dx = state.baseX + state.x - cursor.x;
            const dy = state.baseY + state.y - cursor.y;
            const distance = canRepel ? Math.hypot(dx, dy) : Infinity;
            const disturbed = distance < repulsionRadius;
            let targetX = 0;
            let targetY = 0;

            if (disturbed && distance > 0) {
                const proximity = 1 - distance / repulsionRadius;
                const hoverScale = state.pointerOver ? 0.12 : 1;
                const displacement = Math.min(maxDisplacement, repulsionStrength * proximity * 2.6) * hoverScale;
                targetX = (dx / distance) * displacement;
                targetY = (dy / distance) * displacement;
                state.disturbedUntil = frameTime + 220;
            }

            const floatX = reducedMotion.matches ? 0 : Math.sin(frameTime / 1100 + state.phase) * 0.8;
            const floatY = reducedMotion.matches ? 0 : Math.cos(frameTime / 1300 + state.phase) * 0.7;
            targetX += floatX;
            targetY += floatY;

            if (reducedMotion.matches) {
                state.x = targetX;
                state.y = targetY;
                state.velocityX = 0;
                state.velocityY = 0;
            } else {
                state.velocityX += ((targetX - state.x) * returnSpeed - state.velocityX * damping) * delta;
                state.velocityY += ((targetY - state.y) * returnSpeed - state.velocityY * damping) * delta;
                state.x += state.velocityX * delta;
                state.y += state.velocityY * delta;
            }

            const displacement = Math.hypot(state.x, state.y);
            if (displacement > maxDisplacement) {
                const ratio = maxDisplacement / displacement;
                state.x *= ratio;
                state.y *= ratio;
            }

            state.moth.classList.toggle("is-disturbed", frameTime < state.disturbedUntil);
            const flutter =
                !reducedMotion.matches && frameTime < state.disturbedUntil
                    ? Math.sin(frameTime / 18 + state.phase) * 3
                    : 0;
            const idleRotation = reducedMotion.matches ? 0 : Math.sin(frameTime / 1500 + state.phase) * 1.5;
            const angle = state.rotation + idleRotation + flutter;
            state.moth.style.transform =
                `translate3d(${state.x.toFixed(2)}px, ${state.y.toFixed(2)}px, 0) ` +
                `translate(-50%, -50%) rotate(${angle.toFixed(2)}deg) scale(var(--moth-scale))`;
        });

        frameId = window.requestAnimationFrame(animate);
    }

    function startAnimation() {
        if (document.hidden || frameId !== 0) {
            return;
        }
        previousFrame = 0;
        frameId = window.requestAnimationFrame(animate);
    }

    function stopAnimation() {
        if (frameId !== 0) {
            window.cancelAnimationFrame(frameId);
            frameId = 0;
        }
    }

    reducedMotion.addEventListener("change", () => {
        if (!reducedMotion.matches) {
            startAnimation();
        }
    });
    pointerMotion.addEventListener("change", () => {
        cursor.active = false;
    });
    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            stopAnimation();
        } else {
            startAnimation();
        }
    });

    startAnimation();
}
