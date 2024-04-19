/*
   This extension was made with TurboBuilder!
   https://turbobuilder-steel.vercel.app/
*/
(async function(Scratch) {
    const variables = {};
    const blocks = [];
    const menus = [];


    if (!Scratch.extensions.unsandboxed) {
        alert("This extension needs to be unsandboxed to run!")
        return
    }

    function doSound(ab, cd, runtime) {
        const audioEngine = runtime.audioEngine;

        const fetchAsArrayBufferWithTimeout = (url) =>
            new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                let timeout = setTimeout(() => {
                    xhr.abort();
                    reject(new Error("Timed out"));
                }, 5000);
                xhr.onload = () => {
                    clearTimeout(timeout);
                    if (xhr.status === 200) {
                        resolve(xhr.response);
                    } else {
                        reject(new Error(`HTTP error ${xhr.status} while fetching ${url}`));
                    }
                };
                xhr.onerror = () => {
                    clearTimeout(timeout);
                    reject(new Error(`Failed to request ${url}`));
                };
                xhr.responseType = "arraybuffer";
                xhr.open("GET", url);
                xhr.send();
            });

        const soundPlayerCache = new Map();

        const decodeSoundPlayer = async (url) => {
            const cached = soundPlayerCache.get(url);
            if (cached) {
                if (cached.sound) {
                    return cached.sound;
                }
                throw cached.error;
            }

            try {
                const arrayBuffer = await fetchAsArrayBufferWithTimeout(url);
                const soundPlayer = await audioEngine.decodeSoundPlayer({
                    data: {
                        buffer: arrayBuffer,
                    },
                });
                soundPlayerCache.set(url, {
                    sound: soundPlayer,
                    error: null,
                });
                return soundPlayer;
            } catch (e) {
                soundPlayerCache.set(url, {
                    sound: null,
                    error: e,
                });
                throw e;
            }
        };

        const playWithAudioEngine = async (url, target) => {
            const soundBank = target.sprite.soundBank;

            let soundPlayer;
            try {
                const originalSoundPlayer = await decodeSoundPlayer(url);
                soundPlayer = originalSoundPlayer.take();
            } catch (e) {
                console.warn(
                    "Could not fetch audio; falling back to primitive approach",
                    e
                );
                return false;
            }

            soundBank.addSoundPlayer(soundPlayer);
            await soundBank.playSound(target, soundPlayer.id);

            delete soundBank.soundPlayers[soundPlayer.id];
            soundBank.playerTargets.delete(soundPlayer.id);
            soundBank.soundEffects.delete(soundPlayer.id);

            return true;
        };

        const playWithAudioElement = (url, target) =>
            new Promise((resolve, reject) => {
                const mediaElement = new Audio(url);

                mediaElement.volume = target.volume / 100;

                mediaElement.onended = () => {
                    resolve();
                };
                mediaElement
                    .play()
                    .then(() => {
                        // Wait for onended
                    })
                    .catch((err) => {
                        reject(err);
                    });
            });

        const playSound = async (url, target) => {
            try {
                if (!(await Scratch.canFetch(url))) {
                    throw new Error(`Permission to fetch ${url} denied`);
                }

                const success = await playWithAudioEngine(url, target);
                if (!success) {
                    return await playWithAudioElement(url, target);
                }
            } catch (e) {
                console.warn(`All attempts to play ${url} failed`, e);
            }
        };

        playSound(ab, cd)
    }
    class Extension {
        getInfo() {
            return {
                "blockIconURI": "data:image/svg+xml;base64,PHN2ZyBpZD0iZUFKWGQ1TnI3UzExIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2aWV3Qm94PSIwIDAgNzQuODk1MzggNjEuMjMxMjMiIHNoYXBlLXJlbmRlcmluZz0iZ2VvbWV0cmljUHJlY2lzaW9uIiB0ZXh0LXJlbmRlcmluZz0iZ2VvbWV0cmljUHJlY2lzaW9uIj48ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMjAyLjU1Mi0xNDkuMzg0KSI+PGc+PHBhdGggZD0iTTIyNy44NzQ0MiwxNDkuNTI1MDdjMS40ODk1NiwwLDMuMDI1MjMtLjMxNjU0LDQuNDY4NjEsMGM0LjA1MjI3LDEuMzk2NDIsOS43MzExLDEuMzI3OTIsMTIuMjg4NjgsNS4wMjcxNWMxLjc1MDE2LDIuMzU3OS0uODQzMDgsNi4xNjE0My0yLjYwNjcxLDguNTY0ODItMS4yMDIwOCwxLjYzNzcyLTQuNjcxMTcsMi4yMTk0My01LjU4NTc2LDIuNDIwNTEtLjQ2OTE5LjIwNTU4LDIuNzI1MTItMS44OTk5NCwyLjQyMDUxLTEuNDg5NTYtLjUwNzk0LjY2ODgtMi40MjUsMy41OTA1MS00LjI4MjQxLDQuMDk2Mi0xLjE5NTM0LjMyNy0yLjAwNTY0LTIuNzc0MjUtMi45NzkwNS0yLjIzNDI0LTExLjk5OTczLS4yNjA2Ny0xNy41OTgxMiwyMS45MjU5NC01LjIxMzQzLDI0LjU3NzNjNS4yNDAyNC0yLjk1MjI0LDEzLjEzMjUzLTMuMjUyNDMsMTcuMTI5Ny03LjQ0NzY2YzQuMTYzMjMuNTU0MTIsNS4wNjgxNCw0Ljk0MjMsNS45NTgxLDguMTkyNDEuMzQ1NiwxLjI4ODQ4LTIuNzA3OTksMS40NjUtMy4zNTE0NiwyLjc5MjkyLS42OTYzMiwxLjg4NzI0LDEuMjI4ODksNC43NjcyNS0uMzcyMzQsNi4xNDQzMS0zLjQ1OCwyLjk3MTYxLTkuMTcxODYsMi44ODc0Ni0xMi42NjEwOSw1LjIxMzM2LTQuMTk3NDguMjEyMzEtOC40NDA0NSwwLTEyLjY2MTAyLDAtMTAuOTg2OC0xLjkyMjE5LTE3LjE0NjA2LTguNjcyNzYtMTcuODc0NDUtMjAuODUzNWMwLTIuMjM0MzEsMC00LjQ2ODU0LDAtNi43MDI4NWM1LjMwNTAyLTEyLjU2OTUsMTEuMjMxMTItMjQuNTE3NzgsMjUuMzIyMTEtMjguMzAxMTZabS04LjkzNzIyLDUuOTU4MWMtNS4xNjk0MiwzLjM1MjIzLTYuODkxMywxMC4zMjM5Ni0xMC40MjY3MSwxMy40MDU4NC0xLjg5MjUsMjEuMzU1NDcsNy45ODk4NSwzNC4yMzAyOCwyNi44MTE2LDI4LjMwMTE2YzQuMjg2MTMtMS4zNDk1NCwxMC4xNzY1LTUuMTQwMzYsMTEuMTcxNTMtOC4xOTI0OC0yLjE4NTg4LTUuNDY2NTktNS41MTI3Ny0uNTY2NzUtOC45MzcyMi43NDQ4Mi03LjY4NTI0LS40ODYzOS04LjYxNjk2LDQuNDYwNC0xNC44OTUzMywyLjIzNDMxLTkuMDU3ODctMy4yMTIyMS05LjU2MjA5LTIzLjg0OTc1LTMuNzIzODctMjkuNzkwNzJjNi41NDg3OS02LjY2MzQ3LDEzLjIxMTQyLTEuMzMzMTIsMjIuMzQzMDYtMi4yMzQzMS0uNTU0ODktMi4yOTI0MiwyLjA0NDM4LTEuNDMxNDUsMS40ODk0OS0zLjcyMzg3LTMuNzQzOTQtNi4yNzA5Mi0xNy43MTcyMy00LjcxMDYxLTIzLjgzMjU1LS43NDQ3NVoiIGZpbGw9IiMzNTE4NDMiIHN0cm9rZS13aWR0aD0iMS4wNjExMyIgc3Ryb2tlLW1pdGVybGltaXQ9IjEwIi8+PHBhdGggZD0iTTI0NS43NjQzOCwxNTQuMzQ1M2MyLjcyNjg4LS40OTM1Nyw1LjUxMDk4LS42NDg5OSw4LjI2Njc0LS45NzM1MmMxMy45Njk3OS0xLjUxNzAxLDIwLjQzMjMsMTQuNDY5OCwxMS43MDgyNSwyMy4xNjY3N2MzLjc4MDY3LDQuOTM2MjQsNi4wOTI3NCwxMS43MzMwNiwxMC44MDQzMywxNS40OTA0MS4wOTI2OS43ODcxLjE4NTQ2LDEuNTc0ODMuMjc4MTUsMi4zNjE5NC0uOTczMTYtLjA1MzU5LS45NTEwNi42Nzc3OS0xLjcwMTkzLjc5OTA4LjI0MzI2LDEuNTAwOTYsMS4zMjU3NiwxLjkzOTI3LDIuMTE5MTYsMi43NDM4Ni4wNjk1NC41OTA0Ny4xMzkwNywxLjE4MDkzLjIwODYxLDEuNzcxNC0zLjczNTY3LDEuNjkzLTYuMDM2NDIsNC41MTkwNi05LjQxMjM3LDYuNDk2NDgtNC4zNzA4Ni01LjA5MzU5LTYuNDY1NjktMTMuMDcwMjYtMTEuMDgyNDgtMTcuODUyMzUtMi40OTUxMywzLjczNzM2LDEuODc5MDksOS44MTQ4NiwxLjczODQ0LDE0Ljc2MjA4LS4wMzU2OSwxLjIzNjg1LTEuODI0MDcuMzc2NDQtMi4xNjkwMywxLjE1MzQ1LS41NjY1OCwxLjE1MjA5LjgzODM2LDMuMDY3MDYtLjIyNzA3LDMuOTE4MTEtMi4wMzY1OSwxLjYyMjE3LTUuNjQ3MzkuODk4NDktNy41MzcyLDIuMDg0OTItLjk4NDMuMTE1OTEtMS45NjgwNC4yMzE3Ni0yLjk1MjQuMzQ3NjktNC4xOTg4Ny0xNi43MzM1My01LjcxMTA4LTMwLjE3NDYyLTkuNTU3MzQtNDUuNTcwODgtLjExNTkyLS45ODQzNy0uODk2NzYtMi4xMjk4Ni0uMzQ3Ny0yLjk1MjQ3Ljg0MzgyLTEuMjUzNTcsMy4wODU2OS0xLjEzMjY0LDMuODM3OTQtMi40ODc0NC42MDU5Mi0xLjAwMTExLTEuMjc1NTUtMi43MTc5Ny0uMzU4MTgtMy41NDk4MmMxLjYzMTc5LTEuNDc1Nyw0LjM4MjM1LTEuMTQ4MzEsNi4zODQwOC0xLjcwOTY5Wm0xNC41ODg3NywxLjg3Mzk4Yy01LjU4ODk2LjExODgyLTEzLjA3OTMzLTEuNzgwNTYtMTguODk1NDIsMi4yMjUyYzQuNTg1ODksMTcuNjEwNDksNC4yMDAwNCwzMC41NDA1Niw4LjgyNzczLDQ0LjQ1OTQ5YzIuNTMyODYtLjMyMTYsNC4yNTcwNy0xLjI4MTk2LDUuNjk2Mi0yLjQ2Njc3LTEuODI5OTgtNy45MzQyMi03Ljg4OTU0LTE4LjQ1NTkyLDMuMDE5NjYtMjAuMTExOGMyLjM4NjI3LDYuOTI4NzgsNy41OTU2NSwxMC4yODIwOCwxMC4zNTI4NywxNi43NDA5NmMxLjk1NTExLTEuMTM0ODMsNC4wMzc2Mi0yLjE2OTEyLDQuODk3MTEtNC4xNjg3OC00LjUxNTg4LTQuNjgzMTYtNy43MjE3NC0xMS4wMjY5NS0xMS41MzM4Ny0xNi42MDE4OGM2LjAxMTQyLTQuODE4MzgsNi4xNDUwNy0xNy40NDk5OC0yLjM2NDI4LTIwLjA3NjQyWiIgZmlsbD0iIzM1MTg0MyIgc3Ryb2tlLXdpZHRoPSIwLjg0NzEzIiBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiLz48cGF0aCBkPSJNMjYyLjcxNzQzLDE3Ni4yOTU3YzMuODEyMTQsNS41NzQ5NCw3LjAxOCwxMS45MTg3MiwxMS41MzM4NywxNi42MDE4OC0uODU5NDksMS45OTk2Ni0yLjk0MTk5LDMuMDMzOTQtNC44OTcxMSw0LjE2ODc4LTIuNzU3MjMtNi40NTg4OC03Ljk2NjYtOS44MTIxOC0xMC4zNTI4Ny0xNi43NDA5Ni0xMC45MDkyLDEuNjU1ODgtNC44NDk2NSwxMi4xNzc1OC0zLjAxOTY2LDIwLjExMTgtMS40MzkxMiwxLjE4NDgxLTMuMTYzMzQsMi4xNDUxNy01LjY5NjIsMi40NjY3Ny00LjYyNzY5LTEzLjkxODk0LTQuMjQxODQtMjYuODQ5LTguODI3NzMtNDQuNDU5NDljNS44MTYwOS00LjAwNTc2LDEzLjMwNjQ2LTIuMTA2MzgsMTguODk1NDItMi4yMjUyYzguNTA5MzUsMi42MjY0NSw4LjM3NTcsMTUuMjU4MDUsMi4zNjQyOCwyMC4wNzY0MlptLTE0LjkzNzY2LTE1LjAwMzY2YzEuODQxNjksNi45NDU2NCwxLjczNzEsMTAuODA1NTcsMy43MTg1MiwxNi4zMjQ4N2M2LjQxNTk4LTIuNjEyNiwxMS43OTcwNC02LjA0Mjc1LDExLjUzMDMyLTEzLjkyOTk3LTIuOTEzNzEtMy40MzE0OS05LjUyNTYtNC42NTI0MS0xNS4yNDg4NC0yLjM5NDg5WiIgZmlsbD0iI2I3NmVkOCIgc3Ryb2tlLXdpZHRoPSIwLjg0NzEzIiBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiLz48cGF0aCBkPSJNMjYzLjAyODYxLDE2My42ODY5NGMuMjY2NzEsNy44ODcyMi01LjExNDM0LDExLjMxNzM4LTExLjUzMDMyLDEzLjkyOTk3LTEuOTgxNDItNS41MTkyOS0xLjg3NjgzLTkuMzc5MjMtMy43MTg1Mi0xNi4zMjQ4N2M1LjcyMzI0LTIuMjU3NTIsMTIuMzM1MTMtMS4wMzY1OSwxNS4yNDg4NCwyLjM5NDg5Wm0tMTAuNjk3MDgsMTAuODM4NDljMi42MTQ1Ni0xLjg2NDQzLDcuMjAzOTgtMi4xNjk2NCw1LjczMDQzLTcuMjYwMTktMS42MDM0Ny0xLjEzNTQ4LTQuMTM0MTUtMS4wOTU0Ny02LjcwMzk2LTEuMDA2NTUuMzI0NTMsMi43NTU3Ny42NDg5OSw1LjUxMDk4Ljk3MzUyLDguMjY2NzRaIiBmaWxsPSIjMzUxODQzIiBzdHJva2Utd2lkdGg9IjAuODQ3MTMiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIvPjxwYXRoIGQ9Ik0yNDIuNzY5NzUsMTU2LjIyNzkyYzIuMDI0ODEzLDMuNDY4MzU5LS4wNjg1NjcsMy4wMTIxMDItMS40ODk0OSwzLjcyMzg3LTkuMTMxNjQuOTAxMTktMTUuNzk0MjctNC40MjkxNy0yMi4zNDMwNiwyLjIzNDMxLTUuODM4MjIsNS45NDA5OC01LjMzNDAxLDI2LjU3ODUxLDMuNzIzODcsMjkuNzkwNzJjNi4yNzgzNiwyLjIyNjA5LDcuMjEwMDgtMi43MjA3LDE0Ljg5NTMzLTIuMjM0MzFjMy40MjQ0NS0xLjMxMTU3LDYuNzUxMzUtNi4yMTE0LDguOTM3MjItLjc0NDgyLS45OTUwMywzLjA1MjEyLTYuODg1NCw2Ljg0Mjk0LTExLjE3MTUzLDguMTkyNDgtMTguODIxNzUsNS45MjkxMi0yOC43MDQxLTYuOTQ1NjktMjYuODExNi0yOC4zMDExNmMzLjUzNTQyLTMuMDgxODcsNS4yNTcyOS0xMC4wNTM2LDEwLjQyNjcxLTEzLjQwNTg0YzYuMTE1MzItMy45NjU4NywyMC4wODg2MS01LjUyNjE4LDIzLjgzMjU1Ljc0NDc1WiIgZmlsbD0iI2I3NmVkOCIgc3Ryb2tlLXdpZHRoPSIxLjA2MTEzIiBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiLz48L2c+PC9nPjwvc3ZnPg0K",
                "id": "chattle",
                "name": "Chattle",
                "color1": "#b76ed8",
                "color2": "#843ba5",
                "tbShow": true,
                "blocks": blocks
            }
        }
    }
    blocks.push({
        opcode: `ask_if_sure`,
        blockType: Scratch.BlockType.BOOLEAN,
        text: `confirm`,
        arguments: {
            "InputForConfirm": {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'Are you sure you want to do this?',
            },
        },
        disableMonitor: true
    });
    Extension.prototype[`ask_if_sure`] = async (args, util) => {
        return confirm('Are you sure you want to do this?')
    };

    blocks.push({
        opcode: `upload_image_link`,
        blockType: Scratch.BlockType.REPORTER,
        text: `upload image (link)`,
        arguments: {
            "InputForImage": {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'https://scratch.mit.edu/svgs/intro/video-image.svg',
            },
        },
        disableMonitor: true
    });
    Extension.prototype[`upload_image_link`] = async (args, util) => {
        return prompt('Input image URL')
    };

    blocks.push({
        opcode: `invalid_url`,
        blockType: Scratch.BlockType.COMMAND,
        text: `invalid URL`,
        arguments: {
            "InputForInvalid": {
                type: Scratch.ArgumentType.STRING,
                defaultValue: 'This URL is invalid!',
            },
        },
        disableMonitor: true
    });
    Extension.prototype[`invalid_url`] = async (args, util) => {
        alert('This URL is invalid!')
    };

    Scratch.extensions.register(new Extension());
})(Scratch);